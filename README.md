# CrashLens 🚦

**Modern, Production-Ready Traffic Incident Monitoring Platform**

CrashLens is a cloud-native traffic intelligence system built for real-world deployment. Unlike traditional solutions, it uses cloud storage (Supabase/Firebase) instead of local databases, making it scalable, maintainable, and production-ready.

## 🌟 Features

- **Real-Time Traffic Monitoring**: Live incident tracking via HERE Traffic API
- **Interactive Maps**: Dynamic visualization with Leaflet/React Leaflet
- **Advanced Analytics**: Insights and trends with Recharts
- **Cloud-Native**: Supabase or Firebase backend (no local databases)
- **Redis Caching**: Optional performance optimization
- **Docker Support**: One-command deployment
- **Modern Stack**: FastAPI + React + TailwindCSS
- **Production Ready**: Includes Docker, NGINX, and deployment configs

## 🏗️ Architecture

```
crashlens/
├── backend/          # FastAPI REST API
│   ├── app.py       # Main application with cloud storage
│   ├── Dockerfile   # Backend container config
│   └── requirements.txt
├── frontend/         # React + Vite frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route pages
│   │   ├── hooks/       # React Query hooks
│   │   └── lib/         # Utilities and API client
│   ├── Dockerfile   # Frontend container config
│   └── package.json
└── docker-compose.yml  # Full stack deployment
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose (optional)
- HERE API Key ([Get one here](https://developer.here.com/))
- Supabase account ([Sign up](https://supabase.com/)) or Firebase

### Local Development

#### 1. Clone and Configure

```bash
cd crashlens
cp .env.example .env
# Edit .env with your API keys
```

#### 2. Set Up Supabase (Recommended)

Create a Supabase project and run this SQL:

```sql
CREATE TABLE incidents (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  severity INTEGER,
  criticality TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  road_name TEXT,
  length DOUBLE PRECISION,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_incidents_location ON incidents (latitude, longitude);
CREATE INDEX idx_incidents_time ON incidents (start_time);
CREATE INDEX idx_incidents_criticality ON incidents (criticality);
```

#### 3. Start Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your keys
python app.py
```

Backend will run at: http://localhost:8000

#### 4. Start Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend will run at: http://localhost:5173

### 🐳 Docker Deployment

The easiest way to run CrashLens:

```bash
# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access the app at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 🔧 Configuration

### Backend Environment Variables

```env
# Server
PORT=8000
ALLOWED_ORIGINS=http://localhost:5173,https://your-domain.com

# HERE API
HERE_API_KEY=your_key_here

# Storage (Supabase)
STORAGE_TYPE=supabase
STORAGE_URL=https://xxxxx.supabase.co
STORAGE_KEY=your_anon_key

# Optional: Redis Cache
REDIS_URL=redis://localhost:6379

# Optional: Monitoring
SENTRY_DSN=your_sentry_dsn
```

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:8000
```

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

### Get Incidents
```bash
GET /api/incidents?bbox=-86.8,36.1,-86.7,36.2&criticality=major
```

### Traffic Flow
```bash
GET /api/traffic-flow?bbox=-86.8,36.1,-86.7,36.2
```

### Risk Analysis
```bash
POST /api/risk-analysis
{
  "latitude": 36.1627,
  "longitude": -86.7816,
  "radius": 5000
}
```

### Analytics Summary
```bash
GET /api/analytics/summary
```

## 🚢 Production Deployment

### Deploy to Cloud Platform

#### Vercel (Frontend)
```bash
cd frontend
vercel --prod
```

#### Railway (Backend)
```bash
cd backend
railway up
```

#### Digital Ocean (Full Stack)
```bash
# Use docker-compose.yml
# Configure environment variables in dashboard
# Deploy via App Platform
```

### Environment Setup

1. **Storage**: Create Supabase/Firebase project
2. **API Keys**: Get HERE API key
3. **Cache**: Optional Redis instance
4. **Monitoring**: Configure Sentry (optional)

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **httpx**: Async HTTP client
- **Redis**: Caching layer
- **Supabase/Firebase**: Cloud database
- **Pydantic**: Data validation

### Frontend
- **React 18**: UI framework
- **Vite**: Build tool
- **TailwindCSS**: Styling
- **React Query**: Data fetching
- **React Leaflet**: Map visualization
- **Recharts**: Analytics charts
- **Axios**: HTTP client

## 🔍 Key Differences from TrafficWiz

| Feature | TrafficWiz | CrashLens |
|---------|-----------|-----------|
| Database | Local SQLite | Cloud (Supabase/Firebase) |
| Architecture | Monolithic | Microservices-ready |
| Caching | None | Redis support |
| Deployment | Manual | Docker + Cloud platforms |
| Scalability | Limited | Horizontal scaling |
| State Management | Basic | React Query |
| API Documentation | None | Auto-generated (FastAPI) |

## 📊 Features in Detail

### Real-Time Dashboard
- Live incident updates every minute
- Interactive map with custom markers
- Severity-based filtering
- Incident detail modals

### Analytics Dashboard
- 24-hour incident summaries
- Charts and visualizations
- Severity and type distributions
- Trend analysis

### Risk Analysis
- Location-based risk scoring
- Radius-based incident aggregation
- Risk level categorization

## 🔐 Security

- CORS configuration
- Environment variable protection
- API rate limiting ready
- HTTPS support
- Security headers (NGINX)

## 📈 Performance

- Redis caching for API responses
- Optimized database queries
- Lazy loading and code splitting
- Gzip compression (NGINX)
- CDN-ready static assets

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check Python version (3.11+ required)
- Verify all environment variables are set
- Ensure HERE API key is valid

**Frontend build fails:**
- Clear node_modules and reinstall
- Check Node version (18+ required)
- Verify .env variables are set

**Map not loading:**
- Check internet connection (map tiles)
- Verify bbox format in API calls
- Check browser console for errors

**No incidents showing:**
- Verify HERE API key is active
- Check bbox covers an area with traffic
- Look at network tab for API errors

## 📞 Support

For issues and questions:
- Open a GitHub issue
- Check existing documentation
- Review API documentation at `/docs`

## 🎯 Roadmap

- [ ] Machine learning predictions
- [ ] Mobile app (React Native)
- [ ] Real-time WebSocket updates
- [ ] Multi-region support
- [ ] Advanced route planning
- [ ] Push notifications
- [ ] Historical data analysis
- [ ] Custom alert rules

---

Built with ❤️ for safer roads
