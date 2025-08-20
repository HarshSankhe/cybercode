import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Activity,
  Search,
  Globe,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Zap
} from 'lucide-react';

const Sidebar = ({ onLogout, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { path: '/', icon: Activity, label: 'Dashboard', color: 'text-cyan-400' },
    { path: '/media-analysis', icon: Search, label: 'Media Analysis', color: 'text-green-400' },
    { path: '/threat-intelligence', icon: Shield, label: 'Threat Intel', color: 'text-red-400' },
    { path: '/secure-browsing', icon: Globe, label: 'Secure Browse', color: 'text-blue-400' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', color: 'text-purple-400' },
    { path: '/settings', icon: Settings, label: 'Settings', color: 'text-yellow-400' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className={`cyber-sidebar flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } h-screen relative z-20`}>
      
      {/* Header */}
      <div className="p-4 border-b border-green-400/30">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-green-400" />
              <div>
                <h1 className="text-green-400 font-bold text-lg font-mono">
                  CYPHER
                </h1>
                <p className="text-xs text-green-400/70">Defense Matrix</p>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-green-400/10 rounded transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-green-400" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-green-400" />
            )}
          </button>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-green-400/30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-cyan-400 flex items-center justify-center">
            <User className="w-5 h-5 text-black" />
          </div>
          {!isCollapsed && (
            <div>
              <p className="text-green-400 font-semibold">{user?.username}</p>
              <p className="text-xs text-green-400/70">{user?.role}</p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                <span className="text-xs text-green-400">Online</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group relative overflow-hidden ${
                  isActive
                    ? 'bg-green-400/20 border border-green-400/50 text-green-400'
                    : 'hover:bg-green-400/10 text-green-400/70 hover:text-green-400'
                }`}
              >
                {/* Animated background */}
                <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-green-400/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700`}></div>
                
                <Icon className={`w-5 h-5 ${item.color} relative z-10`} />
                {!isCollapsed && (
                  <span className="font-mono text-sm relative z-10">{item.label}</span>
                )}
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-l"></div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* System Status */}
      {!isCollapsed && (
        <div className="p-4 border-t border-green-400/30">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-400/70">System Status</span>
              <Zap className="w-3 h-3 text-green-400" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-green-400/70">CPU</span>
                <span className="text-green-400">32%</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-1">
                <div className="bg-gradient-to-r from-green-400 to-cyan-400 h-1 rounded-full" style={{width: '32%'}}></div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-green-400/70">Memory</span>
                <span className="text-green-400">58%</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-1">
                <div className="bg-gradient-to-r from-green-400 to-yellow-400 h-1 rounded-full" style={{width: '58%'}}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Button */}
      <div className="p-4 border-t border-green-400/30">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-400 hover:bg-red-400/10 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && (
            <span className="font-mono text-sm">Logout</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;