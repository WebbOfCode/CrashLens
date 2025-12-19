import React from 'react';
import { useAnalytics } from '../hooks/useTraffic';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, Clock, Activity } from 'lucide-react';
import { DEFAULT_MAP_CENTER } from '../lib/config';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16'];
const DEFAULT_SPAN_LAT = 0.35;
const DEFAULT_SPAN_LON = 0.45;

const buildDefaultBbox = () => {
  const [lat, lon] = DEFAULT_MAP_CENTER;
  return `${lon - DEFAULT_SPAN_LON},${lat - DEFAULT_SPAN_LAT},${lon + DEFAULT_SPAN_LON},${lat + DEFAULT_SPAN_LAT}`;
};

export default function Analytics() {
  const [bbox, setBbox] = React.useState(null);

  React.useEffect(() => {
    setBbox(buildDefaultBbox());
  }, []);

  const { data: analytics, isLoading, error } = useAnalytics(bbox);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <LoadingSpinner size={40} className="mx-auto mb-2" />
          <p className="text-neutral-700">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-700">
          <AlertTriangle size={40} className="mx-auto mb-2" />
          <p>Error loading analytics</p>
        </div>
      </div>
    );
  }

  const severityData = Object.entries(analytics?.by_severity || {}).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    count: value,
  }));

  const typeData = Object.entries(analytics?.by_type || {}).map(([key, value]) => ({
    name: key.replace(/_/g, ' '),
    count: value,
  }));

  const total = analytics?.total_incidents || 0;

  const statCards = [
    {
      title: 'Total',
      value: analytics?.total_incidents || 0,
      icon: AlertTriangle,
      color: 'text-neutral-700',
      bg: 'bg-neutral-100',
    },
    {
      title: 'Period',
      value: '24h',
      icon: Clock,
      color: 'text-neutral-700',
      bg: 'bg-neutral-100',
    },
    {
      title: 'Severity',
      value: 'Moderate',
      icon: Activity,
      color: 'text-neutral-700',
      bg: 'bg-neutral-100',
    },
    {
      title: 'Trend',
      value: '+12%',
      icon: TrendingUp,
      color: 'text-neutral-700',
      bg: 'bg-neutral-100',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Analytics</h1>
          <p className="text-neutral-600">Incident insights</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, i) => (
            <div key={i} className="bg-white rounded shadow p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-neutral-600 text-sm mb-1">{stat.title}</p>
                  <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`${stat.bg} p-3 rounded`}>
                  <stat.icon className={stat.color} size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Severity Distribution */}
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-neutral-900">By Severity</h2>
            {severityData.length === 0 ? (
              <p className="text-sm text-neutral-600">No data available</p>
            ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#333" />
              </BarChart>
            </ResponsiveContainer>
            )}
          </div>

          {/* Type Distribution */}
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-neutral-900">By Type</h2>
            {typeData.length === 0 ? (
              <p className="text-sm text-neutral-600">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#333"
                    dataKey="count"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Summary Table */}
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-neutral-900">Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 text-neutral-700">Severity</th>
                  <th className="text-left py-3 px-4 text-neutral-700">Count</th>
                  <th className="text-left py-3 px-4 text-neutral-700">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {severityData.map((item, i) => (
                  <tr key={i} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 px-4 font-medium text-neutral-900">{item.name}</td>
                    <td className="py-3 px-4 text-neutral-700">{item.count}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-neutral-200 rounded-full h-2 max-w-xs">
                          <div
                            className="bg-neutral-800 h-2 rounded-full"
                            style={{
                              width: `${total ? (item.count / total) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-neutral-600">
                          {total ? ((item.count / total) * 100).toFixed(1) : '0.0'}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {severityData.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 px-4 text-sm text-neutral-600">No incidents</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
