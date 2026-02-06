'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SmartParsingSettings {
  quantities: string[];
  doseForms: string[];
  dosePatterns: string[];
}

export default function SmartParsingSettingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [settings, setSettings] = useState<SmartParsingSettings>({
    quantities: ['1', '2', '3', '4', '5', '10', '15', '20', '30', '50', '100'],
    doseForms: ['tablet', 'capsule', 'drop', 'puff', 'ml', 'tsp', 'tbsp', 'piece', 'cap'],
    dosePatterns: ['1-0-1', '1-1-1', '2-2-2', '0-0-1', '1-0-0', '0-1-0', '2-0-2', '3-0-3']
  });
  const [newQuantity, setNewQuantity] = useState('');
  const [newDoseForm, setNewDoseForm] = useState('');
  const [newDosePattern, setNewDosePattern] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(JSON.parse(user));
    loadSettings();
  }, [router]);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/smart-parsing');
      const data = await res.json();
      if (data.quantities) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      await fetch('/api/smart-parsing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      setMessage('Settings saved successfully!');
    } catch (error) {
      setMessage('Error saving settings');
    } finally {
      setIsLoading(false);
    }
  };

  const addQuantity = () => {
    if (newQuantity && !settings.quantities.includes(newQuantity)) {
      setSettings(prev => ({ ...prev, quantities: [...prev.quantities, newQuantity].sort() }));
      setNewQuantity('');
    }
  };

  const removeQuantity = (qty: string) => {
    setSettings(prev => ({ ...prev, quantities: prev.quantities.filter(q => q !== qty) }));
  };

  const addDoseForm = () => {
    if (newDoseForm && !settings.doseForms.includes(newDoseForm.toLowerCase())) {
      setSettings(prev => ({ ...prev, doseForms: [...prev.doseForms, newDoseForm.toLowerCase()].sort() }));
      setNewDoseForm('');
    }
  };

  const removeDoseForm = (form: string) => {
    setSettings(prev => ({ ...prev, doseForms: prev.doseForms.filter(f => f !== form) }));
  };

  const addDosePattern = () => {
    if (newDosePattern && !settings.dosePatterns.includes(newDosePattern)) {
      setSettings(prev => ({ ...prev, dosePatterns: [...prev.dosePatterns, newDosePattern] }));
      setNewDosePattern('');
    }
  };

  const removeDosePattern = (pattern: string) => {
    setSettings(prev => ({ ...prev, dosePatterns: prev.dosePatterns.filter(p => p !== pattern) }));
  };

  if (!currentUser) {
    return <div className="loading" style={{ minHeight: '100vh' }}><div className="spinner"></div></div>;
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link href="/dashboard" className="sidebar-logo">🏥 Homeo PMS</Link>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Settings</div>
            <Link href="/settings" className="nav-link">Settings</Link>
            <Link href="/settings/smart-parsing" className="nav-link active">Smart Parsing</Link>
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/settings" className="btn btn-secondary btn-sm">← Back</Link>
            <div>
              <h1 className="page-title">Smart Parsing Settings</h1>
              <p className="page-subtitle">Configure prescription parsing rules</p>
            </div>
          </div>
        </header>

        <div className="page-content">
          {message && (
            <div style={{ 
              padding: '0.75rem', 
              background: message.includes('Error') ? '#fee2e2' : '#dcfce7', 
              color: message.includes('Error') ? '#991b1b' : '#166534', 
              borderRadius: '0.375rem', 
              marginBottom: '1rem' 
            }}>
              {message}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* Quantities */}
            <div className="card">
              <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Quantities</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                Numeric values recognized in prescriptions
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                {settings.quantities.map(qty => (
                  <span key={qty} className="badge badge-info" style={{ cursor: 'pointer' }} onClick={() => removeQuantity(qty)}>
                    {qty} ×
                  </span>
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Add quantity..."
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                />
                <button className="btn btn-primary" onClick={addQuantity}>Add</button>
              </div>
            </div>

            {/* Dose Forms */}
            <div className="card">
              <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Dose Forms</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                Medicine form types recognized
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                {settings.doseForms.map(form => (
                  <span key={form} className="badge badge-success" style={{ cursor: 'pointer' }} onClick={() => removeDoseForm(form)}>
                    {form} ×
                  </span>
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Add dose form..."
                  value={newDoseForm}
                  onChange={(e) => setNewDoseForm(e.target.value)}
                />
                <button className="btn btn-primary" onClick={addDoseForm}>Add</button>
              </div>
            </div>

            {/* Dose Patterns */}
            <div className="card">
              <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Dose Patterns</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                Dosage frequency patterns (morning-noon-evening)
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                {settings.dosePatterns.map(pattern => (
                  <span key={pattern} className="badge badge-warning" style={{ cursor: 'pointer' }} onClick={() => removeDosePattern(pattern)}>
                    {pattern} ×
                  </span>
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Add pattern (e.g., 1-0-1)..."
                  value={newDosePattern}
                  onChange={(e) => setNewDosePattern(e.target.value)}
                />
                <button className="btn btn-primary" onClick={addDosePattern}>Add</button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <button 
              className="btn btn-primary btn-lg" 
              onClick={saveSettings}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save All Settings'}
            </button>
          </div>

          {/* Example */}
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Example Usage</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              The smart parser will recognize prescriptions like:
            </p>
            <div style={{ marginTop: '0.75rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.375rem', fontFamily: 'monospace' }}>
              <div>Arnica 30C 2-0-2 for 15 days</div>
              <div>Belladonna 30C 1-1-1 for 7 days</div>
              <div>Rhus Tox 30C 1-0-0 for 10 days</div>
              <div>Sulphur 200C 1 tablet 3 times daily</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
