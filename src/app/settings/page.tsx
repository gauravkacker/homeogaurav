'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Fee {
  id: string;
  name: string;
  amount: number;
  type: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [fees, setFees] = useState<Fee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('fees');

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(JSON.parse(user));
    loadFees();
  }, [router]);

  const loadFees = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/fees');
      const data = await res.json();
      setFees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading fees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/login');
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
            <div className="nav-section-title">Main</div>
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
            <Link href="/patients" className="nav-link">Patients</Link>
            <Link href="/appointments" className="nav-link">Appointments</Link>
            <Link href="/queue" className="nav-link">Queue</Link>
          </div>
          <div className="nav-section">
            <div className="nav-section-title">Settings</div>
            <Link href="/settings" className="nav-link active">Settings</Link>
            <Link href="/settings/smart-parsing" className="nav-link">Smart Parsing</Link>
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Configure your practice settings</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span className="badge badge-info">{currentUser?.role?.toUpperCase()}</span>
            <button className="btn btn-secondary" onClick={handleLogout}>Sign Out</button>
          </div>
        </header>

        <div className="page-content">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'fees' ? 'active' : ''}`}
              onClick={() => setActiveTab('fees')}
            >
              Consultation Fees
            </button>
            <button
              className={`tab ${activeTab === 'registration' ? 'active' : ''}`}
              onClick={() => setActiveTab('registration')}
            >
              Registration
            </button>
            <button
              className={`tab ${activeTab === 'slots' ? 'active' : ''}`}
              onClick={() => setActiveTab('slots')}
            >
              Time Slots
            </button>
          </div>

          {activeTab === 'fees' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: '600' }}>Consultation Fees</h3>
                <Link href="/settings/fees" className="btn btn-primary btn-sm">
                  + Add Fee
                </Link>
              </div>

              {fees.length === 0 ? (
                <div className="empty-state">
                  <p>No fees configured yet.</p>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fees.map((fee) => (
                      <tr key={fee.id}>
                        <td>{fee.name}</td>
                        <td>
                          <span className="badge badge-info">{fee.type}</span>
                        </td>
                        <td>₹{fee.amount}</td>
                        <td>
                          <button className="btn btn-sm btn-secondary">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'registration' && (
            <div className="card">
              <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Registration Settings</h3>
              <div className="form-group">
                <label className="label">Clinic Name</label>
                <input type="text" className="input" placeholder="Your Clinic Name" />
              </div>
              <div className="form-group">
                <label className="label">Address</label>
                <textarea className="input" rows={3} placeholder="Clinic Address" />
              </div>
              <div className="form-group">
                <label className="label">Phone</label>
                <input type="text" className="input" placeholder="Clinic Phone" />
              </div>
              <div className="form-group">
                <label className="label">Email</label>
                <input type="email" className="input" placeholder="Clinic Email" />
              </div>
              <button className="btn btn-primary">Save Settings</button>
            </div>
          )}

          {activeTab === 'slots' && (
            <div className="card">
              <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Appointment Time Slots</h3>
              <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                Configure your available time slots for appointments.
              </p>
              <div className="form-group">
                <label className="label">Morning Start Time</label>
                <input type="time" className="input" style={{ maxWidth: '200px' }} defaultValue="09:00" />
              </div>
              <div className="form-group">
                <label className="label">Morning End Time</label>
                <input type="time" className="input" style={{ maxWidth: '200px' }} defaultValue="13:00" />
              </div>
              <div className="form-group">
                <label className="label">Evening Start Time</label>
                <input type="time" className="input" style={{ maxWidth: '200px' }} defaultValue="16:00" />
              </div>
              <div className="form-group">
                <label className="label">Evening End Time</label>
                <input type="time" className="input" style={{ maxWidth: '200px' }} defaultValue="20:00" />
              </div>
              <div className="form-group">
                <label className="label">Slot Duration (minutes)</label>
                <select className="input" style={{ maxWidth: '200px' }} defaultValue="30">
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>
              <button className="btn btn-primary">Save Settings</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
