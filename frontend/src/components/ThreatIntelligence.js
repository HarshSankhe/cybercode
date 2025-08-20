import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Shield,
  AlertTriangle,
  Search,
  Target,
  Activity,
  Zap,
  Globe,
  Eye,
  Brain,
  Crosshair,
  TrendingUp,
  Clock
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ThreatIntelligence = () => {
  const [threatData, setThreatData] = useState(null);
  const [hunting, setHunting] = useState(false);
  const [huntResults, setHuntResults] = useState(null);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadThreatIntelligence();
  }, []);

  const loadThreatIntelligence = async () => {
    try {
      const response = await axios.get(`${API}/threats/intelligence`);
      setThreatData(response.data);
    } catch (error) {
      console.error('Failed to load threat intelligence:', error);
    }
  };

  const startThreatHunt = async () => {
    setHunting(true);
    try {
      const response = await axios.post(`${API}/threats/hunt`);
      setHuntResults(response.data);
    } catch (error) {
      console.error('Threat hunt failed:', error);
    } finally {
      setHunting(false);
    }
  };

  const updateThreatIntel = async () => {
    setUpdating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate update
      await loadThreatIntelligence();
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setUpdating(false);
    }
  };

  const ThreatLevelPanel = () => {
    if (!threatData) return null;

    const levelConfig = {
      low: { color: 'text-green-400', bg: 'from-green-400 to-green-600', border: 'border-green-400' },
      medium: { color: 'text-yellow-400', bg: 'from-yellow-400 to-orange-500', border: 'border-yellow-400' },
      high: { color: 'text-red-400', bg: 'from-red-400 to-red-600', border: 'border-red-400' }
    };

    const config = levelConfig[threatData.current_threat_level] || levelConfig.low;

    return (
      <div className={`cyber-card p-6 border-2 ${config.border}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-full bg-gradient-to-r ${config.bg} animate-pulse`}>
              <Shield className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className={`text-2xl font-bold ${config.color} font-mono uppercase`}>
                {threatData.current_threat_level} Threat
              </h3>
              <p className="text-green-400/70 text-sm">Global Security Level</p>
            </div>
          </div>
          <button
            onClick={updateThreatIntel}
            disabled={updating}
            className="neon-btn info flex items-center space-x-2"
          >
            {updating ? (
              <div className="cyber-loader w-4 h-4"></div>
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span>{updating ? 'Updating...' : 'Update Intel'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-black/30 rounded-lg">
            <Target className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-400 font-mono text-lg font-bold">
              {threatData.recent_detections}
            </p>
            <p className="text-green-400/70 text-sm">Recent Detections</p>
          </div>
          
          <div className="text-center p-4 bg-black/30 rounded-lg">
            <Activity className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-cyan-400 font-mono text-lg font-bold">
              {(threatData.global_statistics.detection_accuracy * 100).toFixed(1)}%
            </p>
            <p className="text-green-400/70 text-sm">Detection Accuracy</p>
          </div>
          
          <div className="text-center p-4 bg-black/30 rounded-lg">
            <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-purple-400 font-mono text-lg font-bold">
              {threatData.global_statistics.processing_speed.toFixed(2)}s
            </p>
            <p className="text-green-400/70 text-sm">Avg Response Time</p>
          </div>
        </div>
      </div>
    );
  };

  const ThreatPatterns = () => {
    if (!threatData?.active_patterns) return null;

    const getPatternIcon = (type) => {
      switch (type) {
        case 'face_swap': return Eye;
        case 'expression_transfer': return Brain;
        case 'voice_synthesis': return Activity;
        default: return AlertTriangle;
      }
    };

    const getFrequencyColor = (frequency) => {
      switch (frequency) {
        case 'high': return 'text-red-400 border-red-400';
        case 'medium': return 'text-yellow-400 border-yellow-400';
        case 'low': return 'text-green-400 border-green-400';
        default: return 'text-green-400 border-green-400';
      }
    };

    return (
      <div className="cyber-card p-6">
        <h3 className="text-xl font-semibold text-green-400 font-mono mb-4">
          Active Threat Patterns
        </h3>
        
        <div className="space-y-4">
          {threatData.active_patterns.map((pattern, index) => {
            const Icon = getPatternIcon(pattern.type);
            const colorClass = getFrequencyColor(pattern.frequency);
            
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${colorClass} bg-black/30 cursor-pointer hover:bg-black/50 transition-all`}
                onClick={() => setSelectedPattern(pattern)}
              >
                <div className="flex items-center space-x-4">
                  <Icon className={`w-8 h-8 ${colorClass.split(' ')[0]}`} />
                  <div className="flex-1">
                    <h4 className="text-green-400 font-mono font-semibold capitalize">
                      {pattern.type.replace('_', ' ')}
                    </h4>
                    <p className="text-green-400/70 text-sm">
                      Frequency: {pattern.frequency} • Sophistication: {pattern.sophistication}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-mono ${
                    pattern.frequency === 'high' ? 'bg-red-400/20 text-red-400' :
                    pattern.frequency === 'medium' ? 'bg-yellow-400/20 text-yellow-400' :
                    'bg-green-400/20 text-green-400'
                  }`}>
                    {pattern.frequency.toUpperCase()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const ThreatHunting = () => (
    <div className="cyber-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Crosshair className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-green-400 font-mono">Threat Hunting</h3>
        </div>
        <button
          onClick={startThreatHunt}
          disabled={hunting}
          className="neon-btn danger flex items-center space-x-2"
        >
          {hunting ? (
            <>
              <div className="cyber-loader w-4 h-4"></div>
              <span>Hunting...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Start Hunt</span>
            </>
          )}
        </button>
      </div>

      {huntResults && (
        <div className="space-y-4">
          <div className="p-4 bg-black/50 rounded-lg border border-purple-400/30">
            <h4 className="text-purple-400 font-mono font-semibold mb-2">Hunt Results</h4>
            <p className="text-green-400 mb-3">
              {huntResults.threats_found} threat{huntResults.threats_found !== 1 ? 's' : ''} discovered
            </p>
            
            {huntResults.threats && huntResults.threats.map((threat, index) => (
              <div key={index} className="mb-3 p-3 bg-black/30 rounded border-l-4 border-red-400">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-red-400 font-mono text-sm capitalize">
                    {threat.type.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-mono ${
                    threat.severity === 'high' ? 'bg-red-400/20 text-red-400' :
                    threat.severity === 'medium' ? 'bg-yellow-400/20 text-yellow-400' :
                    'bg-green-400/20 text-green-400'
                  }`}>
                    {threat.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-green-400/70 text-sm">
                  Confidence: {(threat.confidence * 100).toFixed(1)}%
                </p>
                <p className="text-green-400/60 text-xs mt-1">
                  {threat.recommended_action}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!huntResults && (
        <div className="text-center py-8">
          <Crosshair className="w-12 h-12 text-purple-400/30 mx-auto mb-3" />
          <p className="text-green-400/70 font-mono">Ready to hunt for threats</p>
          <p className="text-green-400/50 text-sm">Click "Start Hunt" to begin proactive threat detection</p>
        </div>
      )}
    </div>
  );

  const GlobalStatistics = () => {
    if (!threatData?.global_statistics) return null;

    return (
      <div className="cyber-card p-6">
        <h3 className="text-xl font-semibold text-green-400 font-mono mb-4">
          Global Statistics
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
            <span className="text-green-400/70">Detection Accuracy</span>
            <div className="flex items-center space-x-3">
              <div className="w-32 cyber-progress">
                <div 
                  className="cyber-progress-bar" 
                  style={{width: `${threatData.global_statistics.detection_accuracy * 100}%`}}
                ></div>
              </div>
              <span className="text-green-400 font-mono">
                {(threatData.global_statistics.detection_accuracy * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
            <span className="text-green-400/70">False Positive Rate</span>
            <div className="flex items-center space-x-3">
              <div className="w-32 cyber-progress">
                <div 
                  className="cyber-progress-bar" 
                  style={{width: `${threatData.global_statistics.false_positive_rate * 100}%`}}
                ></div>
              </div>
              <span className="text-green-400 font-mono">
                {(threatData.global_statistics.false_positive_rate * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
            <span className="text-green-400/70">Processing Speed</span>
            <span className="text-green-400 font-mono">
              {threatData.global_statistics.processing_speed.toFixed(2)}s
            </span>
          </div>
        </div>
      </div>
    );
  };

  const Recommendations = () => {
    if (!threatData?.recommendations) return null;

    return (
      <div className="cyber-card p-6">
        <h3 className="text-xl font-semibold text-green-400 font-mono mb-4">
          Security Recommendations
        </h3>
        
        <div className="space-y-3">
          {threatData.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-black/30 rounded-lg">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-green-400/80 text-sm">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!threatData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="cyber-loader mb-4"></div>
          <p className="text-green-400 font-mono">Loading Threat Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 relative z-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-green-400 font-mono mb-2">
          Threat Intelligence
        </h1>
        <p className="text-green-400/70 font-mono">
          Real-time threat analysis and proactive security monitoring
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <ThreatLevelPanel />
          <ThreatPatterns />
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          <ThreatHunting />
          <GlobalStatistics />
          <Recommendations />
        </div>
      </div>

      {/* Pattern Detail Modal */}
      {selectedPattern && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="cyber-card max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-green-400 font-mono capitalize">
                {selectedPattern.type.replace('_', ' ')} Analysis
              </h3>
              <button
                onClick={() => setSelectedPattern(null)}
                className="text-green-400 hover:text-red-400 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-green-400/70 text-sm mb-1">Frequency</p>
                  <p className="text-green-400 font-mono">{selectedPattern.frequency}</p>
                </div>
                <div>
                  <p className="text-green-400/70 text-sm mb-1">Sophistication</p>
                  <p className="text-green-400 font-mono">{selectedPattern.sophistication}</p>
                </div>
              </div>
              
              <div>
                <p className="text-green-400/70 text-sm mb-2">Description</p>
                <p className="text-green-400/80 text-sm">
                  This threat pattern represents a {selectedPattern.sophistication} level attack 
                  with {selectedPattern.frequency} frequency in the current threat landscape.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatIntelligence;