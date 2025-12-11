import React from 'react';
import { AlertTriangle, TrendingUp, Clock, MapPin } from 'lucide-react';
import { SEVERITY_CONFIG } from '../lib/config';

export default function IncidentList({ incidents = [], onIncidentClick }) {
  const sortedIncidents = [...incidents].sort((a, b) => {
    const severityOrder = { critical: 0, major: 1, minor: 2, low: 3 };
    return (severityOrder[a.criticality] || 99) - (severityOrder[b.criticality] || 99);
  });

  if (incidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-400">
        <AlertTriangle size={48} className="mb-2" />
        <p>No incidents in this area</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {sortedIncidents.map((incident) => {
        const config = SEVERITY_CONFIG[incident.criticality] || SEVERITY_CONFIG.minor;
        
        return (
          <div
            key={incident.id}
            onClick={() => onIncidentClick?.(incident)}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-start gap-3">
              <div 
                className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                style={{ backgroundColor: config.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-sm truncate">{incident.type}</h3>
                  <span className={`badge badge-${incident.criticality} flex-shrink-0`}>
                    {config.label}
                  </span>
                </div>
                
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {incident.description}
                </p>
                
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  {incident.road_name && (
                    <div className="flex items-center gap-1">
                      <MapPin size={12} />
                      <span>{incident.road_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{new Date(incident.start_time).toLocaleTimeString()}</span>
                  </div>
                  {incident.length && (
                    <div className="flex items-center gap-1">
                      <TrendingUp size={12} />
                      <span>{(incident.length / 1000).toFixed(1)} km</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
