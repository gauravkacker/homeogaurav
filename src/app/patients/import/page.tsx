'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';

export default function ImportPatientsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importMode, setImportMode] = useState<'csv' | 'manual'>('csv');
  const [csvData, setCsvData] = useState('');
  const [parsedPatients, setParsedPatients] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      router.push('/login');
    }
  }, [router]);

  const parseCSV = () => {
    try {
      const lines = csvData.trim().split('\n');
      const patients: any[] = [];

      // Skip header row if present
      const startIndex = lines[0].toLowerCase().includes('firstname') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Handle both comma and tab delimited
        const delimiter = line.includes('\t') ? '\t' : ',';
        const values = line.split(delimiter);

        if (values.length >= 2) {
          patients.push({
            firstName: values[0]?.trim() || '',
            lastName: values[1]?.trim() || '',
            email: values[2]?.trim() || '',
            phone: values[3]?.trim() || '',
            address: values[4]?.trim() || '',
            city: values[5]?.trim() || '',
            dateOfBirth: values[6]?.trim() || '',
            gender: values[7]?.trim() || ''
          });
        }
      }

      setParsedPatients(patients);
      setSuccess(`Parsed ${patients.length} patients from CSV`);
      setError('');
    } catch (err) {
      setError('Error parsing CSV data');
      setParsedPatients([]);
    }
  };

  const handleImport = async () => {
    if (parsedPatients.length === 0) {
      setError('No patients to import. Please parse CSV data first.');
      return;
    }

    setImporting(true);
    setError('');
    setSuccess('');

    let imported = 0;
    let failed = 0;

    for (const patient of parsedPatients) {
      try {
        const currentUser = localStorage.getItem('currentUser');
        const user = currentUser ? JSON.parse(currentUser) : null;

        const response = await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...patient,
            tags: '[]',
            registrationNumber: `REG${Date.now()}`,
            registrationDate: new Date().toISOString().split('T')[0]
          })
        });

        if (response.ok) {
          imported++;
        } else {
          failed++;
        }
      } catch (err) {
        failed++;
      }
    }

    setImporting(false);
    if (imported > 0) {
      setSuccess(`Successfully imported ${imported} patients${failed > 0 ? `, ${failed} failed` : ''}`);
      setParsedPatients([]);
      setCsvData('');
    } else {
      setError(`Failed to import patients. ${failed} errors.`);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Import Patients" />
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">Import Patients</h1>
            <p className="page-subtitle">Bulk import patients from CSV or enter manually</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Import Mode</h3>
            </div>
            <div className="card-content">
              <div className="import-mode-tabs">
                <button
                  className={`tab ${importMode === 'csv' ? 'active' : ''}`}
                  onClick={() => setImportMode('csv')}
                >
                  CSV Import
                </button>
                <button
                  className={`tab ${importMode === 'manual' ? 'active' : ''}`}
                  onClick={() => setImportMode('manual')}
                >
                  Manual Entry
                </button>
              </div>

              {importMode === 'csv' && (
                <div className="csv-import">
                  <div className="csv-instructions">
                    <h4>CSV Format Instructions</h4>
                    <p>Your CSV should have the following columns (order doesn't matter):</p>
                    <code>FirstName, LastName, Email, Phone, Address, City, DateOfBirth, Gender</code>
                    <p className="hint">FirstName and Phone are required. Other fields are optional.</p>
                  </div>

                  <Textarea
                    label="Paste CSV Data"
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    placeholder={`John, Doe, john@email.com, 9876543210, 123 Main St, Mumbai, 1985-03-15, male\nJane, Smith, jane@email.com, 9876543211, 456 Oak Ave, Delhi, 1990-07-22, female`}
                    rows={10}
                  />

                  <div className="form-actions">
                    <Button variant="secondary" onClick={parseCSV}>
                      Parse CSV
                    </Button>
                  </div>

                  {parsedPatients.length > 0 && (
                    <div className="parsed-preview">
                      <h4>Preview ({parsedPatients.length} patients)</h4>
                      <div className="table-container">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>First Name</th>
                              <th>Last Name</th>
                              <th>Phone</th>
                              <th>Email</th>
                              <th>City</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parsedPatients.slice(0, 10).map((p, i) => (
                              <tr key={i}>
                                <td>{p.firstName}</td>
                                <td>{p.lastName}</td>
                                <td>{p.phone}</td>
                                <td>{p.email}</td>
                                <td>{p.city}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {parsedPatients.length > 10 && (
                          <p className="hint">Showing first 10 of {parsedPatients.length} patients</p>
                        )}
                      </div>
                      <div className="form-actions">
                        <Button onClick={handleImport} isLoading={importing}>
                          Import {parsedPatients.length} Patients
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {importMode === 'manual' && (
                <div className="manual-import">
                  <p className="text-gray-500">
                    For single patient entry, please use the{" "}
                    <a href="/patients/new" className="link">Add New Patient</a> form.
                  </p>
                </div>
              )}
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
