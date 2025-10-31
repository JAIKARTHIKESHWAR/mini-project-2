import React, { useState } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    profile: {
      name: 'Fragrance Explorer',
      email: 'explorer@fragranceai.com',
      subscription: 'Premium',
      avatar: '👤'
    },
    preferences: {
      theme: 'dark',
      notifications: true,
      autoSave: true,
      language: 'english',
      units: 'metric'
    },
    privacy: {
      dataCollection: true,
      personalizedAds: false,
      shareUsage: true,
      publicProfile: false
    }
  });

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const SettingSection = ({ title, icon, children }) => (
    <div className="glass-panel mb-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-xl font-montserrat font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );

  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <label className="font-medium text-white">{label}</label>
        <p className="text-sm text-accent-silver">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-accent-cyan' : 'bg-accent-silver/30'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const SelectInput = ({ value, onChange, options, label, description }) => (
    <div className="py-3">
      <label className="block font-medium text-white mb-1">{label}</label>
      <p className="text-sm text-accent-silver mb-2">{description}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-white/5 border border-accent-silver/20 rounded-lg text-white focus:border-accent-cyan focus:outline-none transition-colors"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-montserrat font-bold bg-gradient-to-r from-accent-cyan to-accent-gold bg-clip-text text-transparent mb-4">
          ⚙️ Settings
        </h1>
        <p className="text-xl text-accent-silver">
          Customize your Fragrance AI experience and manage your preferences
        </p>
      </div>

      {/* Profile Settings */}
      <SettingSection title="Profile" icon="👤">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium text-white mb-2">Display Name</label>
            <input
              type="text"
              value={settings.profile.name}
              onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-accent-silver/20 rounded-lg text-white focus:border-accent-cyan focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block font-medium text-white mb-2">Email</label>
            <input
              type="email"
              value={settings.profile.email}
              onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-accent-silver/20 rounded-lg text-white focus:border-accent-cyan focus:outline-none transition-colors"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block font-medium text-white mb-2">Subscription</label>
          <div className="flex items-center gap-3 p-3 bg-accent-cyan/10 border border-accent-cyan rounded-lg">
            <span className="text-accent-cyan font-semibold">{settings.profile.subscription}</span>
            <span className="text-sm text-accent-silver">Active until Dec 2024</span>
            <button className="ml-auto btn-secondary text-sm px-3 py-1">
              Manage
            </button>
          </div>
        </div>
      </SettingSection>

      {/* Preferences */}
      <SettingSection title="Preferences" icon="🎛️">
        <div className="space-y-1">
          <SelectInput
            value={settings.preferences.theme}
            onChange={(value) => handleSettingChange('preferences', 'theme', value)}
            label="Theme"
            description="Choose your preferred interface theme"
            options={[
              { value: 'dark', label: 'Dark Theme' },
              { value: 'light', label: 'Light Theme' },
              { value: 'auto', label: 'System Default' }
            ]}
          />
          
          <SelectInput
            value={settings.preferences.language}
            onChange={(value) => handleSettingChange('preferences', 'language', value)}
            label="Language"
            description="Select your preferred language"
            options={[
              { value: 'english', label: 'English' },
              { value: 'spanish', label: 'Spanish' },
              { value: 'french', label: 'French' },
              { value: 'german', label: 'German' }
            ]}
          />
          
          <SelectInput
            value={settings.preferences.units}
            onChange={(value) => handleSettingChange('preferences', 'units', value)}
            label="Measurement Units"
            description="Choose your preferred unit system"
            options={[
              { value: 'metric', label: 'Metric (ml, cm)' },
              { value: 'imperial', label: 'Imperial (oz, inches)' }
            ]}
          />

          <ToggleSwitch
            enabled={settings.preferences.notifications}
            onChange={(value) => handleSettingChange('preferences', 'notifications', value)}
            label="Push Notifications"
            description="Receive alerts for new recommendations and updates"
          />

          <ToggleSwitch
            enabled={settings.preferences.autoSave}
            onChange={(value) => handleSettingChange('preferences', 'autoSave', value)}
            label="Auto-save Blends"
            description="Automatically save your custom fragrance creations"
          />
        </div>
      </SettingSection>

      {/* Privacy & Data */}
      <SettingSection title="Privacy & Data" icon="🔒">
        <div className="space-y-1">
          <ToggleSwitch
            enabled={settings.privacy.dataCollection}
            onChange={(value) => handleSettingChange('privacy', 'dataCollection', value)}
            label="Data Collection"
            description="Allow anonymous usage data to improve recommendations"
          />

          <ToggleSwitch
            enabled={settings.privacy.personalizedAds}
            onChange={(value) => handleSettingChange('privacy', 'personalizedAds', value)}
            label="Personalized Ads"
            description="Show fragrance recommendations based on your activity"
          />

          <ToggleSwitch
            enabled={settings.privacy.shareUsage}
            onChange={(value) => handleSettingChange('privacy', 'shareUsage', value)}
            label="Share Usage Data"
            description="Help improve Fragrance AI by sharing usage patterns"
          />

          <ToggleSwitch
            enabled={settings.privacy.publicProfile}
            onChange={(value) => handleSettingChange('privacy', 'publicProfile', value)}
            label="Public Profile"
            description="Make your fragrance collections visible to others"
          />
        </div>
      </SettingSection>

      {/* Actions */}
      <div className="glass-panel">
        <h3 className="text-xl font-montserrat font-semibold mb-4">Account Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="btn-secondary py-3">
            Export My Data
          </button>
          <button className="btn-secondary py-3 text-red-400 border-red-400 hover:bg-red-400/10">
            Delete Account
          </button>
          <button className="btn-primary py-3 md:col-span-2">
            Save All Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;