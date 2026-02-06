'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';

export default function RegistrationSettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [settings, setSettings] = useState({
    registrationFee: '100',
    registrationPrefix: 'REG',
    autoGenerate: true,
    allowOnline: true
  });

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      router.push('/login');
      return;
    }
    fetchSettings();
  }, [router]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        // Parse registration settings from the settings array
        const registrationFee = data.find((s: any) => s.key === 'registrationFee')?.value || '100';
        const registrationPrefix = data.find((s: any) => s.key === 'registrationPrefix')?.value || 'REG';
        const autoGenerate = data.find((s: any) => s.key === 'autoGenerate')?.value || 'true';
        const allowOnline = data.find((s: any) => s.key === 'allowOnlineRegistration')?.value || 'true';
        
        setSettings({
          registrationFee,
          registrationPrefix,
          autoGenerate: autoGenerate === 'true',
          allowOnline: allowOnline === 'true'
        });
      }
    } catch (error) {
      setError('Error fetching settings');
    }
    setIsLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const settingsToSave = [
        { key: 'registrationFee', value: settings.registrationFee, type: 'number' },
        { key: 'registrationPrefix', value: settings.registrationPrefix, type: 'string' },
        { key: 'autoGenerate', value: settings.autoGenerate.toString(), type: 'boolean' },
        { key: 'allowOnlineRegistration', value: settings.allowOnline.toString(), type: 'boolean' }
      ];

      for (const setting of settingsToSave) {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(setting)
        });
      }

      setSuccess('Registration settings saved successfully');
    } catch (error) {
      setError('Error saving settings');
    }
  };

  if (isLoading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Header title="Registration Settings" />
          <div className="loading" style={{ minHeight: '100vh' }}><div className="spinner"></div></div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Registration Settings" />
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">Registration Settings</h1>
            <p className="page-subtitle">Configure patient registration preferences</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Registration Configuration</h3>
            </div>
            <div className="card-content">
              <form onSubmit={handleSave} className="form">
                <Input
                  label="Registration Fee (₹)"
                  type="number"
                  step="0.01"
                  value={settings.registrationFee}
                  onChange={(e) => setSettings({ ...settings, registrationFee: e.target.value })}
                  placeholder="0.00"
                />
                <Input
                  label="Registration Number Prefix"
                  value={settings.registrationPrefix}
                  onChange={(e) => setSettings({ ...settings, registrationPrefix: e.target.value })}
                  placeholder="REG"
                  helperText="Registration numbers will be generated as: PREFIX + number (e.g., REG001)"
                />
                <div className="form-group">
                  <label className="form-label">Options</label>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.autoGenerate}
                        onChange={(e) => setSettings({ ...settings, autoGenerate: e.target.checked })}
                      />
                      Auto-generate registration numbers
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.allowOnline}
                        onChange={(e) => setSettings({ ...settings, allowOnline: e.target.checked })}
                      />
                      Allow online registration
                    </label>
                  </div>
                </div>
                <Button type="submit">Save Settings</Button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sidebar component
function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <a href="/settings" className="sidebar-logo">🏥 Homeo PMS</a>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Settings</div>
          <a href="/settings" className="nav-link">General</a>
          <a href="/settings/fees" className="nav-link">Consultation Fees</a>
          <a href="/settings/registration" className="nav-link active">Registration</a>
          <a href="/settings/slots" className="nav-link">Time Slots</a>
          <a href="/settings/smart-parsing" className="nav-link">Smart Parsing</a>
        </div>
      </nav>
    </aside>
  );
}
