'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ActivityLog {
  id: string;
  userId: string;
  userName?: string;
  action: string;
  module: string;
  details?: string;
  createdAt: string;
}

export default function ActivityLogPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(user);
    if (parsedUser.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    setCurrentUser(parsedUser);
    loadActivities();
  }, [router]);

  const loadActivities = async () => {
    setIsLoading(true);
    try {
      // For demo, we'll create some sample activities
      const sampleActivities: ActivityLog[] = [
        { id: '1', userId: '1', userName: 'Dr. Smith', action: 'LOGIN', module: 'Auth', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: '2', userId: '1', userName: 'Dr. Smith', action: 'CREATE', module: 'Patient', details: 'New patient: John Doe', createdAt: new Date(Date.now() - 3000000).toISOString() },
        { id: '3', userId: '1', userName: 'Dr. Smith', action: 'CREATE', module: 'Prescription', details: 'Prescription for Jane Smith', createdAt: new Date(Date.now() - 2400000).toISOString() },
        { id: '4', userId: '2', userName: 'Admin User', action: 'UPDATE', module: 'Settings', details: 'Updated consultation fees', createdAt: new Date(Date.now() - 1800000).toISOString() },
        { id: '5', userId: '1', userName: 'Dr. Smith', action: 'CREATE', module: 'Appointment', details: 'New appointment for Rajesh Kumar', createdAt: new Date(Date.now() - 1200000).toISOString() },
        { id: '6', userId: '3', userName: 'Receptionist', action: 'CREATE', module: 'Patient', details: 'New patient: Amit Patel', createdAt: new Date(Date.now() - 600000).toISOString() },
        { id: '7', userId: '1', userName: 'Dr. Smith', action: 'LOGOUT', module: 'Auth', createdAt: new Date(Date.now() - 300000).toISOString() }
      ];
      setActivities(sampleActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const badges: Record<string, string> = {
      LOGIN: 'badge-success',
      LOGOUT: 'badge-neutral',
      CREATE: 'badge-info',
      UPDATE: 'badge-warning',
      DELETE: 'badge-danger'
    };
    return badges[action] || 'badge-neutral';
  };

  if (isLoading) {
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
            <div className="nav-section-title">Admin</div>
            <Link href="/admin/users" className="nav-link">Users</Link>
            <Link href="/admin/activity-log" className="nav-link active">Activity Log</Link>
          </div>
          <div className="nav-section">
            <div className="nav-section-title">Main</div>
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <h1 className="page-title">Activity Log</h1>
            <p className="page-subtitle">Track system activities and user actions</p>
          </div>
        </header>

        <div className="page-content">
          <div className="card">
            {activities.length === 0 ? (
              <div className="empty-state">
                <p>No activities recorded yet.</p>
              </div>
            ) : (
              <div>
                {activities.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div 
                      className="activity-icon" 
                      style={{ 
                        background: activity.action === 'CREATE' ? '#dbeafe' : 
                                   activity.action === 'UPDATE' ? '#fef3c7' : 
                                   activity.action === 'DELETE' ? '#fee2e2' : '#dcfce7',
                        color: activity.action === 'CREATE' ? '#2563eb' : 
                               activity.action === 'UPDATE' ? '#d97706' : 
                               activity.action === 'DELETE' ? '#dc2626' : '#16a34a'
                      }}
                    >
                      {activity.action === 'CREATE' && '➕'}
                      {activity.action === 'UPDATE' && '✏️'}
                      {activity.action === 'DELETE' && '🗑️'}
                      {activity.action === 'LOGIN' && '🔐'}
                      {activity.action === 'LOGOUT' && '🚪'}
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">
                        <strong>{activity.userName}</strong> performed <span className={`badge ${getActionBadge(activity.action)}`}>{activity.action}</span> on {activity.module}
                      </div>
                      {activity.details && (
                        <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                          {activity.details}
                        </p>
                      )}
                      <div className="activity-time">
                        {new Date(activity.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
