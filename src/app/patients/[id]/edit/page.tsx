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
  photoUrl?: string;
  tags: string;
}

export default function EditPatientPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    occupation: '',
    referredBy: '',
    notes: ''
  });

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      router.push('/login');
      return;
    }

    fetchPatient();
  }, [router, patientId]);

  const fetchPatient = async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}`);
      if (response.ok) {
        const data = await response.json();
        setPatient(data);
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || '',
          bloodGroup: data.bloodGroup || '',
          occupation: data.occupation || '',
          referredBy: data.referredBy || '',
          notes: data.notes || ''
        });
      } else {
        setError('Patient not found');
      }
    } catch (error) {
      setError('Error fetching patient');
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess('Patient updated successfully');
        setTimeout(() => router.push(`/patients/${patientId}`), 1500);
      } else {
        const data = await response.json();
        setError(data.error || 'Error updating patient');
      }
    } catch (error) {
      setError('Error updating patient');
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Header title="Edit Patient" />
          <div className="loading" style={{ minHeight: '100vh' }}><div className="spinner"></div></div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Edit Patient" />
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">Edit Patient: {patient?.firstName} {patient?.lastName}</h1>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} className="form-container">
            <div className="form-section">
              <h3 className="form-section-title">Basic Information</h3>
              <div className="form-grid">
                <Input
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
                <Select
                  label="Gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  options={[
                    { value: '', label: 'Select Gender' },
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' }
                  ]}
                />
                <Select
                  label="Blood Group"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  options={[
                    { value: '', label: 'Select Blood Group' },
                    { value: 'A+', label: 'A+' },
                    { value: 'A-', label: 'A-' },
                    { value: 'B+', label: 'B+' },
                    { value: 'B-', label: 'B-' },
                    { value: 'AB+', label: 'AB+' },
                    { value: 'AB-', label: 'AB-' },
                    { value: 'O+', label: 'O+' },
                    { value: 'O-', label: 'O-' }
                  ]}
                />
                <Input
                  label="Occupation"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                />
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Address Information</h3>
              <div className="form-grid">
                <div className="form-grid-full">
                  <Textarea
                    label="Address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                  />
                </div>
                <Input
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
                <Input
                  label="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
                <Input
                  label="Pincode"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                />
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Additional Information</h3>
              <div className="form-grid">
                <Input
                  label="Referred By"
                  value={formData.referredBy}
                  onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
                />
                <div className="form-grid-full">
                  <Textarea
                    label="Notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSaving}>
                Update Patient
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
