import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { SEVERITY_CONFIG } from '../lib/config';
import { formatDateTime } from '../lib/utils';

// Custom marker icons
const createMarkerIcon = (color) => new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
      <path fill="${color}" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 1.9.4 3.7 1.2 5.3L12.5 41l11.3-23.2c.8-1.6 1.2-3.4 1.2-5.3C25 5.6 19.4 0 12.5 0z"/>
      <circle fill="white" cx="12.5" cy="12.5" r="5"/>
    </svg>
  `)}`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

function MapUpdater({ center, zoom }) {
  const map = useMap();
  React.useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

const TrafficMap = React.forwardRef(({ 
  center, 
  zoom, 
  incidents = [], 
  onBoundsChange,
  className = '' 
}, ref) => {
  const mapRef = React.useRef(null);

  React.useImperativeHandle(ref, () => mapRef.current);

  const handleMapMove = (e) => {
    if (onBoundsChange) {
      const bounds = e.target.getBounds();
      onBoundsChange(bounds);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        whenReady={(map) => {
          map.target.on('moveend', handleMapMove);
          // Load initial bounds on map ready
          if (onBoundsChange) {
            const bounds = map.target.getBounds();
            onBoundsChange(bounds);
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater center={center} zoom={zoom} />

        {incidents.map((incident) => {
          const severity = incident.criticality || 'minor';
          const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.minor;
          
          return (
            <Marker
              key={incident.id}
              position={[incident.latitude, incident.longitude]}
              icon={createMarkerIcon(config.color)}
            >
              <Popup>
                <div className="p-2 min-w-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{config.icon}</span>
                    <span className={`badge badge-${severity}`}>
                      {config.label}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{incident.type}</h3>
                  <p className="text-xs text-gray-600 mb-2">{incident.description}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <span>📍</span>
                    <span className="font-medium">({incident.latitude?.toFixed(4)}, {incident.longitude?.toFixed(4)})</span>
                  </div>
                  {incident.length && (
                    <p className="text-xs text-gray-500 mb-1">
                      <strong>Length:</strong> {(incident.length / 1000).toFixed(1)} km
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    <strong>Started:</strong> {formatDateTime(incident.start_time)}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
});

TrafficMap.displayName = 'TrafficMap';
export default TrafficMap;
