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
    { value: null, label: 'All' },
    { value: 'critical', label: 'Critical' },
    { value: 'major', label: 'Major' },
    { value: 'minor', label: 'Minor' },
  ];

  const stats = [
    { label: 'Total', value: incidents.length, color: 'text-neutral-700' },
    { 
      label: 'Critical', 
      value: incidents.filter(i => i.criticality === 'critical').length,
      color: 'text-red-700' 
    },
    { 
      label: 'Major', 
      value: incidents.filter(i => i.criticality === 'major').length,
      color: 'text-orange-700' 
    },
  ];

  const filteredIncidents = incidents.filter(i => {
    if (!searchText) return true;
    const hay = `${i.type} ${i.description || ''} ${i.road_name || ''}`.toLowerCase();
    return hay.includes(searchText.toLowerCase());
  });

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-semibold text-neutral-900">Dashboard</h2>
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm text-neutral-600">{stat.label}:</span>
                <span className={`font-semibold ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-neutral-100 rounded px-3 py-1.5">
              <Filter size={16} className="text-neutral-600" />
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
              placeholder="Search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="text-sm bg-neutral-100 rounded px-3 py-1.5 outline-none w-40"
            />

            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="bg-neutral-800 text-white px-4 py-1.5 rounded text-sm hover:bg-neutral-700 flex items-center gap-2"
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
            <div className="absolute top-4 right-4 bg-white rounded shadow-lg p-3 flex items-center gap-2">
              <LoadingSpinner size={16} />
              <span className="text-sm text-neutral-700">Loading...</span>
            </div>
          )}

          {error && (
            <div className="absolute top-4 right-4 bg-red-50 border border-red-200 rounded p-3 flex items-center gap-2 max-w-xs">
              <AlertCircle size={16} className="text-red-700" />
              <span className="text-sm text-red-800">Error loading data</span>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-96 bg-white border-l flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-neutral-900">Incidents</h3>
            <p className="text-sm text-neutral-600 mt-1">
              {filteredIncidents.length} in view
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            <IncidentList
              incidents={filteredIncidents}
              onIncidentClick={setSelectedIncident}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
