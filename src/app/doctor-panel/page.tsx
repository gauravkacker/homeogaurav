'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
}

interface Medicine {
  id: string;
  name: string;
  potency?: string;
  unit: string;
}

interface Combination {
  id: string;
  name: string;
  medicines: string;
  defaultPotency?: string;
}

interface SmartParsingSettings {
  quantities: string[];
  doseForms: string[];
  dosePatterns: string[];
}

interface PrescriptionItem {
  medicineId?: string;
  medicineName?: string;
  potency?: string;
  dosage: string;
  duration: string;
  instructions?: string;
}

export default function DoctorPanelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [smartParsingSettings, setSmartParsingSettings] = useState<SmartParsingSettings>({
    quantities: ['1', '2', '3', '4', '5', '10', '15', '20', '30', '50', '100'],
    doseForms: ['tablet', 'capsule', 'drop', 'puff', 'ml', 'tsp', 'tbsp', 'piece', 'cap'],
    dosePatterns: ['1-0-1', '1-1-1', '2-2-2', '0-0-1', '1-0-0', '0-1-0', '2-0-2', '3-0-3']
  });
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [history, setHistory] = useState('');
  const [examination, setExamination] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [advice, setAdvice] = useState('');
  const [nextVisitDate, setNextVisitDate] = useState('');
  const [prescriptionText, setPrescriptionText] = useState('');
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([]);
  
  const [patientSearch, setPatientSearch] = useState('');
  const [medicineSearch, setMedicineSearch] = useState('');
  const [combinationSearch, setCombinationSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false);
  const [showCombinationDropdown, setShowCombinationDropdown] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<PrescriptionItem[]>([]);
  const [activeTab, setActiveTab] = useState<'manual' | 'smart'>('smart');

  const patientInputRef = useRef<HTMLInputElement>(null);
  const medicineInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(JSON.parse(user));
    loadData();
    
    const appointmentId = searchParams.get('appointmentId');
    const patientId = searchParams.get('patientId');
    if (patientId) {
      loadPatient(patientId);
    }
  }, [router, searchParams]);

  const loadData = async () => {
    try {
      const [patientsRes, medicinesRes, combinationsRes, settingsRes] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/medicines'),
        fetch('/api/combinations'),
        fetch('/api/smart-parsing')
      ]);
      
      const patientsData = await patientsRes.json();
      const medicinesData = await medicinesRes.json();
      const combinationsData = await combinationsRes.json();
      const settingsData = await settingsRes.json();
      
      setPatients(Array.isArray(patientsData) ? patientsData : []);
      setMedicines(Array.isArray(medicinesData) ? medicinesData : []);
      setCombinations(Array.isArray(combinationsData) ? combinationsData : []);
      if (settingsData.quantities) {
        setSmartParsingSettings(settingsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadPatient = async (id: string) => {
    try {
      const res = await fetch(`/api/patients?id=${id}`);
      const data = await res.json();
      setSelectedPatient(data);
      setShowPatientDropdown(false);
    } catch (error) {
      console.error('Error loading patient:', error);
    }
  };

  const filteredPatients = patients.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.phone.includes(patientSearch)
  );

  const filteredMedicines = medicines.filter(m =>
    m.name.toLowerCase().includes(medicineSearch.toLowerCase())
  );

  const filteredCombinations = combinations.filter(c =>
    c.name.toLowerCase().includes(combinationSearch.toLowerCase())
  );

  const handleSmartParse = () => {
    const lines = prescriptionText.split('\n').filter(line => line.trim());
    const items: PrescriptionItem[] = [];
    
    const q = smartParsingSettings.quantities;
    const forms = smartParsingSettings.doseForms;
    const patterns = smartParsingSettings.dosePatterns;
    
    lines.forEach(line => {
      const lower = line.toLowerCase();
      let item: PrescriptionItem = {
        medicineName: line,
        dosage: '',
        duration: ''
      };
      
      for (const quantity of q) {
        if (lower.includes(quantity)) {
          for (const pattern of patterns) {
            if (lower.includes(pattern)) {
              item.dosage = pattern;
              break;
            }
          }
          break;
        }
      }
      
      const combination = combinations.find(c => 
        lower.includes(c.name.toLowerCase())
      );
      if (combination) {
        item.medicineName = combination.name;
        if (combination.defaultPotency) {
          item.potency = combination.defaultPotency;
        }
      }
      
      for (const medicine of medicines) {
        if (lower.includes(medicine.name.toLowerCase())) {
          item.medicineId = medicine.id;
          item.medicineName = medicine.name;
          if (medicine.potency) {
            item.potency = medicine.potency;
          }
          break;
        }
      }
      
      if (lower.includes('day')) {
        const match = lower.match(/(\d+)\s*days?/i);
        if (match) item.duration = `${match[1]} days`;
      } else if (lower.includes('month')) {
        const match = lower.match(/(\d+)\s*months?/i);
        if (match) item.duration = `${match[1]} months`;
      }
      
      if (item.medicineName && item.medicineName.trim()) {
        items.push(item);
      }
    });
    
    setParsedPreview(items);
  };

  const addParsedItems = () => {
    setPrescriptionItems(prev => [...prev, ...parsedPreview]);
    setPrescriptionText('');
    setParsedPreview([]);
  };

  const addPrescriptionItem = () => {
    setPrescriptionItems(prev => [...prev, {
      medicineName: '',
      potency: '',
      dosage: '1-0-1',
      duration: '15 days'
    }]);
  };

  const updatePrescriptionItem = (index: number, updates: Partial<PrescriptionItem>) => {
    setPrescriptionItems(prev => prev.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    ));
  };

  const removePrescriptionItem = (index: number) => {
    setPrescriptionItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (status: string) => {
    if (!selectedPatient) {
      alert('Please select a patient');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          doctorId: currentUser?.id || '1',
          visitDate: new Date().toISOString().split('T')[0],
          chiefComplaint,
          history,
          examination,
          diagnosis,
          prescription: JSON.stringify(prescriptionItems),
          advice,
          nextVisitDate
        })
      });

      if (res.ok) {
        alert('Prescription saved successfully!');
        router.push(`/patients/${selectedPatient.id}`);
      } else {
        alert('Failed to save prescription');
      }
    } catch (error) {
      alert('An error occurred');
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
            <div className="nav-section-title">Main</div>
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
            <Link href="/patients" className="nav-link">Patients</Link>
            <Link href="/appointments" className="nav-link">Appointments</Link>
            <Link href="/queue" className="nav-link">Queue</Link>
          </div>
          <div className="nav-section">
            <div className="nav-section-title">Doctor</div>
            <Link href="/doctor-panel" className="nav-link active">Doctor Panel</Link>
            <Link href="/messages" className="nav-link">Messages</Link>
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <h1 className="page-title">Doctor Panel</h1>
            <p className="page-subtitle">Write prescriptions with smart parsing</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/settings/smart-parsing" className="btn btn-secondary">
              ⚙️ Parsing Settings
            </Link>
            <button className="btn btn-secondary" onClick={() => router.push('/dashboard')}>
              Dashboard
            </button>
          </div>
        </header>

        <div className="page-content">
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Select Patient</h3>
            <div style={{ position: 'relative' }}>
              <input
                ref={patientInputRef}
                type="text"
                className="input"
                placeholder="Search by name or phone..."
                value={patientSearch}
                onChange={(e) => {
                  setPatientSearch(e.target.value);
                  setShowPatientDropdown(true);
                }}
                onFocus={() => setShowPatientDropdown(true)}
              />
              {showPatientDropdown && patientSearch && (
                <div className="autocomplete-dropdown">
                  {filteredPatients.slice(0, 5).map((patient) => (
                    <div
                      key={patient.id}
                      className="autocomplete-item"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setPatientSearch(`${patient.firstName} ${patient.lastName}`);
                        setShowPatientDropdown(false);
                      }}
                    >
                      {patient.firstName} {patient.lastName} ({patient.phone})
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {selectedPatient && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f9ff', borderRadius: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{selectedPatient.firstName} {selectedPatient.lastName}</strong>
                    <span style={{ marginLeft: '1rem', color: '#64748b' }}>{selectedPatient.phone}</span>
                    {selectedPatient.dateOfBirth && (
                      <span style={{ marginLeft: '1rem', color: '#64748b' }}>DOB: {selectedPatient.dateOfBirth}</span>
                    )}
                  </div>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      setSelectedPatient(null);
                      setPatientSearch('');
                    }}
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
          </div>

          {selectedPatient && (
            <>
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Clinical Notes</h3>
                
                <div className="form-group">
                  <label className="label">Chief Complaint</label>
                  <textarea
                    className="input"
                    rows={2}
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    placeholder="Patient's main complaint..."
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="label">History</label>
                    <textarea
                      className="input"
                      rows={2}
                      value={history}
                      onChange={(e) => setHistory(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Examination</label>
                    <textarea
                      className="input"
                      rows={2}
                      value={examination}
                      onChange={(e) => setExamination(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="label">Diagnosis</label>
                  <input
                    type="text"
                    className="input"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="Enter diagnosis..."
                  />
                </div>
              </div>

              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Prescription</h3>
                  <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
                    <button
                      className={`tab ${activeTab === 'smart' ? 'active' : ''}`}
                      onClick={() => setActiveTab('smart')}
                    >
                      Smart Parse
                    </button>
                    <button
                      className={`tab ${activeTab === 'manual' ? 'active' : ''}`}
                      onClick={() => setActiveTab('manual')}
                    >
                      Manual Entry
                    </button>
                  </div>
                </div>

                {activeTab === 'smart' ? (
                  <div>
                    <textarea
                      className="prescription-textarea"
                      value={prescriptionText}
                      onChange={(e) => setPrescriptionText(e.target.value)}
                      placeholder={`Enter medicines naturally, e.g.:
Arnica 30C 1-0-1 for 15 days
Belladonna 30C 2-2-2 for 7 days
Rhus Tox 30C 1-0-0 for 10 days`}
                    />
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                      <button className="btn btn-primary" onClick={handleSmartParse}>
                        Parse Prescription
                      </button>
                      <button className="btn btn-secondary" onClick={addPrescriptionItem}>
                        + Add Manually
                      </button>
                    </div>
                    
                    {parsedPreview.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Parsed Items Preview:</h4>
                        {parsedPreview.map((item, idx) => (
                          <div key={idx} style={{ padding: '0.5rem', background: '#f0f9ff', borderRadius: '0.25rem', marginBottom: '0.5rem' }}>
                            <strong>{item.medicineName}</strong> {item.potency && `(${item.potency})`} - {item.dosage} - {item.duration}
                          </div>
                        ))}
                        <button className="btn btn-success btn-sm" onClick={addParsedItems} style={{ marginTop: '0.5rem' }}>
                          Add All to Prescription
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {prescriptionItems.map((item, index) => (
                      <div key={index} className="prescription-item" style={{ marginBottom: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.375rem' }}>
                        <div className="medicine-input-container">
                          <input
                            type="text"
                            className="input medicine-input"
                            placeholder="Medicine name..."
                            value={item.medicineName}
                            onChange={(e) => {
                              setMedicineSearch(e.target.value);
                              updatePrescriptionItem(index, { medicineName: e.target.value });
                            }}
                            onFocus={() => setShowMedicineDropdown(true)}
                          />
                          {showMedicineDropdown && medicineSearch && (
                            <div className="medicine-dropdown">
                              {filteredMedicines.slice(0, 5).map((med) => (
                                <div
                                  key={med.id}
                                  className="autocomplete-item"
                                  onClick={() => {
                                    updatePrescriptionItem(index, { medicineId: med.id, medicineName: med.name, potency: med.potency });
                                    setMedicineSearch('');
                                    setShowMedicineDropdown(false);
                                  }}
                                >
                                  {med.name} {med.potency && `(${med.potency})`}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          className="input"
                          placeholder="Potency"
                          value={item.potency}
                          onChange={(e) => updatePrescriptionItem(index, { potency: e.target.value })}
                        />
                        <select
                          className="input"
                          value={item.dosage}
                          onChange={(e) => updatePrescriptionItem(index, { dosage: e.target.value })}
                        >
                          {smartParsingSettings.dosePatterns.map(pattern => (
                            <option key={pattern} value={pattern}>{pattern}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          className="input"
                          placeholder="Duration"
                          value={item.duration}
                          onChange={(e) => updatePrescriptionItem(index, { duration: e.target.value })}
                        />
                        <button className="btn btn-danger btn-sm" onClick={() => removePrescriptionItem(index)}>
                          ×
                        </button>
                      </div>
                    ))}
                    <button className="btn btn-secondary" onClick={addPrescriptionItem} style={{ marginTop: '0.75rem' }}>
                      + Add Medicine
                    </button>
                  </div>
                )}
              </div>

              {/* Advice & Next Visit */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Additional Information</h3>
                
                <div className="form-group">
                  <label className="label">Advice</label>
                  <textarea
                    className="input"
                    rows={2}
                    value={advice}
                    onChange={(e) => setAdvice(e.target.value)}
                    placeholder="General advice for the patient..."
                  />
                </div>
                
                <div className="form-group">
                  <label className="label">Next Visit Date</label>
                  <input
                    type="date"
                    className="input"
                    style={{ maxWidth: '300px' }}
                    value={nextVisitDate}
                    onChange={(e) => setNextVisitDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="card">
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => handleSubmit('completed')}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save & Complete'}
                  </button>
                  <button
                    className="btn btn-secondary btn-lg"
                    onClick={() => handleSubmit('in-progress')}
                    disabled={isLoading}
                  >
                    Save as Draft
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
