'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface Fee {
  id: string;
  name: string;
  amount: number;
  type: string;
}

export default function NewAppointmentPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    patientId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '09:00',
    type: 'new',
    fees: '',
    feesPaid: '',
    notes: ''
  });

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(JSON.parse(user));
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const [patientsRes, feesRes] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/fees')
      ]);
      
      const patientsData = await patientsRes.json();
      const feesData = await feesRes.json();
      
      setPatients(Array.isArray(patientsData) ? patientsData : []);
      setFees(Array.isArray(feesData) ? feesData : []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'type') {
      const selectedFee = fees.find(f => f.type === 'consultation' && (value === 'new' ? !f.name.toLowerCase().includes('followup') : f.name.toLowerCase().includes('followup')));
      if (selectedFee) {
        setFormData(prev => ({ ...prev, fees: selectedFee.amount.toString() }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          doctorId: currentUser?.id || '1',
          status: 'scheduled'
        })
      });

      if (res.ok) {
        router.push('/appointments');
      } else {
        setError('Failed to create appointment');
      }
    } catch (err) {
      setError('An error occurred while creating appointment');
    } finally {
      setIsLoading(false);
    }
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
            <Link href="/appointments" className="nav-link active">← Back to Appointments</Link>
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <h1 className="page-title">New Appointment</h1>
            <p className="page-subtitle">Schedule a new appointment</p>
          </div>
        </header>

        <div className="page-content">
          <div className="card" style={{ maxWidth: '600px' }}>
            {error && (
              <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.375rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Patient *</label>
                <select name="patientId" className="input" value={formData.patientId} onChange={handleChange} required>
                  <option value="">Select Patient...</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} ({patient.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Date *</label>
                  <input
                    type="date"
                    name="appointmentDate"
                    className="input"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">Time *</label>
                  <input
                    type="time"
                    name="appointmentTime"
                    className="input"
                    value={formData.appointmentTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Appointment Type *</label>
                <select name="type" className="input" value={formData.type} onChange={handleChange} required>
                  <option value="new">New Patient</option>
                  <option value="followup">Follow-up</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Fees (₹)</label>
                  <input
                    type="number"
                    name="fees"
                    className="input"
                    value={formData.fees}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Paid (₹)</label>
                  <input
                    type="number"
                    name="feesPaid"
                    className="input"
                    value={formData.feesPaid}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Notes</label>
                <textarea
                  name="notes"
                  className="input"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Appointment'}
                </button>
                <Link href="/appointments" className="btn btn-secondary">Cancel</Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
