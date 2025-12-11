import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, AlertTriangle, BarChart3, Settings } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="text-2xl">🚦</div>
            <h1 className="text-xl font-bold text-gray-900">CrashLens</h1>
          </div>

          <div className="flex gap-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
