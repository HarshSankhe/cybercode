import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Monitor,
  Palette,
  Database,
  Network,
  Key,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    // User Preferences
    username: 'admin',
    email: 'admin@cypher.matrix',
    notifications: {
      email: true,
      push: true,
      threatAlerts: true,
      systemUpdates: false,
      weeklyReports: true
    },
    
    // Security Settings
    security: {
      twoFactorAuth: false,
      sessionTimeout: 24,
      autoLock: 15,
      secureMode: true,
      encryptStorage: true
    },
    
    // Detection Settings
    detection: {
      threshold: 0.7,
      processingQuality: 'high',
      realtimeMonitoring: false,
      batchProcessing: true,
      autoQuarantine: true
    },
    
    // System Settings
    system: {
      theme: 'cyberpunk',
      language: 'en',
      timezone: 'UTC',
      logLevel: 'info',
      performanceMode: 'balanced'
    }
  });

  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const resetToDefaults = () => {
    // Reset to default values
    setSettings(prev => ({
      ...prev,
      detection: {
        threshold: 0.7,
        processingQuality: 'high',
        realtimeMonitoring: false,
        batchProcessing: true,
        autoQuarantine: true
      }
    }));
  };

  const TabButton = ({ id, label, icon: Icon, active }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-all ${
        active 
          ? 'bg-green-400/20 text-green-400 border border-green-400/50' 
          : 'text-green-400/70 hover:bg-green-400/10 hover:text-green-400'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-mono text-sm">{label}</span>
    </button>
  );

  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
      <div>
        <p className="text-green-400 font-mono">{label}</p>
        {description && (
          <p className="text-green-400/60 text-sm mt-1">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`w-12 h-6 rounded-full transition-all ${
          enabled ? 'bg-green-400' : 'bg-gray-600'
        }`}
      >
        <div className={`w-5 h-5 bg-black rounded-full transition-all ${
          enabled ? 'translate-x-6' : 'translate-x-0.5'
        }`}></div>
      </button>
    </div>
  );

  const GeneralSettings = () => (
    <div className="space-y-6">
      <div className="cyber-card p-6">
        <h3 className="text-xl font-semibold text-green-400 font-mono mb-4">Profile Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-green-400 text-sm font-mono mb-2">Username</label>
            <input
              type="text"
              value={settings.username}
              onChange={(e) => setSettings(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-4 py-3 bg-black/50 border border-green-400/30 rounded-lg text-green-400 placeholder-green-400/50 focus:border-green-400 focus:ring-1 focus:ring-green-400 focus:outline-none transition-all font-mono"
            />
          </div>
          
          <div>
            <label className="block text-green-400 text-sm font-mono mb-2">Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 bg-black/50 border border-green-400/30 rounded-lg text-green-400 placeholder-green-400/50 focus:border-green-400 focus:ring-1 focus:ring-green-400 focus:outline-none transition-all font-mono"
            />
          </div>
        </div>
      </div>

      <div className="cyber-card p-6">
        <h3 className="text-xl font-semibold text-green-400 font-mono mb-4">Notifications</h3>
        
        <div className="space-y-3">
          <ToggleSwitch
            enabled={settings.notifications.email}
            onChange={(value) => updateSetting('notifications', 'email', value)}
            label="Email Notifications"
            description="Receive email alerts for important events"
          />
          
          <ToggleSwitch
            enabled={settings.notifications.threatAlerts}
            onChange={(value) => updateSetting('notifications', 'threatAlerts', value)}
            label="Threat Alerts"
            description="Immediate notifications for detected threats"
          />
          
          <ToggleSwitch
            enabled={settings.notifications.weeklyReports}
            onChange={(value) => updateSetting('notifications', 'weeklyReports', value)}
            label="Weekly Reports"
            description="Summary of weekly activity and statistics"
          />
        </div>
      </div>
    </div>
  );

  const SecuritySettings = () => (
    <div className="space-y-6">
      <div className="cyber-card p-6">
        <h3 className="text-xl font-semibold text-green-400 font-mono mb-4">Authentication</h3>
        
        <div className="space-y-4">
          <ToggleSwitch
            enabled={settings.security.twoFactorAuth}
            onChange={(value) => updateSetting('security', 'twoFactorAuth', value)}
            label="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
          />
          
          <div>
            <label className="block text-green-400 text-sm font-mono mb-2">
              Session Timeout (hours)
            </label>
            <select
              value={settings.security.sessionTimeout}
              onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-black/50 border border-green-400/30 rounded-lg text-green-400 focus:border-green-400 focus:ring-1 focus:ring-green-400 focus:outline-none transition-all font-mono"
            >
              <option value={1}>1 Hour</option>
              <option value={8}>8 Hours</option>
              <option value={24}>24 Hours</option>
              <option value={168}>1 Week</option>
            </select>
          </div>
        </div>
      </div>

      <div className="cyber-card p-6">
        <h3 className="text-xl font-semibold text-green-400 font-mono mb-4">Security Features</h3>
        
        <div className="space-y-3">
          <ToggleSwitch
            enabled={settings.security.secureMode}
            onChange={(value) => updateSetting('security', 'secureMode', value)}
            label="Secure Mode"
            description="Enhanced security with additional verification steps"
          />
          
          <ToggleSwitch
            enabled={settings.security.encryptStorage}
            onChange={(value) => updateSetting('security', 'encryptStorage', value)}
            label="Encrypt Local Storage"
            description="Encrypt all locally stored data and cache"
          />
        </div>
      </div>

      <div className="cyber-card p-6">
        <h3 className="text-xl font-semibold text-green-400 font-mono mb-4">API Access</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-green-400 text-sm font-mono mb-2">API Key</label>
            <div className="flex space-x-2">
              <input
                type={showApiKey ? 'text' : 'password'}
                value="cypher_api_key_************************"
                readOnly
                className="flex-1 px-4 py-3 bg-black/50 border border-green-400/30 rounded-lg text-green-400 font-mono"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="px-4 py-3 bg-black/50 border border-green-400/30 rounded-lg text-green-400 hover:border-green-400 transition-colors"
              >
                {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              <button className="neon-btn">Regenerate</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const DetectionSettings = () => (
    <div className="space-y-6">
      <div className="cyber-card p-6">
        <h3 className="text-xl font-semibold text-green-400 font-mono mb-4">Detection Parameters</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-green-400 text-sm font-mono mb-2">
              Detection Threshold: {settings.detection.threshold}
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={settings.detection.threshold}
              onChange={(e) => updateSetting('detection', 'threshold', parseFloat(e.target.value))}
              className="w-full h-2 bg-black/50 rounded-lg appearance-none slider-thumb"
            />
            <div className="flex justify-between text-xs text-green-400/60 font-mono mt-1">
              <span>More Sensitive</span>
              <span>Less Sensitive</span>
            </div>
          </div>
          
          <div>
            <label className="block text-green-400 text-sm font-mono mb-2">Processing Quality</label>
            <select
              value={settings.detection.processingQuality}
              onChange={(e) => updateSetting('detection', 'processingQuality', e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-green-400/30 rounded-lg text-green-400 focus:border-green-400 focus:ring-1 focus:ring-green-400 focus:outline-none transition-all font-mono"
            >
              <option value="low">Low - Fast processing</option>
              <option value="medium">Medium - Balanced</option>
              <option value="high">High - Best accuracy</option>
              <option value="ultra">Ultra - Maximum precision</option>
            </select>
          </div>
        </div>
      </div>

      <div className="cyber-card p-6">
        <h3 className="text-xl font-semibold text-green-400 font-mono mb-4">Processing Options</h3>
        
        <div className="space-y-3">
          <ToggleSwitch
            enabled={settings.detection.realtimeMonitoring}
            onChange={(value) => updateSetting('detection', 'realtimeMonitoring', value)}
            label="Real-time Monitoring"
            description="Continuously monitor for threats in real-time"
          />
          
          <ToggleSwitch
            enabled={settings.detection.batchProcessing}
            onChange={(value) => updateSetting('detection', 'batchProcessing', value)}
            label="Batch Processing"
            description="Process multiple files simultaneously for efficiency"
          />
          
          <ToggleSwitch
            enabled={settings.detection.autoQuarantine}
            onChange={(value) => updateSetting('detection', 'autoQuarantine', value)}
            label="Auto Quarantine"
            description="Automatically isolate detected threats"
          />
        </div>
      </div>
    </div>
  );

  const SystemSettings = () => (
    <div className="space-y-6">
      <div className="cyber-card p-6">
        <h3 className="text-xl font-semibold text-green-400 font-mono mb-4">Appearance</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-green-400 text-sm font-mono mb-2">Theme</label>
            <select
              value={settings.system.theme}
              onChange={(e) => updateSetting('system', 'theme', e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-green-400/30 rounded-lg text-green-400 focus:border-green-400 focus:ring-1 focus:ring-green-400 focus:outline-none transition-all font-mono"
            >
              <option value="cyberpunk">Cyberpunk Matrix</option>
              <option value="neon">Neon Grid</option>
              <option value="dark">Dark Terminal</option>
              <option value="classic">Classic Green</option>
            </select>
          </div>
          
          <div>
            <label className="block text-green-400 text-sm font-mono mb-2">Language</label>
            <select
              value={settings.system.language}
              onChange={(e) => updateSetting('system', 'language', e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-green-400/30 rounded-lg text-green-400 focus:border-green-400 focus:ring-1 focus:ring-green-400 focus:outline-none transition-all font-mono"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </div>
      </div>

      <div className="cyber-card p-6">
        <h3 className="text-xl font-semibold text-green-400 font-mono mb-4">Performance</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-green-400 text-sm font-mono mb-2">Performance Mode</label>
            <select
              value={settings.system.performanceMode}
              onChange={(e) => updateSetting('system', 'performanceMode', e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-green-400/30 rounded-lg text-green-400 focus:border-green-400 focus:ring-1 focus:ring-green-400 focus:outline-none transition-all font-mono"
            >
              <option value="eco">Eco - Low power usage</option>
              <option value="balanced">Balanced - Optimal performance</option>
              <option value="performance">Performance - Maximum speed</option>
              <option value="turbo">Turbo - Extreme performance</option>
            </select>
          </div>
          
          <div>
            <label className="block text-green-400 text-sm font-mono mb-2">Log Level</label>
            <select
              value={settings.system.logLevel}
              onChange={(e) => updateSetting('system', 'logLevel', e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-green-400/30 rounded-lg text-green-400 focus:border-green-400 focus:ring-1 focus:ring-green-400 focus:outline-none transition-all font-mono"
            >
              <option value="error">Error - Critical issues only</option>
              <option value="warn">Warning - Important messages</option>
              <option value="info">Info - General information</option>
              <option value="debug">Debug - Detailed logging</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'detection', label: 'Detection', icon: Monitor },
    { id: 'system', label: 'System', icon: SettingsIcon }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return <GeneralSettings />;
      case 'security': return <SecuritySettings />;
      case 'detection': return <DetectionSettings />;
      case 'system': return <SystemSettings />;
      default: return <GeneralSettings />;
    }
  };

  return (
    <div className="p-8 space-y-8 relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-green-400 font-mono mb-2">Settings</h1>
          <p className="text-green-400/70 font-mono">Configure your security matrix preferences</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {saved && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-400/20 border border-green-400/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-mono text-sm">Settings saved</span>
            </div>
          )}
          
          <button
            onClick={resetToDefaults}
            className="neon-btn danger flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="neon-btn flex items-center space-x-2"
          >
            {saving ? (
              <div className="cyber-loader w-4 h-4"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Settings Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="cyber-card p-6">
          <h3 className="text-lg font-semibold text-green-400 font-mono mb-4">Settings</h3>
          <nav className="space-y-2">
            {tabs.map(tab => (
              <TabButton
                key={tab.id}
                id={tab.id}
                label={tab.label}
                icon={tab.icon}
                active={activeTab === tab.id}
              />
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;