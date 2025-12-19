"""
CrashLens Backend API
Production-ready FastAPI application for traffic incident monitoring
Uses cloud storage (Firebase/Supabase) instead of local databases
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, timezone
import httpx
import os
from dotenv import load_dotenv
import redis.asyncio as redis
import json
import math
from contextlib import asynccontextmanager

load_dotenv()

# Redis for caching (optional, falls back to in-memory)
redis_client = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle: startup and shutdown."""
    # Startup
    global redis_client
    redis_url = os.getenv("REDIS_URL")
    if redis_url:
        try:
            client = await redis.from_url(redis_url)
            try:
                await client.ping()
                redis_client = client
                print("✓ Connected to Redis cache")
            except Exception as e:
                redis_client = None
                print(f"⚠ Redis not reachable, disabling cache: {e}")
        except Exception as e:
            print(f"⚠ Redis not available: {e}")
    
    yield
    
    # Shutdown
    if redis_client:
        await redis_client.close()


app = FastAPI(
    title="CrashLens API",
    description="Real-time traffic incident monitoring and prediction",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# HERE API Configuration
HERE_API_KEY = os.getenv("HERE_API_KEY")
HERE_API_BASE = "https://data.traffic.hereapi.com/v7"

# Supabase/Firebase configuration (choose one)
STORAGE_TYPE = os.getenv("STORAGE_TYPE", "supabase")  # or "firebase"
STORAGE_URL = os.getenv("STORAGE_URL")
STORAGE_KEY = os.getenv("STORAGE_KEY")


# Models
class IncidentRequest(BaseModel):
    bbox: str  # Bounding box: "minLon,minLat,maxLon,maxLat"
    criticality: Optional[str] = None


class RiskAnalysisRequest(BaseModel):
    latitude: float
    longitude: float
    radius: int = 5000  # meters


class Incident(BaseModel):
    id: str
    type: str
    description: str
    latitude: float
    longitude: float
    severity: int
    criticality: str
    start_time: datetime
    end_time: Optional[datetime]
    road_name: Optional[str]
    location_name: Optional[str]
    length: Optional[float]


# Storage abstraction layer
class StorageAdapter:
    """Abstract storage layer for cloud providers"""

    def _is_configured(self) -> bool:
        return bool(STORAGE_URL and STORAGE_KEY and STORAGE_TYPE in {"supabase", "firebase"})
    
    async def save_incident(self, incident: Dict[str, Any]) -> bool:
        """Save incident to cloud storage"""
        if not self._is_configured():
            return True  # skip silently when storage not configured
        if STORAGE_TYPE == "supabase":
            return await self._save_to_supabase(incident)
        if STORAGE_TYPE == "firebase":
            return await self._save_to_firebase(incident)
        # In-memory fallback (not production-ready)
        return True
    
    async def get_incidents(self, filters: Dict[str, Any]) -> List[Dict]:
        """Retrieve incidents from cloud storage"""
        if not self._is_configured():
            return []
        if STORAGE_TYPE == "supabase":
            return await self._get_from_supabase(filters)
        if STORAGE_TYPE == "firebase":
            return await self._get_from_firebase(filters)
        return []
    
    async def _save_to_supabase(self, incident: Dict[str, Any]) -> bool:
        """Save to Supabase"""
        async with httpx.AsyncClient() as client:
            headers = {
                "apikey": STORAGE_KEY,
                "Authorization": f"Bearer {STORAGE_KEY}",
                "Content-Type": "application/json"
            }
            response = await client.post(
                f"{STORAGE_URL}/rest/v1/incidents",
                json=incident,
                headers=headers
            )
            return response.status_code == 201
    
    async def _get_from_supabase(self, filters: Dict[str, Any]) -> List[Dict]:
        """Retrieve from Supabase"""
        async with httpx.AsyncClient() as client:
            headers = {
                "apikey": STORAGE_KEY,
                "Authorization": f"Bearer {STORAGE_KEY}"
            }
            response = await client.get(
                f"{STORAGE_URL}/rest/v1/incidents",
                params=filters,
                headers=headers
            )
            if response.status_code == 200:
                return response.json()
            return []
    
    async def _save_to_firebase(self, incident: Dict[str, Any]) -> bool:
        """Save to Firebase Firestore"""
        # Implementation for Firebase
        pass
    
    async def _get_from_firebase(self, filters: Dict[str, Any]) -> List[Dict]:
        """Retrieve from Firebase Firestore"""
        # Implementation for Firebase
        pass


storage = StorageAdapter()


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "CrashLens API",
        "status": "operational",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    health = {
        "status": "healthy",
        "checks": {
            "api": "ok",
            "here_api": "ok" if HERE_API_KEY else "missing_key",
            "storage": "ok" if STORAGE_URL and STORAGE_KEY else "not_configured",
            "cache": "ok" if redis_client else "disabled"
        }
    }
    return health


@app.get("/api/incidents", response_model=List[Incident])
async def get_incidents(
    bbox: str,
    criticality: Optional[str] = None,
    background_tasks: BackgroundTasks = None
):
    """
    Get real-time traffic incidents from HERE API
    
    Args:
        bbox: Bounding box as "minLon,minLat,maxLon,maxLat"
        criticality: Filter by criticality (major, minor, critical)
    """
    # Basic validation
    if not HERE_API_KEY:
        raise HTTPException(status_code=500, detail="HERE_API_KEY is not configured")

    parts = bbox.split(",") if bbox else []
    if len(parts) != 4:
        raise HTTPException(status_code=400, detail="Invalid bbox. Expected 'minLon,minLat,maxLon,maxLat'")

    criticality_filter = criticality
    cache_key = f"incidents:{bbox}:{criticality_filter}"
    
    # Check cache first
    global redis_client
    if redis_client:
        try:
            cached = await redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
        except Exception as e:
            # Disable cache on connection errors during runtime
            redis_client = None
            print(f"⚠ Redis error, disabling cache: {e}")
    
    # Fetch from HERE API
    try:
        async with httpx.AsyncClient() as client:
            params = {
                "apiKey": HERE_API_KEY,
                "in": f"bbox:{bbox}",
                "locationReferencing": "shape"
            }
            if criticality_filter:
                params["criticality"] = criticality_filter
            
            response = await client.get(
                f"{HERE_API_BASE}/incidents",
                params=params,
                timeout=10.0
            )
            response.raise_for_status()
            data = response.json()
        
        # Transform HERE data to our format
        def _extract_text(value: Any) -> Optional[str]:
            """Extract human-readable text from HERE API fields with multiple shapes."""
            if isinstance(value, dict):
                return value.get("value") or value.get("label") or value.get("name")
            if isinstance(value, list):
                for candidate in value:
                    text = _extract_text(candidate)
                    if text:
                        return text
            if isinstance(value, str):
                return value
            return None

        incidents = []
        for item in data.get("results", []):
            location = item.get("location", {}) or {}
            details = item.get("incidentDetails", {}) or {}

            # Extract coordinates with fallbacks (shape -> displayPoint -> origin)
            lat, lng = None, None
            try:
                shape = location.get("shape", {})
                links = shape.get("links", [])
                if links:
                    points = links[0].get("points", [])
                    if points:
                        lat = points[0].get("lat")
                        lng = points[0].get("lng")
            except (IndexError, TypeError, KeyError):
                pass

            if lat is None or lng is None:
                display_point = location.get("displayPoint", {})
                lat = lat if lat is not None else display_point.get("lat")
                lng = lng if lng is not None else display_point.get("lng")

            if lat is None or lng is None:
                origin = location.get("origin", {})
                lat = lat if lat is not None else origin.get("lat")
                lng = lng if lng is not None else origin.get("lng")

            lat = lat if lat is not None else 0
            lng = lng if lng is not None else 0

            # Extract descriptive fields
            criticality_raw = details.get("criticality", "minor")
            criticality_label = criticality_raw.lower() if isinstance(criticality_raw, str) else "minor"

            incident_type = details.get("type", item.get("type", "unknown"))
            description = _extract_text(details.get("description")) or _extract_text(item.get("description")) or ""

            start_time = details.get("startTime", datetime.now(timezone.utc).isoformat())
            end_time = details.get("endTime", "")

            length = location.get("length", 0)

            # Location naming: prefer explicit road or description, fallback to coordinates string
            location_name = (
                _extract_text(location.get("description"))
                or _extract_text(location.get("displayPoint", {}).get("description"))
                or _extract_text(details.get("description"))
            )

            road_name = (
                _extract_text(location.get("roadName"))
                or _extract_text(location.get("primaryLocation", {}).get("roadName"))
                or _extract_text(location.get("primaryLocation", {}).get("address"))
                or location_name
            )

            severity_map = {"critical": 3, "major": 2, "minor": 1, "low": 0}
            severity = severity_map.get(criticality_label, 0)

            incident_data = {
                "id": details.get("id", item.get("incidentId", "")),
                "type": incident_type,
                "description": description,
                "latitude": lat,
                "longitude": lng,
                "severity": severity,
                "criticality": criticality_label,
                "start_time": start_time,
                "end_time": end_time,
                "road_name": road_name,
                "location_name": location_name,
                "length": length
            }
            try:
                incidents.append(Incident(**incident_data))
            except Exception as e:
                print(f"⚠ Failed to parse incident {item.get('incidentId')}: {e}")
                print(f"  Raw data: {item}")
            
            # Save to cloud storage in background
            if background_tasks:
                background_tasks.add_task(storage.save_incident, incident_data)
        
        # Cache results
        if redis_client:
            try:
                await redis_client.setex(
                    cache_key,
                    300,  # 5 minutes
                    json.dumps([i.dict() for i in incidents], default=str)
                )
            except Exception as e:
                print(f"⚠ Redis error while caching, disabling cache: {e}")
                redis_client = None
        
        return incidents
    
    except httpx.HTTPError as e:
        # Surface more helpful error details when possible
        message = str(e)
        try:
            if e.response is not None:
                payload = e.response.json()
                message = payload.get("title") or payload.get("error_description") or message
        except Exception:
            pass
        raise HTTPException(status_code=502, detail=f"HERE API error: {message}")


@app.get("/api/traffic-flow")
async def get_traffic_flow(
    bbox: str,
    max_points: int = 100
):
    """
    Get real-time traffic flow data
    
    Args:
        bbox: Bounding box as "minLon,minLat,maxLon,maxLat"
        max_points: Maximum number of data points to return
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{HERE_API_BASE}/flow",
                params={
                    "apiKey": HERE_API_KEY,
                    "in": f"bbox:{bbox}",
                    "locationReferencing": "shape"
                },
                timeout=10.0
            )
            response.raise_for_status()
            data = response.json()
            
            # Limit response size
            results = data.get("results", [])[:max_points]
            
            return {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "count": len(results),
                "results": results
            }
    
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Traffic flow API error: {str(e)}")


@app.post("/api/risk-analysis")
async def analyze_risk(request: RiskAnalysisRequest):
    """
    Analyze traffic risk for a specific location
    
    This is a simplified risk analysis. In production, you'd integrate
    ML models or more sophisticated algorithms.
    """
    # Calculate bounding box from center point and radius
    # Rough approximation: 1 degree ≈ 111km
    lat_offset = (request.radius / 111000)
    lon_offset = (request.radius / (111000 * abs(math.cos(math.radians(request.latitude)))))
    
    bbox = f"{request.longitude - lon_offset},{request.latitude - lat_offset},{request.longitude + lon_offset},{request.latitude + lat_offset}"
    
    # Get incidents in area
    incidents = await get_incidents(bbox)
    
    # Calculate risk score (0-100)
    risk_score = min(len(incidents) * 10, 100)
    
    # Categorize risk
    if risk_score < 30:
        risk_level = "low"
    elif risk_score < 70:
        risk_level = "moderate"
    else:
        risk_level = "high"
    
    return {
        "location": {
            "latitude": request.latitude,
            "longitude": request.longitude,
            "radius": request.radius
        },
        "risk_score": risk_score,
        "risk_level": risk_level,
        "incident_count": len(incidents),
        "incidents": incidents,
        "analysis_time": datetime.utcnow().isoformat()
    }


@app.get("/api/analytics/summary")
async def get_analytics_summary(bbox: Optional[str] = None):
    """
    Get summary analytics.

    Priority:
    1) Use configured storage if available.
    2) Fallback to live HERE incidents for provided bbox (or ANALYTICS_BBOX env).
    3) Return empty aggregates instead of 500s.
    """

    incidents: List[Dict[str, Any]] = []

    # Try storage first (if configured)
    try:
        filters = {
            "start_time": f"gte.{(datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()}"
        }
        incidents = await storage.get_incidents(filters)
    except Exception as exc:
        print(f"⚠ Analytics storage fetch failed: {exc}")
        incidents = []

    # Fallback to live HERE API when storage is empty/missing
    if not incidents:
        fallback_bbox = bbox or os.getenv("ANALYTICS_BBOX")
        if fallback_bbox:
            try:
                live_incidents = await get_incidents(fallback_bbox)  # reuse existing handler
                incidents = [i.dict() if hasattr(i, "dict") else i for i in live_incidents]
            except Exception as exc:
                print(f"⚠ Analytics live fallback failed: {exc}")
                incidents = []

    # Calculate statistics
    total_incidents = len(incidents)
    by_severity: Dict[str, int] = {}
    by_type: Dict[str, int] = {}
    
    for incident in incidents:
        severity = incident.get("criticality", "unknown")
        by_severity[severity] = by_severity.get(severity, 0) + 1
        
        inc_type = incident.get("type", "unknown")
        by_type[inc_type] = by_type.get(inc_type, 0) + 1
    
    return {
        "period": "24h",
        "total_incidents": total_incidents,
        "by_severity": by_severity,
        "by_type": by_type,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": "storage" if incidents and len(incidents) > 0 else "live",
    }


if __name__ == "__main__":
    import uvicorn
    import math
    
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
