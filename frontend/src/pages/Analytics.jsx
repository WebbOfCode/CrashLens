import React from 'react';
import { useAnalytics } from '../hooks/useTraffic';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, Clock, Activity } from 'lucide-react';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16'];

export default function Analytics() {
  const { data: analytics, isLoading, error } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <LoadingSpinner size={40} className="mx-auto mb-2" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <AlertTriangle size={40} className="mx-auto mb-2" />
          <p>Failed to load analytics</p>
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
      title: 'Total Incidents',
      value: analytics?.total_incidents || 0,
      icon: AlertTriangle,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Period',
      value: analytics?.period || '24h',
      icon: Clock,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      title: 'Average Severity',
      value: 'Moderate',
      icon: Activity,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
    {
      title: 'Trend',
      value: '+12%',
      icon: TrendingUp,
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Traffic incident insights and trends</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, i) => (
            <div key={i} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  {stat.title === 'Total Incidents' && (
                    <p className="text-xs text-gray-500 mt-1">Across selected time period</p>
                  )}
                </div>
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <stat.icon className={stat.color} size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Severity Distribution */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Incidents by Severity</h2>
            {severityData.length === 0 ? (
              <p className="text-sm text-gray-600">No data available for the selected period.</p>
            ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
            )}
          </div>

          {/* Type Distribution */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Incidents by Type</h2>
            {typeData.length === 0 ? (
              <p className="text-sm text-gray-600">No data available for the selected period.</p>
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
                    fill="#8884d8"
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

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Incident Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Severity</th>
                  <th className="text-left py-3 px-4">Count</th>
                  <th className="text-left py-3 px-4">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {severityData.map((item, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{item.name}</td>
                    <td className="py-3 px-4">{item.count}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{
                              width: `${total ? (item.count / total) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {total ? ((item.count / total) * 100).toFixed(1) : '0.0'}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {severityData.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 px-4 text-sm text-gray-600">No incidents in the selected period.</td>
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
