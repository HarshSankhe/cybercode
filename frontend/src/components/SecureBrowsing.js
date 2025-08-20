import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Globe,
  Shield,
  Lock,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Wifi,
  Server
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SecureBrowsing = () => {
  const [currentSession, setCurrentSession] = useState(null);
  const [url, setUrl] = useState('');
  const [navigating, setNavigating] = useState(false);
  const [navigationResult, setNavigationResult] = useState(null);
  const [browsingSessions, setBrowsingSessions] = useState([]);
  const [showWarnings, setShowWarnings] = useState(true);

  useEffect(() => {
    loadBrowsingSessions();
  }, []);

  const loadBrowsingSessions = async () => {
    // In a real implementation, you'd fetch session history from the API
    // For now, we'll use local state
  };

  const createSecureSession = async () => {
    try {
      const response = await axios.post(`${API}/secure-browsing/session`);
      setCurrentSession(response.data);
      setNavigationResult(null);
    } catch (error) {
      console.error('Failed to create secure session:', error);
    }
  };

  const navigateSecure = async () => {
    if (!currentSession || !url) return;

    setNavigating(true);
    setNavigationResult(null);

    try {
      const response = await axios.post(`${API}/secure-browsing/navigate`, null, {
        params: {
          session_id: currentSession.session_id,
          url: url
        }
      });

      setNavigationResult(response.data);
      
      // Add to session history
      const sessionData = {
        id: Date.now(),
        url: url,
        timestamp: new Date().toISOString(),
        status: response.data.status,
        warnings: response.data.security_warnings || [],
        safe: response.data.safe
      };
      
      setBrowsingSessions(prev => [sessionData, ...prev.slice(0, 9)]);

    } catch (error) {
      console.error('Navigation failed:', error);
      setNavigationResult({
        status: 'error',
        error: error.response?.data?.detail || 'Navigation failed'
      });
    } finally {
      setNavigating(false);
    }
  };

  const clearSession = () => {
    setCurrentSession(null);
    setUrl('');
    setNavigationResult(null);
  };

  const SecurityStatus = () => (
    <div className="cyber-card p-6 border-2 border-cyan-400">
      <div className="flex items-center space-x-4 mb-4">
        <div className={`p-3 rounded-full ${
          currentSession 
            ? 'bg-gradient-to-r from-cyan-400 to-blue-600' 
            : 'bg-gradient-to-r from-gray-400 to-gray-600'
        }`}>
          <Shield className="w-6 h-6 text-black" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-cyan-400 font-mono">
            {currentSession ? 'SECURE SESSION ACTIVE' : 'NO ACTIVE SESSION'}
          </h3>
          <p className="text-green-400/70">
            {currentSession 
              ? `Session ID: ${currentSession.session_id.substring(0, 8)}...`
              : 'Create a secure session to begin safe browsing'
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-black/30 rounded-lg">
          <Lock className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-green-400 font-mono text-sm">Encrypted</p>
          <p className="text-green-400/70 text-xs">End-to-end encryption</p>
        </div>
        
        <div className="text-center p-4 bg-black/30 rounded-lg">
          <Server className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <p className="text-purple-400 font-mono text-sm">Isolated</p>
          <p className="text-green-400/70 text-xs">Sandboxed environment</p>
        </div>
        
        <div className="text-center p-4 bg-black/30 rounded-lg">
          <Wifi className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
          <p className="text-cyan-400 font-mono text-sm">Anonymous</p>
          <p className="text-green-400/70 text-xs">Identity protected</p>
        </div>
      </div>
    </div>
  );

  const BrowserInterface = () => (
    <div className="cyber-card p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Globe className="w-6 h-6 text-cyan-400" />
        <h3 className="text-xl font-semibold text-green-400 font-mono">Secure Browser</h3>
      </div>

      {/* Session Controls */}
      <div className="flex space-x-3 mb-6">
        <button
          onClick={createSecureSession}
          disabled={!!currentSession}
          className="neon-btn info flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Session</span>
        </button>
        
        {currentSession && (
          <button
            onClick={clearSession}
            className="neon-btn danger flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Session</span>
          </button>
        )}
      </div>

      {/* URL Input */}
      {currentSession && (
        <div className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL to navigate safely..."
                className="w-full px-4 py-3 bg-black/50 border border-green-400/30 rounded-lg text-green-400 placeholder-green-400/50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all font-mono"
                onKeyPress={(e) => e.key === 'Enter' && navigateSecure()}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Lock className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <button
              onClick={navigateSecure}
              disabled={!url || navigating}
              className="neon-btn flex items-center space-x-2 px-6"
            >
              {navigating ? (
                <>
                  <div className="cyber-loader w-4 h-4"></div>
                  <span>Navigating...</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  <span>Go</span>
                </>
              )}
            </button>
          </div>

          {/* Security Settings */}
          <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
            <div className="flex items-center space-x-2">
              {showWarnings ? (
                <Eye className="w-5 h-5 text-green-400" />
              ) : (
                <EyeOff className="w-5 h-5 text-green-400" />
              )}
              <span className="text-green-400 font-mono text-sm">Show Security Warnings</span>
            </div>
            <button
              onClick={() => setShowWarnings(!showWarnings)}
              className={`w-12 h-6 rounded-full transition-all ${
                showWarnings ? 'bg-green-400' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-black rounded-full transition-all ${
                showWarnings ? 'translate-x-6' : 'translate-x-0.5'
              }`}></div>
            </button>
          </div>
        </div>
      )}

      {/* Navigation Results */}
      {navigationResult && (
        <div className={`mt-6 p-4 rounded-lg border ${
          navigationResult.status === 'success' 
            ? navigationResult.safe 
              ? 'border-green-400 bg-green-400/10' 
              : 'border-yellow-400 bg-yellow-400/10'
            : 'border-red-400 bg-red-400/10'
        }`}>
          <div className="flex items-center space-x-3 mb-3">
            {navigationResult.status === 'success' ? (
              navigationResult.safe ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              )
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-400" />
            )}
            
            <div>
              <p className={`font-mono font-semibold ${
                navigationResult.status === 'success'
                  ? navigationResult.safe
                    ? 'text-green-400'
                    : 'text-yellow-400'
                  : 'text-red-400'
              }`}>
                {navigationResult.status === 'success'
                  ? navigationResult.safe
                    ? 'SAFE CONNECTION'
                    : 'POTENTIAL RISKS DETECTED'
                  : 'NAVIGATION FAILED'
                }
              </p>
              <p className="text-green-400/70 text-sm">
                {navigationResult.url || url}
              </p>
            </div>
          </div>

          {navigationResult.security_warnings && navigationResult.security_warnings.length > 0 && showWarnings && (
            <div className="space-y-2">
              <p className="text-yellow-400 font-mono text-sm font-semibold">Security Warnings:</p>
              {navigationResult.security_warnings.map((warning, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-yellow-400/80 text-sm">{warning}</p>
                </div>
              ))}
            </div>
          )}

          {navigationResult.error && (
            <p className="text-red-400 text-sm mt-2">{navigationResult.error}</p>
          )}
        </div>
      )}
    </div>
  );

  const BrowsingHistory = () => (
    <div className="cyber-card p-6">
      <h3 className="text-xl font-semibold text-green-400 font-mono mb-4">Session History</h3>
      
      {browsingSessions.length === 0 ? (
        <div className="text-center py-8">
          <Globe className="w-12 h-12 text-green-400/30 mx-auto mb-3" />
          <p className="text-green-400/70">No browsing history</p>
          <p className="text-green-400/50 text-sm">Your secure sessions will appear here</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {browsingSessions.map((session) => (
            <div 
              key={session.id} 
              className={`p-3 rounded-lg border ${
                session.safe 
                  ? 'border-green-400/30 bg-green-400/5' 
                  : 'border-yellow-400/30 bg-yellow-400/5'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  session.safe ? 'bg-green-400' : 'bg-yellow-400'
                }`}></div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-green-400 font-mono text-sm truncate">
                    {session.url}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-green-400/60 text-xs">
                      {new Date(session.timestamp).toLocaleString()}
                    </p>
                    {session.warnings.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 text-yellow-400" />
                        <span className="text-yellow-400 text-xs">
                          {session.warnings.length} warning{session.warnings.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <button className="text-green-400/60 hover:text-green-400 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const SecurityTips = () => (
    <div className="cyber-card p-6">
      <h3 className="text-xl font-semibold text-green-400 font-mono mb-4">Security Tips</h3>
      
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
          <p className="text-green-400/80 text-sm">
            Always verify URLs before navigating to suspicious sites
          </p>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
          <p className="text-green-400/80 text-sm">
            Sessions are automatically isolated and destroyed after use
          </p>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
          <p className="text-green-400/80 text-sm">
            Never enter personal information in suspicious sites
          </p>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
          <p className="text-green-400/80 text-sm">
            Monitor security warnings and proceed with caution
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 relative z-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-green-400 font-mono mb-2">
          Secure Browsing
        </h1>
        <p className="text-green-400/70 font-mono">
          Navigate suspicious content safely with isolated, encrypted sessions
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <SecurityStatus />
          <BrowserInterface />
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          <BrowsingHistory />
          <SecurityTips />
        </div>
      </div>
    </div>
  );
};

export default SecureBrowsing;