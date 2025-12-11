import React, { useState } from 'react';
import TrafficMap from '../components/TrafficMap';
import IncidentList from '../components/IncidentList';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useIncidents } from '../hooks/useTraffic';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../lib/config';
import { getBboxFromBounds } from '../lib/utils';
import { RefreshCw, Filter, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [mapCenter] = useState(DEFAULT_MAP_CENTER);
  const [mapZoom] = useState(DEFAULT_MAP_ZOOM);
  const [bbox, setBbox] = useState(null);
  const [selectedCriticality, setSelectedCriticality] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const mapRef = React.useRef(null);

  const { data: incidents = [], isLoading, error, refetch } = useIncidents(bbox, selectedCriticality);

  // Load initial incidents with default map bounds
  React.useEffect(() => {
    if (mapRef.current && !bbox) {
      const bounds = mapRef.current.getBounds();
      const newBbox = getBboxFromBounds(bounds);
      setBbox(newBbox);
    }
  }, [bbox]);

  const handleBoundsChange = (bounds) => {
    const newBbox = getBboxFromBounds(bounds);
    setBbox(newBbox);
  };

  const criticalityOptions = [
    { value: null, label: 'All Incidents' },
    { value: 'critical', label: 'Critical' },
    { value: 'major', label: 'Major' },
    { value: 'minor', label: 'Minor' },
  ];

  const stats = [
    { label: 'Total Incidents', value: incidents.length, color: 'text-blue-600' },
    { 
      label: 'Critical', 
      value: incidents.filter(i => i.criticality === 'critical').length,
      color: 'text-red-600' 
    },
    { 
      label: 'Major', 
      value: incidents.filter(i => i.criticality === 'major').length,
      color: 'text-orange-600' 
    },
  ];

  const filteredIncidents = incidents.filter(i => {
    if (!searchText) return true;
    const hay = `${i.type} ${i.description || ''} ${i.road_name || ''}`.toLowerCase();
    return hay.includes(searchText.toLowerCase());
  });

  return (
    <div className="flex flex-col h-screen">
      {/* Header with filters */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Real-Time Dashboard</h2>
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{stat.label}:</span>
                <span className={`font-semibold ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5">
              <Filter size={16} className="text-gray-500" />
              <select
                value={selectedCriticality || ''}
                onChange={(e) => setSelectedCriticality(e.target.value || null)}
                className="bg-transparent text-sm outline-none cursor-pointer"
              >
                {criticalityOptions.map((option) => (
                  <option key={option.value || 'all'} value={option.value || ''}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              placeholder="Search description or road"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="text-sm bg-gray-100 rounded-lg px-3 py-1.5 outline-none"
            />

            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <TrafficMap
            ref={mapRef}
            center={mapCenter}
            zoom={mapZoom}
            incidents={incidents}
            onBoundsChange={handleBoundsChange}
            className="h-full"
          />
          
          {isLoading && (
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 flex items-center gap-2">
              <LoadingSpinner size={16} />
              <span className="text-sm">Loading incidents...</span>
            </div>
          )}

          {error && (
            <div className="absolute top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 max-w-xs">
              <AlertCircle size={16} className="text-red-600" />
              <span className="text-sm text-red-800">Failed to load incidents</span>
            </div>
          )}

          {!isLoading && !error && incidents.length === 0 && (
            <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3">
              <p className="text-sm text-gray-700">Zoom or pan the map to load incidents in view.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-96 bg-white border-l flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Active Incidents</h3>
            <p className="text-sm text-gray-600 mt-1">
              {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''} in view
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            <IncidentList
              incidents={filteredIncidents}
              onIncidentClick={setSelectedIncident}
            />

            {!isLoading && filteredIncidents.length === 0 && (
              <div className="p-4 text-sm text-gray-600">
                No incidents match your filters. Try clearing search or changing severity.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Incident detail modal */}
      {selectedIncident && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedIncident(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Incident Details</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Type</label>
                <p className="text-gray-900">{selectedIncident.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-gray-900">{selectedIncident.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Severity</label>
                  <p className="text-gray-900 capitalize">{selectedIncident.criticality}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Start Time</label>
                  <p className="text-gray-900">
                    {new Date(selectedIncident.start_time).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedIncident(null)}
              className="btn-primary w-full mt-6"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
