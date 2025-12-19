import React from 'react';
import { useIncidents } from '../hooks/useTraffic';
import { DEFAULT_MAP_CENTER } from '../lib/config';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  AlertTriangle,
  RefreshCw,
  Filter,
  MapPin,
  Clock,
  Search,
  Ruler
} from 'lucide-react';

const DEFAULT_SPAN_LAT = 0.35;
const DEFAULT_SPAN_LON = 0.45;

const buildDefaultBbox = () => {
  const [lat, lon] = DEFAULT_MAP_CENTER;
  return `${lon - DEFAULT_SPAN_LON},${lat - DEFAULT_SPAN_LAT},${lon + DEFAULT_SPAN_LON},${lat + DEFAULT_SPAN_LAT}`;
};

const severityConfig = {
  critical: { bg: 'bg-red-100', text: 'text-red-700', badge: 'bg-red-600', label: 'Critical' },
  major: { bg: 'bg-orange-100', text: 'text-orange-700', badge: 'bg-orange-500', label: 'Major' },
  minor: { bg: 'bg-amber-100', text: 'text-amber-700', badge: 'bg-amber-500', label: 'Minor' },
  low: { bg: 'bg-lime-100', text: 'text-lime-700', badge: 'bg-lime-500', label: 'Low' },
};

export default function Incidents() {
  const [bbox, setBbox] = React.useState(null);
  const [searchText, setSearchText] = React.useState('');
  const [lengthFilter, setLengthFilter] = React.useState('all');
  const [sortKey, setSortKey] = React.useState('severity');
  const [selectedCriticality, setSelectedCriticality] = React.useState('all');

  React.useEffect(() => {
    setBbox(buildDefaultBbox());
  }, []);

  const { data: incidents = [], isLoading, error, refetch } = useIncidents(bbox, selectedCriticality === 'all' ? null : selectedCriticality);

  const filteredIncidents = React.useMemo(() => {
    let filtered = [...incidents];

    // Search filter
    if (searchText) {
      const query = searchText.toLowerCase();
      filtered = filtered.filter(inc => 
        inc.type?.toLowerCase().includes(query) ||
        inc.description?.toLowerCase().includes(query) ||
        inc.road_name?.toLowerCase().includes(query) ||
        inc.location_name?.toLowerCase().includes(query)
      );
    }

    // Length filter
    if (lengthFilter !== 'all') {
      if (lengthFilter === 'short') filtered = filtered.filter(i => (i.length || 0) < 1000);
      else if (lengthFilter === 'medium') filtered = filtered.filter(i => (i.length || 0) >= 1000 && (i.length || 0) < 5000);
      else if (lengthFilter === 'long') filtered = filtered.filter(i => (i.length || 0) >= 5000);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortKey === 'severity') {
        const order = { critical: 0, major: 1, minor: 2, low: 3 };
        return (order[a.criticality] || 99) - (order[b.criticality] || 99);
      } else if (sortKey === 'time') {
        return new Date(b.start_time) - new Date(a.start_time);
      } else if (sortKey === 'length') {
        return (b.length || 0) - (a.length || 0);
      }
      return 0;
    });

    return filtered;
  }, [incidents, searchText, lengthFilter, sortKey]);

  const stats = {
    total: incidents.length,
    critical: incidents.filter(i => i.criticality === 'critical').length,
    major: incidents.filter(i => i.criticality === 'major').length,
    minor: incidents.filter(i => i.criticality === 'minor').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-700">
        <p>Error loading incidents</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Incidents</h1>
            <p className="text-sm text-neutral-600 mt-1">{filteredIncidents.length} incidents</p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="bg-neutral-800 text-white px-4 py-2 rounded text-sm hover:bg-neutral-700 flex items-center gap-2"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded shadow p-4">
            <p className="text-sm text-neutral-600">Total</p>
            <p className="text-2xl font-semibold text-neutral-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded shadow p-4">
            <p className="text-sm text-neutral-600">Critical</p>
            <p className="text-2xl font-semibold text-red-700">{stats.critical}</p>
          </div>
          <div className="bg-white rounded shadow p-4">
            <p className="text-sm text-neutral-600">Major</p>
            <p className="text-2xl font-semibold text-orange-700">{stats.major}</p>
          </div>
          <div className="bg-white rounded shadow p-4">
            <p className="text-sm text-neutral-600">Minor</p>
            <p className="text-2xl font-semibold text-amber-700">{stats.minor}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Search incidents..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded text-sm outline-none focus:border-neutral-500"
              />
            </div>
            
            <select
              value={selectedCriticality}
              onChange={(e) => setSelectedCriticality(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded text-sm outline-none focus:border-neutral-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="major">Major</option>
              <option value="minor">Minor</option>
            </select>

            <select
              value={lengthFilter}
              onChange={(e) => setLengthFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded text-sm outline-none focus:border-neutral-500"
            >
              <option value="all">All Lengths</option>
              <option value="short">&lt; 1km</option>
              <option value="medium">1-5km</option>
              <option value="long">&gt; 5km</option>
            </select>

            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded text-sm outline-none focus:border-neutral-500"
            >
              <option value="severity">Sort: Severity</option>
              <option value="time">Sort: Time</option>
              <option value="length">Sort: Length</option>
            </select>
          </div>
        </div>

        {/* Incidents List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIncidents.map((incident) => {
            const config = severityConfig[incident.criticality] || severityConfig.minor;
            
            return (
              <div key={incident.id} className={`${config.bg} rounded shadow p-4`}>
                <div className="flex items-start justify-between mb-2">
                  <span className={`px-2 py-1 ${config.badge} text-white text-xs font-medium rounded`}>
                    {config.label}
                  </span>
                  <AlertTriangle size={16} className={config.text} />
                </div>
                
                <h3 className={`font-semibold mb-2 ${config.text}`}>{incident.type}</h3>
                <p className="text-sm text-neutral-700 mb-3 line-clamp-2">
                  {incident.description}
                </p>
                
                <div className="space-y-1 text-xs text-neutral-600">
                  {(incident.location_name || incident.road_name) && (
                    <div className="flex items-center gap-1">
                      <MapPin size={12} />
                      <span className="truncate">{incident.location_name || incident.road_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{new Date(incident.start_time).toLocaleString()}</span>
                  </div>
                  {incident.length && (
                    <div className="flex items-center gap-1">
                      <Ruler size={12} />
                      <span>{(incident.length / 1000).toFixed(1)} km</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredIncidents.length === 0 && (
          <div className="text-center py-12 text-neutral-600">
            <AlertTriangle size={48} className="mx-auto mb-2 opacity-50" />
            <p>No incidents found</p>
          </div>
        )}
      </div>
    </div>
  );
}
