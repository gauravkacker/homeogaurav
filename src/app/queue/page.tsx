'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface QueueItem {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  position: number;
  status: string;
  notes?: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export default function QueuePage() {
  const router = useRouter();
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [patients, setPatients] = useState<Record<string, Patient>>({});
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(JSON.parse(user));
    loadQueue();
  }, [router]);

  const loadQueue = async () => {
    setIsLoading(true);
    try {
      const [queueRes, patientsRes] = await Promise.all([
        fetch('/api/queue'),
        fetch('/api/patients')
      ]);
      
      const queueData = await queueRes.json();
      const patientsData = await patientsRes.json();
      
      setQueueItems(Array.isArray(queueData) ? queueData : []);
      
      const patientsMap: Record<string, Patient> = {};
      Array.isArray(patientsData) && patientsData.forEach((p: Patient) => {
        patientsMap[p.id] = p;
      });
      setPatients(patientsMap);
    } catch (error) {
      console.error('Error loading queue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQueueStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/queue', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      loadQueue();
    } catch (error) {
      console.error('Error updating queue:', error);
    }
  };

  const removeFromQueue = async (id: string) => {
    if (!confirm('Remove from queue?')) return;
    try {
      await fetch(`/api/queue?id=${id}`, { method: 'DELETE' });
      loadQueue();
    } catch (error) {
      console.error('Error removing from queue:', error);
    }
  };

  const getPatient = (patientId: string) => patients[patientId] || { firstName: 'Unknown', lastName: '', phone: '' };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      waiting: 'badge-warning',
      'in-progress': 'badge-info',
      completed: 'badge-success',
      skipped: 'badge-neutral'
    };
    return badges[status] || 'badge-neutral';
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
            <div className="nav-section-title">Main</div>
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
            <Link href="/patients" className="nav-link">Patients</Link>
            <Link href="/appointments" className="nav-link">Appointments</Link>
            <Link href="/queue" className="nav-link active">Queue</Link>
          </div>
          <div className="nav-section">
            <div className="nav-section-title">Doctor</div>
            <Link href="/doctor-panel" className="nav-link">Doctor Panel</Link>
            <Link href="/messages" className="nav-link">Messages</Link>
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <h1 className="page-title">Patient Queue</h1>
            <p className="page-subtitle">Manage today's patient queue</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span className="badge badge-info">{currentUser?.role?.toUpperCase()}</span>
            <button className="btn btn-secondary" onClick={() => router.push('/dashboard')}>Dashboard</button>
          </div>
        </header>

        <div className="page-content">
          <div className="card">
            {queueItems.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h3 className="empty-state-title">Queue is Empty</h3>
                <p>No patients in the queue.</p>
                <Link href="/doctor-panel" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  Add to Queue
                </Link>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontWeight: '600' }}>Today's Queue ({queueItems.length} patients)</h3>
                </div>
                
                {queueItems
                  .sort((a, b) => a.position - b.position)
                  .map((item, index) => {
                    const patient = getPatient(item.patientId);
                    return (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '1rem',
                          background: item.status === 'in-progress' ? '#dbeafe' : '#f8fafc',
                          borderRadius: '0.5rem',
                          marginBottom: '0.75rem',
                          border: item.status === 'in-progress' ? '2px solid #2563eb' : '1px solid #e2e8f0'
                        }}
                      >
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: '#2563eb',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '600',
                          marginRight: '1rem'
                        }}>
                          {item.position}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '500' }}>
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                            {patient.phone}
                          </div>
                        </div>
                        
                        <span className={`badge ${getStatusBadge(item.status)}`} style={{ marginRight: '1rem' }}>
                          {item.status}
                        </span>
                        
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {item.status === 'waiting' && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => updateQueueStatus(item.id, 'in-progress')}
                            >
                              Start
                            </button>
                          )}
                          {item.status === 'in-progress' && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => updateQueueStatus(item.id, 'completed')}
                            >
                              Complete
                            </button>
                          )}
                          <Link href={`/doctor-panel?patientId=${item.patientId}`} className="btn btn-secondary btn-sm">
                            View
                          </Link>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => removeFromQueue(item.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
