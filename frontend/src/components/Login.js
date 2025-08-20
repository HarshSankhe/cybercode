import React, { useState } from 'react';
import { Shield, Eye, EyeOff, User, Lock, Zap } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await onLogin(credentials);
    
    if (!result.success) {
      setError(result.error || 'Authentication failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Shield className="w-16 h-16 text-green-400" />
              <div className="absolute inset-0 w-16 h-16 border-2 border-green-400/30 rounded-full animate-ping"></div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-green-400 font-mono mb-2">
            CYPHER MATRIX
          </h1>
          <p className="text-green-400/70 font-mono">
            Advanced DeepFake Detection System
          </p>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm">Quantum Security Enabled</span>
          </div>
        </div>

        {/* Login Form */}
        <div className="cyber-card">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-green-400 font-mono mb-2">
              Security Access
            </h2>
            <p className="text-green-400/60 text-sm">
              Enter your credentials to access the defense matrix
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded bg-red-900/30 border border-red-400/50">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-green-400 text-sm font-mono mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-green-400/50" />
                </div>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-black/50 border border-green-400/30 rounded-lg text-green-400 placeholder-green-400/50 focus:border-green-400 focus:ring-1 focus:ring-green-400 focus:outline-none transition-all font-mono"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-green-400 text-sm font-mono mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-green-400/50" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="w-full pl-10 pr-12 py-3 bg-black/50 border border-green-400/30 rounded-lg text-green-400 placeholder-green-400/50 focus:border-green-400 focus:ring-1 focus:ring-green-400 focus:outline-none transition-all font-mono"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-400/50 hover:text-green-400 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full neon-btn py-3 relative overflow-hidden group"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="cyber-loader w-4 h-4"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <span>Access Matrix</span>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-4 border-t border-green-400/20">
            <p className="text-green-400/60 text-xs font-mono mb-2">Demo Credentials:</p>
            <div className="space-y-1">
              <p className="text-green-400/80 text-xs font-mono">Username: admin</p>
              <p className="text-green-400/80 text-xs font-mono">Password: secure123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-green-400/50 text-sm font-mono">
            Powered by Quantum AI • Matrix v2.0.0
          </p>
          <div className="flex justify-center items-center space-x-4 mt-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400/70 text-xs">System Online</span>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-cyan-400/70 text-xs">Secure Connection</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;