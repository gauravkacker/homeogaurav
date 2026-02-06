'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  type: string;
  status: string;
  fees?: number;
  feesPaid: number;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Record<string, Patient>>({});
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(JSON.parse(user));
    loadAppointments();
  }, [router]);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const [appointmentsRes, patientsRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/patients')
      ]);
      
      const appointmentsData = await appointmentsRes.json();
      const patientsData = await patientsRes.json();
      
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      
      const patientsMap: Record<string, Patient> = {};
      Array.isArray(patientsData) && patientsData.forEach((p: Patient) => {
        patientsMap[p.id] = p;
      });
      setPatients(patientsMap);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPatient = (patientId: string) => patients[patientId] || { firstName: 'Unknown', lastName: '', phone: '' };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      scheduled: 'badge-info',
      confirmed: 'badge-success',
      completed: 'badge-neutral',
      cancelled: 'badge-danger',
      'no-show': 'badge-warning'
    };
    return badges[status] || 'badge-neutral';
  };

  const getTypeBadge = (type: string) => {
    const badges: Record<string, string> = {
      new: 'badge-success',
      followup: 'badge-info',
      emergency: 'badge-danger'
    };
    return badges[type] || 'badge-neutral';
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/login');
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
            <Link href="/appointments" className="nav-link active">Appointments</Link>
            <Link href="/queue" className="nav-link">Queue</Link>
          </div>
          <div className="nav-section">
            <div className="nav-section-title">Doctor</div>
            <Link href="/doctor-panel" className="nav-link">Doctor Panel</Link>
            <Link href="/messages" className="nav-link">Messages</Link>
          </div>
          {currentUser?.role === 'admin' && (
            <div className="nav-section">
              <div className="nav-section-title">Admin</div>
              <Link href="/admin/users" className="nav-link">Users</Link>
              <Link href="/admin/activity-log" className="nav-link">Activity Log</Link>
            </div>
          )}
          <div className="nav-section">
            <div className="nav-section-title">Settings</div>
            <Link href="/settings" className="nav-link">Settings</Link>
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Appointments</h1>
            <p className="page-subtitle">Manage appointments</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              type="date"
              className="input"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{ width: 'auto' }}
            />
            <span className="badge badge-info">{currentUser?.role?.toUpperCase()}</span>
            <Link href="/appointments/new" className="btn btn-primary">
              + New Appointment
            </Link>
            <button className="btn btn-secondary" onClick={handleLogout}>Sign Out</button>
          </div>
        </header>

        <div className="page-content">
          <div className="card">
            {appointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📅</div>
                <h3 className="empty-state-title">No Appointments</h3>
                <p>No appointments scheduled for this date.</p>
                <Link href="/appointments/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  Schedule Appointment
                </Link>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Phone</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Fees</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments
                    .filter(a => a.appointmentDate === filterDate)
                    .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
                    .map((appointment) => {
                      const patient = getPatient(appointment.patientId);
                      return (
                        <tr key={appointment.id}>
                          <td style={{ fontWeight: '500' }}>{appointment.appointmentTime}</td>
                          <td>
                            <Link href={`/patients/${appointment.patientId}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                              {patient.firstName} {patient.lastName}
                            </Link>
                          </td>
                          <td>{patient.phone}</td>
                          <td>
                            <span className={`badge ${getTypeBadge(appointment.type)}`}>
                              {appointment.type}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadge(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </td>
                          <td>
                            ₹{appointment.fees || 0} / ₹{appointment.feesPaid || 0}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <Link href={`/appointments/${appointment.id}`} className="btn btn-sm btn-secondary">
                                View
                              </Link>
                              <Link href={`/doctor-panel?appointmentId=${appointment.id}`} className="btn btn-sm btn-primary">
                                Start
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
