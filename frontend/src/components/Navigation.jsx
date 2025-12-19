import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, AlertTriangle, BarChart3 } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-neutral-900 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-xl font-bold tracking-wide">CrashLens</h1>

          <div className="flex gap-4">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-neutral-700 text-white'
                      : 'text-neutral-300 hover:bg-neutral-800'
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
