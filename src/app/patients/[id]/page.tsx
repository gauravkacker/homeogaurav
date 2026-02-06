'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  occupation?: string;
  referredBy?: string;
  notes?: string;
  registrationNumber: string;
  registrationDate: string;
}

interface Visit {
  id: string;
  visitDate: string;
  chiefComplaint?: string;
  diagnosis?: string;
}

export default function PatientViewPage() {
  const router = useRouter();
  const params = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(JSON.parse(user));
    loadPatient(params.id as string);
  }, [router, params.id]);

  const loadPatient = async (id: string) => {
    setIsLoading(true);
    try {
      const [patientRes, visitsRes] = await Promise.all([
        fetch(`/api/patients?id=${id}`),
        fetch(`/api/visits?patientId=${id}`)
      ]);
      
      const patientData = await patientRes.json();
      const visitsData = await visitsRes.json();
      
      setPatient(patientData);
      setVisits(Array.isArray(visitsData) ? visitsData : []);
    } catch (error) {
      console.error('Error loading patient:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading" style={{ minHeight: '100vh' }}><div className="spinner"></div></div>;
  }

  if (!patient) {
    return (
      <div className="app-layout">
        <main className="main-content">
          <div className="page-content">
            <div className="empty-state">
              <h3 className="empty-state-title">Patient Not Found</h3>
              <Link href="/patients" className="btn btn-primary">Back to Patients</Link>
            </div>
          </div>
        </main>
      </div>
    );
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
            <Link href="/patients" className="nav-link active">Patients</Link>
            <Link href="/appointments" className="nav-link">Appointments</Link>
            <Link href="/queue" className="nav-link">Queue</Link>
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/patients" className="btn btn-secondary btn-sm">← Back</Link>
            <div>
              <h1 className="page-title">{patient.firstName} {patient.lastName}</h1>
              <p className="page-subtitle">Registration No: {patient.registrationNumber}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href={`/patients/${patient.id}/edit`} className="btn btn-secondary">Edit</Link>
            <Link href={`/doctor-panel?patientId=${patient.id}`} className="btn btn-primary">Start Consultation</Link>
          </div>
        </header>

        <div className="page-content">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
            {/* Patient Info */}
            <div className="card">
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Patient Information</h3>
              
              <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Phone:</span>
                  <span style={{ marginLeft: '0.5rem' }}>{patient.phone}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Email:</span>
                  <span style={{ marginLeft: '0.5rem' }}>{patient.email || '-'}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Gender:</span>
                  <span style={{ marginLeft: '0.5rem' }}>{patient.gender || '-'}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Date of Birth:</span>
                  <span style={{ marginLeft: '0.5rem' }}>{patient.dateOfBirth || '-'}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Blood Group:</span>
                  <span style={{ marginLeft: '0.5rem' }}>{patient.bloodGroup || '-'}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Occupation:</span>
                  <span style={{ marginLeft: '0.5rem' }}>{patient.occupation || '-'}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Referred By:</span>
                  <span style={{ marginLeft: '0.5rem' }}>{patient.referredBy || '-'}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Address:</span>
                  <span style={{ marginLeft: '0.5rem' }}>{patient.address || '-'}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>City:</span>
                  <span style={{ marginLeft: '0.5rem' }}>{patient.city || '-'}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Registration Date:</span>
                  <span style={{ marginLeft: '0.5rem' }}>{patient.registrationDate}</span>
                </div>
              </div>

              {patient.notes && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Notes:</span>
                  <p style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>{patient.notes}</p>
                </div>
              )}
            </div>

            {/* Visit History */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Visit History</h3>
                <Link href={`/patients/${patient.id}/visits/new`} className="btn btn-primary btn-sm">
                  + New Visit
                </Link>
              </div>

              {visits.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem' }}>
                  <p>No visits recorded yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {visits.map((visit) => (
                    <div key={visit.id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.375rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: '500' }}>{visit.visitDate}</span>
                        <Link href={`/visits/${visit.id}`} style={{ color: '#2563eb', fontSize: '0.875rem' }}>
                          View Details
                        </Link>
                      </div>
                      {visit.chiefComplaint && (
                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          Complaint: {visit.chiefComplaint}
                        </p>
                      )}
                      {visit.diagnosis && (
                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          Diagnosis: {visit.diagnosis}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
