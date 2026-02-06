'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface Visit {
  id: string;
  visitDate: string;
  chiefComplaint?: string;
  history?: string;
  examination?: string;
  diagnosis?: string;
  prescription: string;
  advice?: string;
  nextVisitDate?: string;
  weight?: number;
  temperature?: number;
  pulse?: number;
  bloodPressure?: string;
}

export default function NewVisitPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    visitDate: new Date().toISOString().split('T')[0],
    chiefComplaint: '',
    history: '',
    examination: '',
    diagnosis: '',
    prescription: '',
    advice: '',
    nextVisitDate: '',
    weight: '',
    temperature: '',
    pulse: '',
    bloodPressure: ''
  });

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      router.push('/login');
      return;
    }

    fetchPatientAndVisits();
  }, [router, patientId]);

  const fetchPatientAndVisits = async () => {
    try {
      const [patientRes, visitsRes] = await Promise.all([
        fetch(`/api/patients/${patientId}`),
        fetch(`/api/visits?patientId=${patientId}`)
      ]);

      if (patientRes.ok) {
        setPatient(await patientRes.json());
      }
      if (visitsRes.ok) {
        setVisits(await visitsRes.json());
      }
    } catch (error) {
      setError('Error fetching data');
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const currentUser = localStorage.getItem('currentUser');
      const user = currentUser ? JSON.parse(currentUser) : null;

      const response = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          patientId,
          doctorId: user?.id,
          weight: formData.weight ? parseFloat(formData.weight) : undefined,
          temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
          pulse: formData.pulse ? parseInt(formData.pulse) : undefined
        })
      });

      if (response.ok) {
        setSuccess('Visit added successfully');
        setTimeout(() => router.push(`/patients/${patientId}`), 1500);
      } else {
        const data = await response.json();
        setError(data.error || 'Error adding visit');
      }
    } catch (error) {
      setError('Error adding visit');
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Header title="New Visit" />
          <div className="loading" style={{ minHeight: '100vh' }}><div className="spinner"></div></div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="New Visit" />
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">New Visit: {patient?.firstName} {patient?.lastName}</h1>
            <p className="page-subtitle">Phone: {patient?.phone}</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} className="form-container">
            <div className="form-section">
              <h3 className="form-section-title">Visit Details</h3>
              <div className="form-grid">
                <Input
                  label="Visit Date"
                  type="date"
                  value={formData.visitDate}
                  onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Vitals</h3>
              <div className="form-grid">
                <Input
                  label="Weight (kg)"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
                <Input
                  label="Temperature (°F)"
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                />
                <Input
                  label="Pulse (bpm)"
                  type="number"
                  value={formData.pulse}
                  onChange={(e) => setFormData({ ...formData, pulse: e.target.value })}
                />
                <Input
                  label="Blood Pressure"
                  placeholder="120/80"
                  value={formData.bloodPressure}
                  onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                />
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Clinical Notes</h3>
              <div className="form-grid">
                <div className="form-grid-full">
                  <Textarea
                    label="Chief Complaint"
                    value={formData.chiefComplaint}
                    onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="form-grid-full">
                  <Textarea
                    label="History"
                    value={formData.history}
                    onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="form-grid-full">
                  <Textarea
                    label="Examination"
                    value={formData.examination}
                    onChange={(e) => setFormData({ ...formData, examination: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="form-grid-full">
                  <Textarea
                    label="Diagnosis"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Prescription</h3>
              <div className="form-grid">
                <div className="form-grid-full">
                  <Textarea
                    label="Prescription"
                    value={formData.prescription}
                    onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                    rows={6}
                    placeholder="Enter prescription details..."
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Advice & Follow-up</h3>
              <div className="form-grid">
                <div className="form-grid-full">
                  <Textarea
                    label="Advice"
                    value={formData.advice}
                    onChange={(e) => setFormData({ ...formData, advice: e.target.value })}
                    rows={2}
                  />
                </div>
                <Input
                  label="Next Visit Date"
                  type="date"
                  value={formData.nextVisitDate}
                  onChange={(e) => setFormData({ ...formData, nextVisitDate: e.target.value })}
                />
              </div>
            </div>

            {visits.length > 0 && (
              <div className="form-section">
                <h3 className="form-section-title">Previous Visits</h3>
                <div className="visits-list">
                  {visits.slice(-5).reverse().map((visit) => (
                    <div key={visit.id} className="visit-item">
                      <div className="visit-date">{visit.visitDate}</div>
                      <div className="visit-complaint">{visit.chiefComplaint}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="form-actions">
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSaving}>
                Save Visit
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

// Sidebar component for this page
function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <a href="/dashboard" className="sidebar-logo">🏥 Homeo PMS</a>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">
          <a href="/dashboard" className="nav-link">Dashboard</a>
          <a href="/patients" className="nav-link active">Patients</a>
          <a href="/appointments" className="nav-link">Appointments</a>
          <a href="/queue" className="nav-link">Queue</a>
          <a href="/doctor-panel" className="nav-link">Doctor Panel</a>
          <a href="/messages" className="nav-link">Messages</a>
        </div>
      </nav>
    </aside>
  );
}
