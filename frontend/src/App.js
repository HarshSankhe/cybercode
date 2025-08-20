import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import Dashboard from "./components/Dashboard";
import MediaAnalysis from "./components/MediaAnalysis";
import ThreatIntelligence from "./components/ThreatIntelligence";
import SecureBrowsing from "./components/SecureBrowsing";
import Analytics from "./components/Analytics";
import Settings from "./components/Settings";
import Login from "./components/Login";
import { Toaster } from "./components/ui/toaster";
import MatrixBackground from "./components/MatrixBackground";
import Sidebar from "./components/Sidebar";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status and load system status
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          setIsAuthenticated(true);
          setUser({ username: 'admin', role: 'admin' }); // Simplified
        }

        // Load system status
        const response = await axios.get(`${API}/system/status`);
        setSystemStatus(response.data);
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const response = await axios.post(`${API}/auth/login`, credentials);
      if (response.data.status === 'success') {
        localStorage.setItem('authToken', response.data.token);
        setIsAuthenticated(true);
        setUser(response.data.user);
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="cyber-loader mb-4"></div>
          <p className="text-cyan-400 text-xl font-mono">Initializing Security Matrix...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <MatrixBackground />
        <Login onLogin={handleLogin} />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="App min-h-screen bg-black text-green-400 relative overflow-hidden">
      <MatrixBackground />
      <BrowserRouter>
        <div className="flex h-screen">
          <Sidebar onLogout={handleLogout} user={user} />
          
          <div className="flex-1 relative z-10">
            <Routes>
              <Route path="/" element={<Dashboard systemStatus={systemStatus} />} />
              <Route path="/media-analysis" element={<MediaAnalysis />} />
              <Route path="/threat-intelligence" element={<ThreatIntelligence />} />
              <Route path="/secure-browsing" element={<SecureBrowsing />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;