'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';

interface QueueItem {
  id: string;
  doctorId: string;
  date: string;
  patientId: string;
  appointmentId?: string;
  position: number;
  status: string;
  estimatedTime?: string;
  notes?: string;
  patient?: {
    firstName: string;
    lastName: string;
    phone: string;
    registrationNumber: string;
  };
}

interface PatientVisit {
  id: string;
  patientId: string;
  visitDate: string;
  chiefComplaint?: string;
  prescription: string;
}

export default function DoctorQueuePage() {
  const router = useRouter();
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [recentVisits, setRecentVisits] = useState<PatientVisit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(user);
    setCurrentUser(userData);

    if (userData.role !== 'doctor' && userData.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchData(userData.id);
  }, [router]);

  const fetchData = async (doctorId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [queueRes, visitsRes] = await Promise.all([
        fetch(`/api/queue?doctorId=${doctorId}&date=${today}`),
        fetch(`/api/visits?doctorId=${doctorId}&limit=5`)
      ]);

      if (queueRes.ok) {
        const queue = await queueRes.json();
        // Sort by position
        queue.sort((a: QueueItem, b: QueueItem) => a.position - b.position);
        setQueueItems(queue);
      }

      if (visitsRes.ok) {
        setRecentVisits(await visitsRes.json());
      }
    } catch (err) {
      setError('Error fetching queue data');
    }
    setIsLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/queue/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok && currentUser) {
        fetchData(currentUser.id);
      }
    } catch (err) {
      setError('Error updating queue item');
    }
  };

  const callNext = async () => {
    const nextItem = queueItems.find(item => item.status === 'waiting');
    if (nextItem) {
      await updateStatus(nextItem.id, 'in-progress');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (isLoading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Header title="Doctor Queue" />
          <div className="loading" style={{ minHeight: '100vh' }}><div className="spinner"></div></div>
        </main>
      </div>
    );
  }

  const waitingCount = queueItems.filter(item => item.status === 'waiting').length;
  const inProgressCount = queueItems.filter(item => item.status === 'in-progress').length;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Doctor Queue" />
        <div className="page-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">{getGreeting()}, Dr. {currentUser?.name?.split(' ')[1] || currentUser?.name}</h1>
              <p className="page-subtitle">Your queue for today</p>
            </div>
            <Button variant="primary" onClick={callNext} disabled={waitingCount === 0}>
              Call Next Patient
            </Button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="queue-stats">
            <div className="stat-card">
              <div className="stat-value">{waitingCount}</div>
              <div className="stat-label">Waiting</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{inProgressCount}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{queueItems.length}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>

          <div className="content-grid">
            <div className="card queue-card">
              <div className="card-header">
                <h3 className="card-title">Patient Queue</h3>
              </div>
              <div className="card-content">
                {queueItems.length === 0 ? (
                  <div className="empty-state">
                    <p>No patients in queue today.</p>
                    <p className="hint">Patients will appear here when added to the queue.</p>
                  </div>
                ) : (
                  <div className="queue-list">
                    {queueItems.map((item, index) => (
                      <div
                        key={item.id}
                        className={`queue-item ${item.status === 'in-progress' ? 'active' : ''}`}
                      >
                        <div className="queue-position">{index + 1}</div>
                        <div className="queue-info">
                          <div className="queue-patient">
                            {item.patient?.firstName} {item.patient?.lastName}
                            <span className="queue-reg">
                              ({item.patient?.registrationNumber})
                            </span>
                          </div>
                          <div className="queue-meta">
                            <span>{item.patient?.phone}</span>
                            {item.estimatedTime && (
                              <span>Est. Time: {item.estimatedTime}</span>
                            )}
                          </div>
                          {item.notes && (
                            <div className="queue-notes">{item.notes}</div>
                          )}
                        </div>
                        <div className="queue-status">
                          <StatusBadge status={item.status} />
                        </div>
                        <div className="queue-actions">
                          {item.status === 'waiting' && (
                            <Button
                              size="sm"
                              onClick={() => updateStatus(item.id, 'in-progress')}
                            >
                              Start
                            </Button>
                          )}
                          {item.status === 'in-progress' && (
                            <>
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => updateStatus(item.id, 'completed')}
                              >
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="warning"
                                onClick={() => updateStatus(item.id, 'skipped')}
                              >
                                Skip
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Recent Visits</h3>
              </div>
              <div className="card-content">
                {recentVisits.length === 0 ? (
                  <p className="text-gray-500">No recent visits.</p>
                ) : (
                  <div className="recent-visits">
                    {recentVisits.slice(0, 5).map(visit => (
                      <div key={visit.id} className="visit-item">
                        <div className="visit-date">{visit.visitDate}</div>
                        <div className="visit-complaint">{visit.chiefComplaint || 'No complaint recorded'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
        <a href="/dashboard" className="sidebar-logo">🏥 Homeo PMS</a>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">
          <a href="/dashboard" className="nav-link">Dashboard</a>
          <a href="/patients" className="nav-link">Patients</a>
          <a href="/appointments" className="nav-link">Appointments</a>
          <a href="/queue" className="nav-link active">Queue</a>
          <a href="/doctor-panel" className="nav-link">Doctor Panel</a>
          <a href="/messages" className="nav-link">Messages</a>
        </div>
      </nav>
    </aside>
  );
}
