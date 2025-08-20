import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Target,
  Zap,
  Clock,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  Users,
  Globe
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('detections');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/analytics/dashboard`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      // In a real implementation, this would trigger a download
      const data = {
        timestamp: new Date().toISOString(),
        analytics: analytics,
        time_range: timeRange
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${timeRange}_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const MetricCard = ({ title, value, change, icon: Icon, color, description }) => (
    <div className="cyber-card p-6 hover:border-cyan-400/50 transition-all duration-200 cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color}`}>
          <Icon className="w-6 h-6 text-black" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center space-x-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm font-mono">{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-green-400 font-mono mb-1">{value}</h3>
        <p className="text-green-400/70 text-sm font-mono mb-1">{title}</p>
        {description && (
          <p className="text-green-400/50 text-xs">{description}</p>
        )}
      </div>
    </div>
  );

  const TrendChart = ({ title, data, color = 'green' }) => {
    const maxValue = Math.max(...data);
    const colorMap = {
      green: { stroke: '#00ff41', fill: 'rgba(0, 255, 65, 0.1)' },
      red: { stroke: '#ff0080', fill: 'rgba(255, 0, 128, 0.1)' },
      cyan: { stroke: '#00ffff', fill: 'rgba(0, 255, 255, 0.1)' },
      purple: { stroke: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.1)' }
    };
    
    const colors = colorMap[color] || colorMap.green;
    
    return (
      <div className="cyber-card p-6">
        <h3 className="text-lg font-semibold text-green-400 font-mono mb-4">{title}</h3>
        <div className="relative h-48">
          <svg className="w-full h-full">
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: colors.stroke, stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: colors.stroke, stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            
            {/* Chart area */}
            <path
              d={`M 0 ${48} ${data.map((value, index) => 
                `L ${(index / (data.length - 1)) * 100}% ${48 - (value / maxValue) * 40}%`
              ).join(' ')}`}
              fill={`url(#gradient-${color})`}
              stroke={colors.stroke}
              strokeWidth="2"
              className="drop-shadow-lg"
            />
            
            {/* Data points */}
            {data.map((value, index) => (
              <circle
                key={index}
                cx={`${(index / (data.length - 1)) * 100}%`}
                cy={`${48 - (value / maxValue) * 40}%`}
                r="3"
                fill={colors.stroke}
                className="hover:r-4 transition-all cursor-pointer"
              />
            ))}
          </svg>
          
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-green-400/60 font-mono">
            <span>{maxValue}</span>
            <span>{Math.floor(maxValue / 2)}</span>
            <span>0</span>
          </div>
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-green-400/60 font-mono">
          <span>7 days ago</span>
          <span>Today</span>
        </div>
      </div>
    );
  };

  const ThreatBreakdown = () => {
    if (!analytics?.recent_trends?.threat_patterns) return null;
    
    const threats = analytics.recent_trends.threat_patterns;
    const total = Object.values(threats).reduce((sum, val) => sum + val, 0);
    
    return (
      <div className="cyber-card p-6">
        <h3 className="text-lg font-semibold text-green-400 font-mono mb-4">Threat Breakdown</h3>
        
        <div className="space-y-4">
          {Object.entries(threats).map(([threat, count]) => {
            const percentage = (count / total) * 100;
            const colors = {
              face_swap: 'from-red-400 to-red-600',
              voice_synthesis: 'from-purple-400 to-purple-600',
              expression_transfer: 'from-yellow-400 to-orange-500'
            };
            
            return (
              <div key={threat}>
                <div className="flex justify-between mb-2">
                  <span className="text-green-400 font-mono capitalize">
                    {threat.replace('_', ' ')}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400 font-mono">{count}</span>
                    <span className="text-green-400/60 text-xs">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
                <div className="cyber-progress">
                  <div 
                    className="cyber-progress-bar"
                    style={{ 
                      width: `${percentage}%`,
                      background: `linear-gradient(90deg, ${colors[threat] || 'var(--primary), var(--secondary)'})` 
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const PerformanceMetrics = () => {
    if (!analytics?.performance_metrics) return null;
    
    const metrics = analytics.performance_metrics;
    
    return (
      <div className="cyber-card p-6">
        <h3 className="text-lg font-semibold text-green-400 font-mono mb-4">Performance Metrics</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-black/30 rounded-lg">
            <Clock className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-cyan-400 font-mono text-lg font-bold">
              {metrics.avg_processing_time.toFixed(2)}s
            </p>
            <p className="text-green-400/70 text-sm">Avg Processing</p>
          </div>
          
          <div className="text-center p-4 bg-black/30 rounded-lg">
            <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-yellow-400 font-mono text-lg font-bold">
              {metrics.throughput}
            </p>
            <p className="text-green-400/70 text-sm">Files/Hour</p>
          </div>
          
          <div className="text-center p-4 bg-black/30 rounded-lg">
            <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-green-400 font-mono text-lg font-bold">
              {(metrics.system_uptime * 100).toFixed(1)}%
            </p>
            <p className="text-green-400/70 text-sm">Uptime</p>
          </div>
          
          <div className="text-center p-4 bg-black/30 rounded-lg">
            <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-purple-400 font-mono text-lg font-bold">
              {(metrics.detection_accuracy * 100).toFixed(1)}%
            </p>
            <p className="text-green-400/70 text-sm">Accuracy</p>
          </div>
        </div>
      </div>
    );
  };

  const RealtimeActivity = () => (
    <div className="cyber-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-green-400 font-mono">Real-time Activity</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-mono">Live</span>
        </div>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {[
          { time: '14:32:15', event: 'Media analysis completed', type: 'success' },
          { time: '14:31:42', event: 'Deepfake detected with 89.2% confidence', type: 'warning' },
          { time: '14:30:18', event: 'New file uploaded for analysis', type: 'info' },
          { time: '14:28:07', event: 'Threat intelligence updated', type: 'info' },
          { time: '14:25:33', event: 'System monitoring started', type: 'success' }
        ].map((activity, index) => (
          <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg ${
            activity.type === 'success' ? 'bg-green-400/10 border border-green-400/20' :
            activity.type === 'warning' ? 'bg-yellow-400/10 border border-yellow-400/20' :
            'bg-cyan-400/10 border border-cyan-400/20'
          }`}>
            <div className={`w-2 h-2 rounded-full mt-2 ${
              activity.type === 'success' ? 'bg-green-400' :
              activity.type === 'warning' ? 'bg-yellow-400' :
              'bg-cyan-400'
            }`}></div>
            <div className="flex-1">
              <p className="text-green-400 text-sm font-mono">{activity.event}</p>
              <p className="text-green-400/60 text-xs font-mono">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!analytics) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="cyber-loader mb-4"></div>
          <p className="text-green-400 font-mono">Loading Analytics Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-green-400 font-mono mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-green-400/70 font-mono">
            Comprehensive analysis and performance metrics
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-black/50 border border-green-400/30 rounded-lg px-4 py-2 text-green-400 font-mono focus:border-cyan-400 focus:outline-none"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          
          <button
            onClick={loadAnalytics}
            disabled={loading}
            className="neon-btn info flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={exportData}
            className="neon-btn flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Analyses"
          value={analytics.total_analyses.toLocaleString()}
          change={12.5}
          icon={BarChart3}
          color="from-green-400 to-green-600"
          description="Files processed this period"
        />
        <MetricCard
          title="Authenticity Rate"
          value={`${(analytics.authenticity_rate * 100).toFixed(1)}%`}
          change={-2.1}
          icon={Shield}
          color="from-cyan-400 to-blue-600"
          description="Percentage of authentic media"
        />
        <MetricCard
          title="Threats Detected"
          value={Object.values(analytics.recent_trends?.threat_patterns || {}).reduce((a, b) => a + b, 0)}
          change={8.7}
          icon={Target}
          color="from-red-400 to-red-600"
          description="Deepfakes identified"
        />
        <MetricCard
          title="System Performance"
          value={`${(analytics.performance_metrics.system_uptime * 100).toFixed(1)}%`}
          change={0.3}
          icon={Activity}
          color="from-purple-400 to-purple-600"
          description="Overall system health"
        />
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <TrendChart
            title="Daily Detection Trends"
            data={analytics.recent_trends?.daily_detections || [10, 15, 12, 20, 18, 25, 22]}
            color="green"
          />
          <ThreatBreakdown />
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          <TrendChart
            title="Authenticity Rate Trend"
            data={analytics.recent_trends?.weekly_authenticity || [0.85, 0.82, 0.88, 0.86]}
            color="cyan"
          />
          <PerformanceMetrics />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RealtimeActivity />
        </div>
        
        <div className="cyber-card p-6">
          <h3 className="text-lg font-semibold text-green-400 font-mono mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-green-400/70 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Active Sessions
              </span>
              <span className="text-green-400 font-mono">24</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-green-400/70 flex items-center">
                <Globe className="w-4 h-4 mr-2" />
                Global Requests
              </span>
              <span className="text-green-400 font-mono">1,247</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-green-400/70 flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                Monitoring Active
              </span>
              <span className="text-green-400 font-mono">Yes</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-green-400/70 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Last Update
              </span>
              <span className="text-green-400 font-mono">2m ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;