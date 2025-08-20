import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Activity,
  Shield,
  AlertTriangle,
  TrendingUp,
  Zap,
  Eye,
  Globe,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  BarChart3
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = ({ systemStatus }) => {
  const [monitoringStats, setMonitoringStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [threatLevel, setThreatLevel] = useState('low');
  const [realTimeAlerts, setRealTimeAlerts] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        axios.get(`${API}/monitoring/stats`),
        axios.get(`${API}/analytics/dashboard`)
      ]);

      setMonitoringStats(statsRes.data);
      setAnalytics(analyticsRes.data);
      setThreatLevel(analyticsRes.data.threat_level);
      
      if (statsRes.data.alerts) {
        setRealTimeAlerts(statsRes.data.alerts.slice(0, 5));
      }
      
      setIsMonitoring(statsRes.data.status === 'active');
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const toggleMonitoring = async () => {
    try {
      const endpoint = isMonitoring ? 'stop' : 'start';
      await axios.post(`${API}/monitoring/${endpoint}`);
      setIsMonitoring(!isMonitoring);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to toggle monitoring:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className="cyber-card p-6 relative group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color} shadow-lg`}>
          <Icon className="w-6 h-6 text-black" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'transform rotate-180' : ''}`} />
            <span className="text-sm font-mono">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-green-400 font-mono mb-1">{value}</h3>
        <p className="text-green-400/70 text-sm font-mono">{title}</p>
        {subtitle && (
          <p className="text-green-400/50 text-xs font-mono mt-1">{subtitle}</p>
        )}
      </div>
      
      {/* Animated border effect */}
      <div className="absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r from-green-400/20 via-cyan-400/20 to-purple-400/20 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-full h-full bg-black rounded-md"></div>
      </div>
    </div>
  );

  const ThreatLevelIndicator = ({ level }) => {
    const colors = {
      low: { bg: 'from-green-400 to-green-600', text: 'text-green-400', border: 'border-green-400' },
      medium: { bg: 'from-yellow-400 to-orange-500', text: 'text-yellow-400', border: 'border-yellow-400' },
      high: { bg: 'from-red-400 to-red-600', text: 'text-red-400', border: 'border-red-400' }
    };
    
    const config = colors[level] || colors.low;
    
    return (
      <div className={`cyber-card p-6 border-2 ${config.border}`}>
        <div className="flex items-center space-x-4">
          <div className={`p-4 rounded-full bg-gradient-to-r ${config.bg} animate-pulse`}>
            <Shield className="w-8 h-8 text-black" />
          </div>
          <div>
            <h3 className={`text-2xl font-bold ${config.text} font-mono uppercase`}>
              {level} Threat
            </h3>
            <p className="text-green-400/70 font-mono">Current Security Level</p>
            <div className="flex items-center mt-2">
              <div className={`w-3 h-3 rounded-full ${config.bg} bg-gradient-to-r animate-ping mr-2`}></div>
              <span className="text-xs text-green-400/60">Real-time monitoring active</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SystemStatusPanel = () => (
    <div className="cyber-card p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Server className="w-6 h-6 text-cyan-400" />
        <h3 className="text-xl font-semibold text-green-400 font-mono">System Status</h3>
      </div>
      
      <div className="space-y-4">
        {systemStatus && Object.entries(systemStatus.components).map(([component, status]) => (
          <div key={component} className="flex items-center justify-between p-3 rounded bg-black/30 border border-green-400/20">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${status === 'active' ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
              <span className="text-green-400 font-mono capitalize">{component.replace('_', ' ')}</span>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-mono ${
              status === 'active' ? 'bg-green-400/20 text-green-400' : 
              status === 'connected' ? 'bg-cyan-400/20 text-cyan-400' :
              'bg-red-400/20 text-red-400'
            }`}>
              {status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
      
      {systemStatus?.performance && (
        <div className="mt-6">
          <h4 className="text-green-400 font-mono mb-3">Resource Usage</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-400/70 flex items-center">
                  <Cpu className="w-4 h-4 mr-2" />
                  CPU
                </span>
                <span className="text-green-400">{systemStatus.performance.cpu_usage.toFixed(1)}%</span>
              </div>
              <div className="cyber-progress">
                <div className="cyber-progress-bar" style={{width: `${systemStatus.performance.cpu_usage}%`}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-400/70 flex items-center">
                  <HardDrive className="w-4 h-4 mr-2" />
                  Memory
                </span>
                <span className="text-green-400">{systemStatus.performance.memory_usage.toFixed(1)}%</span>
              </div>
              <div className="cyber-progress">
                <div className="cyber-progress-bar" style={{width: `${systemStatus.performance.memory_usage}%`}}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const RecentAlerts = () => (
    <div className="cyber-card p-6">
      <div className="flex items-center space-x-3 mb-6">
        <AlertTriangle className="w-6 h-6 text-yellow-400" />
        <h3 className="text-xl font-semibold text-green-400 font-mono">Recent Alerts</h3>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {realTimeAlerts.length > 0 ? (
          realTimeAlerts.map((alert, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded bg-black/30 border-l-4 border-red-400">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-red-400 font-mono text-sm">{alert.type || 'Security Alert'}</p>
                <p className="text-green-400/70 text-xs mt-1">
                  Confidence: {((alert.confidence || 0.85) * 100).toFixed(1)}%
                </p>
                <p className="text-green-400/50 text-xs">
                  {alert.timestamp || new Date().toISOString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-green-400/30 mx-auto mb-3" />
            <p className="text-green-400/70 font-mono">All systems secure</p>
            <p className="text-green-400/50 text-sm">No recent alerts</p>
          </div>
        )}
      </div>
    </div>
  );

  const MonitoringControls = () => (
    <div className="cyber-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Eye className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-green-400 font-mono">Real-time Monitor</h3>
        </div>
        <div className={`px-3 py-1 rounded text-xs font-mono ${
          isMonitoring ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
        }`}>
          {isMonitoring ? 'ACTIVE' : 'INACTIVE'}
        </div>
      </div>
      
      <div className="flex space-x-4 mb-6">
        <button
          onClick={toggleMonitoring}
          className={`neon-btn flex-1 ${isMonitoring ? 'danger' : ''}`}
        >
          {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </button>
      </div>
      
      {monitoringStats && (
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400 font-mono">
              {monitoringStats.frames_processed}
            </p>
            <p className="text-green-400/70 text-sm">Frames Processed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400 font-mono">
              {monitoringStats.deepfakes_detected}
            </p>
            <p className="text-green-400/70 text-sm">Threats Detected</p>
          </div>
        </div>
      )}
    </div>
  );

  if (!analytics) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="cyber-loader mb-4"></div>
          <p className="text-green-400 font-mono">Loading Matrix Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 relative z-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-green-400 font-mono mb-2 glitch" data-text="CYPHER MATRIX">
          CYPHER MATRIX
        </h1>
        <p className="text-green-400/70 font-mono">Advanced DeepFake Detection & Threat Analysis</p>
        <div className="flex items-center space-x-4 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-mono">System Online</span>
          </div>
          <div className="flex items-center space-x-2">
            <Wifi className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-mono">Quantum Link Active</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Analyses"
          value={analytics.total_analyses.toLocaleString()}
          icon={BarChart3}
          color="from-green-400 to-green-600"
          trend={12}
        />
        <StatCard
          title="Authenticity Rate"
          value={`${(analytics.authenticity_rate * 100).toFixed(1)}%`}
          icon={Shield}
          color="from-cyan-400 to-blue-600"
          trend={-2.1}
        />
        <StatCard
          title="Processing Speed"
          value={`${analytics.performance_metrics.avg_processing_time.toFixed(2)}s`}
          icon={Zap}
          color="from-purple-400 to-purple-600"
          trend={8.3}
        />
        <StatCard
          title="System Uptime"
          value={`${(analytics.performance_metrics.system_uptime * 100).toFixed(1)}%`}
          icon={Activity}
          color="from-yellow-400 to-orange-600"
          trend={0.5}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <ThreatLevelIndicator level={threatLevel} />
          <MonitoringControls />
        </div>

        {/* Middle Column */}
        <div className="space-y-6">
          <SystemStatusPanel />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <RecentAlerts />
        </div>
      </div>

      {/* Bottom Section - Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="cyber-card p-6 text-center">
          <Globe className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-400 font-mono mb-2">Secure Browse</h3>
          <p className="text-green-400/70 text-sm mb-4">Access suspicious content safely</p>
          <button className="neon-btn info w-full">Launch Browser</button>
        </div>
        
        <div className="cyber-card p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-400 font-mono mb-2">Threat Hunt</h3>
          <p className="text-green-400/70 text-sm mb-4">Search for emerging threats</p>
          <button className="neon-btn danger w-full">Start Hunt</button>
        </div>
        
        <div className="cyber-card p-6 text-center">
          <BarChart3 className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-400 font-mono mb-2">Analytics</h3>
          <p className="text-green-400/70 text-sm mb-4">Deep dive into detection data</p>
          <button className="neon-btn w-full">View Reports</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;