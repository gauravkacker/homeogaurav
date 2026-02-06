'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  type: string;
  status: string;
  notes?: string;
  fees?: number;
  feesPaid: number;
  createdAt: string;
  patient?: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  doctor?: {
    name: string;
  };
}

export default function AppointmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      router.push('/login');
      return;
    }
    fetchAppointment();
  }, [router, appointmentId]);

  const fetchAppointment = async () => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`);
      if (response.ok) {
        setAppointment(await response.json());
      } else {
        setError('Appointment not found');
      }
    } catch (error) {
      setError('Error fetching appointment');
    }
    setIsLoading(false);
  };

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        const updated = await response.json();
        setAppointment(updated);
      }
    } catch (error) {
      setError('Error updating appointment');
    }
    setUpdating(false);
  };

  if (isLoading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Header title="Appointment Details" />
          <div className="loading" style={{ minHeight: '100vh' }}><div className="spinner"></div></div>
        </main>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Header title="Appointment Details" />
          <div className="page-container">
            <div className="alert alert-error">{error}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Appointment Details" />
        <div className="page-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">Appointment Details</h1>
              <p className="page-subtitle">
                {appointment.patient?.firstName} {appointment.patient?.lastName}
              </p>
            </div>
            <StatusBadge status={appointment.status} />
          </div>

          <div className="detail-grid">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Appointment Information</h3>
              </div>
              <div className="card-content">
                <div className="detail-row">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">{appointment.appointmentDate}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Time</span>
                  <span className="detail-value">{appointment.appointmentTime}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Type</span>
                  <span className="detail-value capitalize">{appointment.type}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status</span>
                  <StatusBadge status={appointment.status} />
                </div>
                <div className="detail-row">
                  <span className="detail-label">Fees</span>
                  <span className="detail-value">
                    ₹{appointment.fees || 0} {appointment.feesPaid ? '(Paid)' : '(Pending)'}
                  </span>
                </div>
                {appointment.notes && (
                  <div className="detail-row">
                    <span className="detail-label">Notes</span>
                    <span className="detail-value">{appointment.notes}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Patient Information</h3>
              </div>
              <div className="card-content">
                <div className="detail-row">
                  <span className="detail-label">Name</span>
                  <span className="detail-value">
                    {appointment.patient?.firstName} {appointment.patient?.lastName}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{appointment.patient?.phone}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Doctor Information</h3>
              </div>
              <div className="card-content">
                <div className="detail-row">
                  <span className="detail-label">Name</span>
                  <span className="detail-value">{appointment.doctor?.name}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <Button variant="secondary" onClick={() => router.push('/appointments')}>
              Back to Appointments
            </Button>
            {appointment.status === 'scheduled' && (
              <>
                <Button
                  variant="success"
                  onClick={() => updateStatus('confirmed')}
                  isLoading={updating}
                >
                  Confirm
                </Button>
                <Button
                  variant="danger"
                  onClick={() => updateStatus('cancelled')}
                  isLoading={updating}
                >
                  Cancel
                </Button>
              </>
            )}
            {appointment.status === 'confirmed' && (
              <Button
                variant="primary"
                onClick={() => updateStatus('completed')}
                isLoading={updating}
              >
                Mark Completed
              </Button>
            )}
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
          <a href="/appointments" className="nav-link active">Appointments</a>
          <a href="/queue" className="nav-link">Queue</a>
          <a href="/doctor-panel" className="nav-link">Doctor Panel</a>
          <a href="/messages" className="nav-link">Messages</a>
        </div>
      </nav>
    </aside>
  );
}
