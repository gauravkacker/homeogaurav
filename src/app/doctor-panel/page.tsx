"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Types
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  regNumber: string;
  age?: number;
  gender?: string;
}

interface Visit {
  id: string;
  patientId: string;
  visitDate: Date;
  visitNumber: number;
  chiefComplaint?: string;
  caseText?: string;
  diagnosis?: string;
  advice?: string;
  testsRequired?: string;
  nextVisit?: Date;
  prognosis?: string;
  remarksToFrontdesk?: string;
  status: string;
}

interface Prescription {
  id: string;
  medicine: string;
  potency?: string;
  quantity: string;
  doseForm?: string;
  dosePattern?: string;
  frequency?: string;
  duration?: string;
  durationDays?: number;
  bottles?: number;
  instructions?: string;
  isCombination?: boolean;
  combinationName?: string;
  combinationContent?: string;
  showDetails?: boolean;
}

interface Combination {
  id: string;
  name: string;
  content: string;
  createdAt: Date;
}

// Medicine pattern memory type
interface MedicinePattern {
  medicine: string;
  potency: string;
  quantity: string;
  dosePattern: string;
  frequency: string;
  duration: string;
}

// Smart parsing config type
interface SmartParsingConfig {
  quantities: { keyword: string; displayValue: string; enabled: boolean }[];
  doseForms: { keyword: string; displayValue: string; enabled: boolean }[];
  dosePatterns: { keyword: string; patternValue: string; description: string; enabled: boolean }[];
}

// Main Component
export default function DoctorPanelPage() {
  const searchParams = useSearchParams();
  const patientIdFromUrl = searchParams.get('patientId');

  // State
  const [patient, setPatient] = useState<Patient | null>(null);
  const [currentVisit, setCurrentVisit] = useState<Visit | null>(null);
  const [pastVisits, setPastVisits] = useState<Visit[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [caseText, setCaseText] = useState('');
  const [isSystemAssist, setIsSystemAssist] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [showMateriaMedica, setShowMateriaMedica] = useState(false);
  const [materiaMedicaQuery, setMateriaMedicaQuery] = useState('');
  const [showPharmacyQueue, setShowPharmacyQueue] = useState(false);
  
  // Additional fields
  const [diagnosis, setDiagnosis] = useState('');
  const [advice, setAdvice] = useState('');
  const [testsRequired, setTestsRequired] = useState('');
  const [nextVisit, setNextVisit] = useState('');
  const [nextVisitDays, setNextVisitDays] = useState('');
  const [prognosis, setPrognosis] = useState('');
  const [remarksToFrontdesk, setRemarksToFrontdesk] = useState('');
  
  // Fee editing
  const [feeAmount, setFeeAmount] = useState('');
  const [feeType, setFeeType] = useState('consultation');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [discountPercent, setDiscountPercent] = useState('');
  const [discountReason, setDiscountReason] = useState('');
  
  // Combination medicines
  const [savedCombinations, setSavedCombinations] = useState<Combination[]>([]);
  const [combinationDropdownIndex, setCombinationDropdownIndex] = useState<number | null>(null);
  const [combinationSearch, setCombinationSearch] = useState('');
  
  // Smart parsing config
  const [smartParsingConfig, setSmartParsingConfig] = useState<SmartParsingConfig | null>(null);
  
  // Medicine autocomplete and smart entry
  const [medicineSearch, setMedicineSearch] = useState('');
  const [showMedicineSuggestions, setShowMedicineSuggestions] = useState(false);
  const [medicineSuggestions, setMedicineSuggestions] = useState<string[]>([]);
  const [usedMedicines, setUsedMedicines] = useState<string[]>([]);
  const [medicinePatterns, setMedicinePatterns] = useState<MedicinePattern[]>([]);
  
  // Modal states
  const [showEndConsultationModal, setShowEndConsultationModal] = useState(false);
  const [showSameDayReopenModal, setShowSameDayReopenModal] = useState(false);
  
  // Refs
  const caseTextRef = useRef<HTMLTextAreaElement>(null);
  const medicineInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Load patient data
  const loadPatientData = useCallback(async (id: string) => {
    // Mock data for now
    const mockPatient: Patient = {
      id,
      firstName: 'John',
      lastName: 'Doe',
      mobile: '9876543210',
      regNumber: 'DK-001',
      age: 35,
      gender: 'Male',
    };
    setPatient(mockPatient);

    // Check for active visit
    const mockActiveVisit: Visit = {
      id: uuidv4(),
      patientId: id,
      visitDate: new Date(),
      visitNumber: 1,
      status: 'active',
    };
    setCurrentVisit(mockActiveVisit);
    
    // Mock past visits
    setPastVisits([
      {
        id: uuidv4(),
        patientId: id,
        visitDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        visitNumber: 1,
        chiefComplaint: 'Headache',
        caseText: 'Severe headache since morning',
        diagnosis: 'Tension headache',
        status: 'locked',
      },
    ]);

    // Mock last fee
    setFeeAmount('500');
    setFeeType('consultation');
  }, []);

  // Load medicine patterns, combinations, and smart parsing config from localStorage
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const saved = localStorage.getItem('medicinePatterns');
    if (saved) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setMedicinePatterns(JSON.parse(saved));
    }
    const medicines = localStorage.getItem('usedMedicines');
    if (medicines) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setUsedMedicines(JSON.parse(medicines));
    }
    const combinations = localStorage.getItem('savedCombinations');
    if (combinations) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setSavedCombinations(JSON.parse(combinations));
    }
    // Load smart parsing config
    const smartConfig = localStorage.getItem('smartParsingConfig');
    if (smartConfig) {
      try {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setSmartParsingConfig(JSON.parse(smartConfig));
      } catch (e) {
        console.error('Failed to load smart parsing config:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (patientIdFromUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadPatientData(patientIdFromUrl);
    }
  }, [patientIdFromUrl, loadPatientData]);

  // ===== CASE TAKING =====
  
  const handleCaseTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCaseText(text);
    
    // Check for vague symptoms if system assist is on
    if (isSystemAssist) {
      analyzeCaseText(text);
    }
  };

  const addCaseLine = (line: string) => {
    setCaseText(prev => prev + (prev ? '\n' : '') + line);
    setTimeout(() => {
      if (caseTextRef.current) {
        caseTextRef.current.focus();
      }
    }, 0);
  };

  const analyzeCaseText = (text: string) => {
    // Simple vague symptom detection
    const vagueTerms = ['pain', '不舒服', 'problem', 'issue'];
    // This would integrate with AI/system assist in real implementation
  };

  // ===== MEDICINE AUTOCOMPLETE =====

  const handleMedicineSearch = (index: number, value: string) => {
    updatePrescriptionRow(index, 'medicine', value);
    setMedicineSearch(value);

    if (value.length >= 1) {
      // Combine used medicines and saved combinations
      const allMedicines = [...usedMedicines, ...savedCombinations.map(c => c.name)];
      const filtered = allMedicines.filter(m => 
        m.toLowerCase().includes(value.toLowerCase())
      );
      setMedicineSuggestions(filtered.slice(0, 10));
      setShowMedicineSuggestions(true);
    } else {
      setShowMedicineSuggestions(false);
    }
  };

  const selectMedicineSuggestion = (index: number, medicine: string) => {
    updatePrescriptionRow(index, 'medicine', medicine);
    setMedicineSearch('');
    setShowMedicineSuggestions(false);

    // Add to used medicines
    if (!usedMedicines.includes(medicine)) {
      const updated = [medicine, ...usedMedicines].slice(0, 50);
      setUsedMedicines(updated);
      localStorage.setItem('usedMedicines', JSON.stringify(updated));
    }

    // Check for saved pattern
    const savedPattern = medicinePatterns.find(
      p => p.medicine.toLowerCase() === medicine.toLowerCase()
    );
    if (savedPattern) {
      updatePrescriptionRow(index, 'potency', savedPattern.potency);
      updatePrescriptionRow(index, 'quantity', savedPattern.quantity);
      updatePrescriptionRow(index, 'dosePattern', savedPattern.dosePattern);
      updatePrescriptionRow(index, 'frequency', savedPattern.frequency);
      updatePrescriptionRow(index, 'duration', savedPattern.duration);
    }
  };

  // ===== SMART PARSING =====

  const parseSmartEntry = (text: string): Partial<Prescription> => {
    // Smart parsing for one-line entry using configurable rules
    // Example: "Arnica 200 2dr 4 pills TDS or 3 times a day or 4-4-4 for 7 days"
    
    let rx: Partial<Prescription> = {
      quantity: '1dr',
      doseForm: 'pills',
      dosePattern: '1-1-1',
      frequency: 'Daily',
      duration: '7 days',
      durationDays: 7,
      bottles: 1,
    };

    const lowerText = text.toLowerCase();
    const parts = text.split(' ').filter(p => p.trim());

    // Parse medicine and potency (first 1-2 parts)
    if (parts.length > 0 && parts[0]) {
      // Check if it looks like a medicine name (not a number or pattern)
      if (!/^\d+$/.test(parts[0]) && !parts[0].includes('-')) {
        rx.medicine = parts[0];
        
        // Check if second part is potency (number or 200/1M etc)
        if (parts.length > 1 && /^\d+$/.test(parts[1])) {
          rx.potency = parts[1];
        }
      }
    }

    // Get enabled mappings from config
    const quantities = smartParsingConfig?.quantities?.filter(q => q.enabled) || [];
    const doseForms = smartParsingConfig?.doseForms?.filter(d => d.enabled) || [];
    const dosePatterns = smartParsingConfig?.dosePatterns?.filter(p => p.enabled) || [];

    // Parse quantity using configurable rules
    for (const q of quantities) {
      const keyword = q.keyword.toLowerCase();
      // Match keyword in text (with word boundaries)
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(lowerText)) {
        rx.quantity = q.displayValue;
        break;
      }
    }

    // Parse dose form using configurable rules
    for (const d of doseForms) {
      const keyword = d.keyword.toLowerCase();
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(lowerText)) {
        rx.doseForm = d.displayValue;
        break;
      }
    }

    // Parse dose pattern using configurable rules
    for (const p of dosePatterns) {
      const keyword = p.keyword.toLowerCase();
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(lowerText)) {
        rx.dosePattern = p.patternValue;
        // Set frequency based on pattern description
        if (p.description?.toLowerCase().includes('once')) {
          rx.frequency = 'Daily';
        } else if (p.description?.toLowerCase().includes('twice')) {
          rx.frequency = 'Daily';
        } else if (p.description?.toLowerCase().includes('three')) {
          rx.frequency = 'Daily';
        } else if (p.description?.toLowerCase().includes('four')) {
          rx.frequency = 'Daily';
        } else if (p.description?.toLowerCase().includes('bedtime') || p.description?.toLowerCase().includes('night')) {
          rx.frequency = 'Daily';
        } else if (p.description?.toLowerCase().includes('needed')) {
          rx.frequency = 'SOS';
        }
        break;
      }
    }

    // Parse duration (standard parsing)
    const durationMatch = text.match(/(\d+)\s*(day|week|month|hour)s?/i);
    if (durationMatch) {
      const num = parseInt(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();
      if (unit.startsWith('d')) {
        rx.duration = `${num} day${num > 1 ? 's' : ''}`;
        rx.durationDays = num;
      } else if (unit.startsWith('w')) {
        rx.duration = `${num} week${num > 1 ? 's' : ''}`;
        rx.durationDays = num * 7;
      } else if (unit.startsWith('m')) {
        rx.duration = `${num} month${num > 1 ? 's' : ''}`;
        rx.durationDays = num * 30;
      } else if (unit.startsWith('h')) {
        rx.duration = `${num} hour${num > 1 ? 's' : ''}`;
        rx.durationDays = 0;
      }
    }

    return rx;
  };

  // ===== PRESCRIPTION TABLE =====

  const addEmptyPrescriptionRow = () => {
    setPrescriptions(prev => [...prev, {
      id: uuidv4(),
      medicine: '',
      potency: '',
      quantity: '1dr',
      doseForm: 'pills',
      dosePattern: '1-1-1',
      frequency: 'Daily',
      duration: '7 days',
      bottles: 1,
    }]);
  };

  const updatePrescriptionRow = (index: number, field: string, value: string | number) => {
    setPrescriptions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removePrescriptionRow = (index: number) => {
    setPrescriptions(prev => prev.filter((_, i) => i !== index));
  };

  const movePrescriptionRow = (index: number, direction: 'up' | 'down') => {
    setPrescriptions(prev => {
      const updated = [...prev];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex >= 0 && newIndex < updated.length) {
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      }
      return updated;
    });
  };

  // Save pattern when prescription is finalized
  const saveMedicinePattern = (rx: Prescription) => {
    if (!rx.medicine) return;
    
    const pattern: MedicinePattern = {
      medicine: rx.medicine,
      potency: rx.potency || '',
      quantity: rx.quantity,
      dosePattern: rx.dosePattern || '1-1-1',
      frequency: rx.frequency || 'Daily',
      duration: rx.duration || '7 days',
    };

    const existingIndex = medicinePatterns.findIndex(
      p => p.medicine.toLowerCase() === rx.medicine.toLowerCase()
    );

    let updatedPatterns;
    if (existingIndex >= 0) {
      updatedPatterns = [...medicinePatterns];
      updatedPatterns[existingIndex] = pattern;
    } else {
      updatedPatterns = [...medicinePatterns, pattern];
    }

    setMedicinePatterns(updatedPatterns);
    localStorage.setItem('medicinePatterns', JSON.stringify(updatedPatterns));
  };

  // Handle keyboard navigation
  const handlePrescriptionKeyDown = (
    e: React.KeyboardEvent,
    index: number,
    field: string
  ) => {
    const columns = ['medicine', 'potency', 'quantity', 'doseForm', 'dosePattern', 'frequency', 'duration', 'bottles'];
    const currentIndex = columns.indexOf(field);
    const isLastColumn = currentIndex === columns.length - 1;

    if (e.key === 'Enter' && !isLastColumn) {
      e.preventDefault();
      // Move to next column in same row
      const nextField = columns[currentIndex + 1];
      const nextInput = medicineInputRefs.current[index + 1000] || medicineInputRefs.current[index];
      if (nextInput) {
        (nextInput as HTMLInputElement).focus();
        (nextInput as HTMLInputElement).select();
      }
    } else if (e.key === 'Enter' && isLastColumn) {
      // Create new row
      e.preventDefault();
      addEmptyPrescriptionRow();
      setTimeout(() => {
        medicineInputRefs.current[index + 1]?.focus();
      }, 0);
    } else if (e.key === 'Tab') {
      // Default tab behavior - move to next column
    }
  };

  // Handle smart entry on medicine field (Enter key triggers smart parsing)
  const handleMedicineKeyDown = (e: React.KeyboardEvent, index: number) => {
    // Close combination dropdown on any key
    if (combinationDropdownIndex !== null) {
      setCombinationDropdownIndex(null);
    }

    if (e.key === 'Enter' || e.key === 'Tab') {
      const value = (e.target as HTMLInputElement).value;
      if (value && value.includes(' ')) {
        e.preventDefault();
        const parsed = parseSmartEntry(value);
        
        if (parsed.medicine) updatePrescriptionRow(index, 'medicine', parsed.medicine);
        if (parsed.potency) updatePrescriptionRow(index, 'potency', parsed.potency);
        if (parsed.quantity) updatePrescriptionRow(index, 'quantity', parsed.quantity);
        if (parsed.doseForm) updatePrescriptionRow(index, 'doseForm', parsed.doseForm);
        if (parsed.dosePattern) updatePrescriptionRow(index, 'dosePattern', parsed.dosePattern);
        if (parsed.frequency) updatePrescriptionRow(index, 'frequency', parsed.frequency);
        if (parsed.duration) updatePrescriptionRow(index, 'duration', parsed.duration);
        if (parsed.durationDays) updatePrescriptionRow(index, 'durationDays', parsed.durationDays);
        if (parsed.bottles) updatePrescriptionRow(index, 'bottles', parsed.bottles);

        // Save pattern
        const rx = prescriptions[index];
        saveMedicinePattern({ ...rx, ...parsed } as Prescription);
      }
    }
  };

  // ===== COMBINATION MEDICINES =====

  const toggleCombinationDropdown = (index: number) => {
    if (combinationDropdownIndex === index) {
      setCombinationDropdownIndex(null);
    } else {
      setCombinationDropdownIndex(index);
      setCombinationSearch('');
    }
  };

  const insertSavedCombination = (combination: Combination, index: number) => {
    setPrescriptions(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        isCombination: true,
        combinationName: combination.name,
        combinationContent: combination.content,
        medicine: combination.name,
      };
      return updated;
    });
    setCombinationDropdownIndex(null);
  };

  const saveNewCombination = (index: number, name: string, content: string) => {
    // Update current prescription
    setPrescriptions(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        isCombination: true,
        combinationName: name,
        combinationContent: content,
        medicine: name,
      };
      return updated;
    });

    // Save to combinations list if not exists
    if (!savedCombinations.find(c => c.name.toLowerCase() === name.toLowerCase())) {
      const newCombination: Combination = {
        id: uuidv4(),
        name,
        content,
        createdAt: new Date(),
      };
      const updatedCombinations = [newCombination, ...savedCombinations];
      setSavedCombinations(updatedCombinations);
      localStorage.setItem('savedCombinations', JSON.stringify(updatedCombinations));
    }

    setCombinationDropdownIndex(null);
  };

  const removeCombination = (index: number) => {
    setPrescriptions(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        isCombination: false,
        combinationName: undefined,
        combinationContent: undefined,
      };
      return updated;
    });
  };

  // ===== END CONSULTATION =====

  const handleEndConsultation = async () => {
    if (!currentVisit) return;

    // Save all medicine patterns
    prescriptions.forEach(rx => {
      if (rx.medicine) {
        saveMedicinePattern(rx);
      }
    });

    // Save visit data
    const visitData = {
      patientId: patient!.id,
      visitDate: new Date(),
      visitNumber: currentVisit.visitNumber,
      chiefComplaint: caseText.split('\n')[0] || '',
      caseText,
      diagnosis,
      advice,
      testsRequired,
      nextVisit: nextVisit ? new Date(nextVisit) : undefined,
      prognosis,
      remarksToFrontdesk,
    };

    // TODO: API calls to save data
    setShowEndConsultationModal(true);
  };

  // ===== MATERIA MEDICA SEARCH =====

  const searchMateriaMedica = async (query: string) => {
    setMateriaMedicaQuery(query);
    // TODO: Implement materia medica search
  };

  // ===== PAST HISTORY =====

  const repeatPastVisit = (visit: Visit) => {
    if (visit.caseText) setCaseText(visit.caseText);
    if (visit.diagnosis) setDiagnosis(visit.diagnosis);
    if (visit.advice) setAdvice(visit.advice);
    setShowHistory(false);
  };

  // ===== RENDER =====

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Doctor Panel</h1>
          <p className="text-gray-600">Please select a patient from the appointment list.</p>
        </div>
      </div>
    );
  }

  // Column configuration
  const prescriptionColumns = [
    { key: 'medicine', label: 'Medicine', width: 'w-48' },
    { key: 'potency', label: 'Potency', width: 'w-16' },
    { key: 'quantity', label: 'Qty', width: 'w-20' },
    { key: 'doseForm', label: 'Dose Form', width: 'w-24' },
    { key: 'dosePattern', label: 'Pattern', width: 'w-20' },
    { key: 'frequency', label: 'Frequency', width: 'w-28' },
    { key: 'duration', label: 'Duration', width: 'w-24' },
    { key: 'bottles', label: 'Bottles', width: 'w-16' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Patient Context */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-gray-800">Doctor Panel</h1>
            
            {/* Patient Info Card */}
            <div className="flex items-center gap-4 bg-blue-50 px-4 py-2 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-800">
                  {patient.firstName} {patient.lastName}
                </p>
                <p className="text-xs text-blue-600">
                  Reg: {patient.regNumber} | {patient.age}yrs | {patient.gender}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Mobile</p>
                <p className="text-sm font-medium">{patient.mobile}</p>
              </div>
            </div>

            {/* Visit Stats */}
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-500">Visits: {pastVisits.length + 1}</span>
              {pastVisits[0] && (
                <span className="text-gray-500">
                  Last: {new Date(pastVisits[0].visitDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/settings/smart-parsing"
              className="px-4 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100"
            >
              ⚙️ Smart Parsing
            </Link>
            <button
              onClick={() => setShowPharmacyQueue(!showPharmacyQueue)}
              className="px-4 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100"
            >
              Pharmacy Queue ({3})
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              {showHistory ? 'Hide' : 'Show'} History
            </button>
            <button
              onClick={() => setShowMateriaMedica(!showMateriaMedica)}
              className="px-4 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
            >
              Materia Medica
            </button>
          </div>
        </div>
      </header>

      <main className="flex gap-6 p-6">
        {/* Left Column - Case Taking */}
        <div className="flex-1 space-y-6">
          {/* Case Taking Section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Case Taking</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSystemAssist(!isSystemAssist)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    isSystemAssist 
                      ? 'bg-amber-100 text-amber-700 border border-amber-300' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  System Assist {isSystemAssist ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <textarea
                ref={caseTextRef}
                value={caseText}
                onChange={handleCaseTextChange}
                placeholder="Type case symptoms here...&#10;Press Enter for new symptom&#10;&#10;Example:&#10;Pain in knee joints&#10;Worse in cold weather&#10;Better by motion"
                className="w-full h-64 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              
              {isSystemAssist && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700 font-medium mb-2">💡 Suggestions</p>
                  <ul className="text-sm text-amber-600 space-y-1">
                    <li>• Consider asking about timing (morning/evening)</li>
                    <li>• Explore aggravating/ameliorating factors</li>
                    <li>• Ask about appetite, thirst, sleep</li>
                  </ul>
                </div>
              )}
            </div>
          </section>

          {/* Prescription Table */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Prescription</h2>
              <button
                onClick={addEmptyPrescriptionRow}
                className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
              >
                + Add Medicine
              </button>
            </div>
            
            <div className="p-6">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                    {prescriptionColumns.map((col) => (
                      <th key={col.key} className={`pb-3 font-medium ${col.width}`}>
                        {col.label}
                      </th>
                    ))}
                    <th className="pb-3 font-medium w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((rx, index) => (
                    <tr key={rx.id} className="border-b border-gray-50">
                      {/* Medicine Column with + button */}
                      <td className="py-2 relative">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleCombinationDropdown(index)}
                            className="text-blue-500 hover:bg-blue-50 p-1 rounded"
                            title="Insert Combination"
                          >
                            +
                          </button>
                          
                          {/* Combination indicator */}
                          {rx.isCombination && (
                            <div className="flex-1">
                              <button
                                className="text-blue-600 font-medium hover:underline"
                                title={rx.combinationContent}
                              >
                                {rx.combinationName}
                              </button>
                              {rx.combinationContent && (
                                <button
                                  onClick={() => {
                                    const updated = [...prescriptions];
                                    updated[index] = { ...updated[index], showDetails: !updated[index].showDetails };
                                    setPrescriptions(updated);
                                  }}
                                  className="text-xs text-gray-400 hover:text-gray-600 ml-2"
                                >
                                  {rx.showDetails ? '▼' : '▶'}
                                </button>
                              )}
                              <button
                                onClick={() => removeCombination(index)}
                                className="text-xs text-red-400 hover:text-red-600 ml-2"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                          
                          {/* Non-combination medicine input */}
                          {!rx.isCombination && (
                            <div className="flex-1 relative">
                              <input
                                ref={el => { medicineInputRefs.current[index] = el; }}
                                type="text"
                                value={rx.medicine}
                                onChange={(e) => handleMedicineSearch(index, e.target.value)}
                                onKeyDown={(e) => handleMedicineKeyDown(e, index)}
                                onFocus={() => rx.medicine && setShowMedicineSuggestions(true)}
                                placeholder="Type medicine..."
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                              {/* Medicine Suggestions Dropdown */}
                              {showMedicineSuggestions && medicineSuggestions.length > 0 && (
                                <div 
                                  ref={suggestionRef}
                                  className="absolute z-50 left-0 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                                >
                                  {medicineSuggestions.map((suggestion, i) => (
                                    <button
                                      key={i}
                                      onClick={() => selectMedicineSuggestion(index, suggestion)}
                                      className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm"
                                    >
                                      {suggestion}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Show combination details */}
                          {rx.isCombination && rx.showDetails && rx.combinationContent && (
                            <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                              {rx.combinationContent}
                            </div>
                          )}
                        </div>
                        
                        {/* Combination Dropdown */}
                        {combinationDropdownIndex === index && (
                          <div className="absolute z-50 left-0 top-full mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-xl">
                            <div className="p-3 border-b border-gray-100">
                              <input
                                type="text"
                                value={combinationSearch}
                                onChange={(e) => setCombinationSearch(e.target.value)}
                                placeholder="Search or create combination..."
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                autoFocus
                              />
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                              {/* Saved combinations */}
                              {savedCombinations
                                .filter(c => c.name.toLowerCase().includes(combinationSearch.toLowerCase()))
                                .map((combo) => (
                                  <button
                                    key={combo.id}
                                    onClick={() => insertSavedCombination(combo, index)}
                                    className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-50"
                                  >
                                    <div className="font-medium text-gray-800">{combo.name}</div>
                                    <div className="text-xs text-gray-500 truncate">{combo.content}</div>
                                  </button>
                                ))}
                              {/* Create new combination */}
                              {combinationSearch && !savedCombinations.find(c => c.name.toLowerCase() === combinationSearch.toLowerCase()) && (
                                <button
                                  onClick={() => {
                                    const name = combinationSearch;
                                    const content = prompt('Enter combination content:');
                                    if (content) {
                                      saveNewCombination(index, name, content);
                                    }
                                  }}
                                  className="w-full px-4 py-3 text-left hover:bg-green-50 text-green-600 border-t border-gray-100"
                                >
                                  + Create &quot;{combinationSearch}&quot;
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                      
                      {/* Potency */}
                      <td className="py-2">
                        <input
                          ref={el => { medicineInputRefs.current[index + 1000] = el; }}
                          type="text"
                          value={rx.potency || ''}
                          onChange={(e) => updatePrescriptionRow(index, 'potency', e.target.value)}
                          onKeyDown={(e) => handlePrescriptionKeyDown(e, index, 'potency')}
                          placeholder="200"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      
                      {/* Quantity */}
                      <td className="py-2">
                        <select
                          value={rx.quantity}
                          onChange={(e) => updatePrescriptionRow(index, 'quantity', e.target.value)}
                          onKeyDown={(e) => handlePrescriptionKeyDown(e, index, 'quantity')}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="1dr">1dr</option>
                          <option value="2dr">2dr</option>
                          <option value="3dr">3dr</option>
                          <option value="4dr">4dr</option>
                          <option value="5dr">5dr</option>
                          <option value="1oz">1oz</option>
                          <option value="2oz">2oz</option>
                          <option value="1 bottle">1 bottle</option>
                          <option value="2 bottles">2 bottles</option>
                        </select>
                      </td>
                      
                      {/* Dose Form */}
                      <td className="py-2">
                        <select
                          value={rx.doseForm || 'pills'}
                          onChange={(e) => updatePrescriptionRow(index, 'doseForm', e.target.value)}
                          onKeyDown={(e) => handlePrescriptionKeyDown(e, index, 'doseForm')}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pills">Pills</option>
                          <option value="drops">Drops</option>
                          <option value="capsules">Capsules</option>
                          <option value="globules">Globules</option>
                          <option value="tablet">Tablet</option>
                          <option value="syrup">Syrup</option>
                          <option value="ointment">Ointment</option>
                          <option value="powder">Powder</option>
                        </select>
                      </td>
                      
                      {/* Dose Pattern */}
                      <td className="py-2">
                        <input
                          type="text"
                          value={rx.dosePattern || ''}
                          onChange={(e) => updatePrescriptionRow(index, 'dosePattern', e.target.value)}
                          onKeyDown={(e) => handlePrescriptionKeyDown(e, index, 'dosePattern')}
                          placeholder="1-1-1"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      
                      {/* Frequency */}
                      <td className="py-2">
                        <select
                          value={rx.frequency}
                          onChange={(e) => updatePrescriptionRow(index, 'frequency', e.target.value)}
                          onKeyDown={(e) => handlePrescriptionKeyDown(e, index, 'frequency')}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Daily">Daily</option>
                          <option value="Alternate day">Alternate</option>
                          <option value="Weekly">Weekly</option>
                          <option value="Monthly">Monthly</option>
                          <option value="SOS">SOS</option>
                          <option value="STAT">STAT</option>
                          <option value="Morning only">Morning</option>
                          <option value="Afternoon only">Afternoon</option>
                          <option value="Night only">Night</option>
                        </select>
                      </td>
                      
                      {/* Duration */}
                      <td className="py-2">
                        <input
                          type="text"
                          value={rx.duration || ''}
                          onChange={(e) => updatePrescriptionRow(index, 'duration', e.target.value)}
                          onKeyDown={(e) => handlePrescriptionKeyDown(e, index, 'duration')}
                          placeholder="7 days"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      
                      {/* Bottles */}
                      <td className="py-2">
                        <input
                          type="number"
                          value={rx.bottles || 1}
                          onChange={(e) => updatePrescriptionRow(index, 'bottles', parseInt(e.target.value) || 1)}
                          onKeyDown={(e) => handlePrescriptionKeyDown(e, index, 'bottles')}
                          min={1}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      
                      {/* Actions */}
                      <td className="py-2">
                        <button
                          onClick={() => removePrescriptionRow(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {prescriptions.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p>No prescriptions added yet.</p>
                  <p className="text-sm">Type medicine name or click &quot;Add Medicine&quot;</p>
                  <p className="text-sm mt-2">Tip: Type full prescription like &quot;Arnica 200 2dr pills TDS for 7 days&quot;</p>
                </div>
              )}
            </div>
          </section>

          {/* Additional Clinical Fields */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Additional Notes</h2>
            </div>
            
            <div className="p-6 grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Enter diagnosis"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Advice</label>
                <textarea
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  placeholder="Enter advice for patient"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tests Required</label>
                <input
                  type="text"
                  value={testsRequired}
                  onChange={(e) => setTestsRequired(e.target.value)}
                  placeholder="Enter tests if any"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Visit</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={nextVisitDays}
                    onChange={(e) => setNextVisitDays(e.target.value)}
                    placeholder="Days"
                    className="w-24 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={nextVisit}
                    onChange={(e) => setNextVisit(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select unit</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prognosis</label>
                <select
                  value={prognosis}
                  onChange={(e) => setPrognosis(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select prognosis</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="guarded">Guarded</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks to Frontdesk</label>
                <input
                  type="text"
                  value={remarksToFrontdesk}
                  onChange={(e) => setRemarksToFrontdesk(e.target.value)}
                  placeholder="Internal note"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Past History & Materia Medica */}
        <div className="w-80 space-y-6">
          {/* Past History Panel */}
          {showHistory && (
            <section className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Past History</h3>
              </div>
              
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {pastVisits.map((visit, index) => (
                  <div key={visit.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-800">
                        Visit #{visit.visitNumber}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(visit.visitDate).toLocaleDateString()}
                      </span>
                    </div>
                    {visit.chiefComplaint && (
                      <p className="text-xs text-gray-600 mb-1">
                        <span className="font-medium">CC:</span> {visit.chiefComplaint}
                      </p>
                    )}
                    {visit.diagnosis && (
                      <p className="text-xs text-gray-600 mb-2">
                        <span className="font-medium">Dx:</span> {visit.diagnosis}
                      </p>
                    )}
                    <button
                      onClick={() => repeatPastVisit(visit)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Repeat this visit
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Materia Medica Search */}
          {showMateriaMedica && (
            <section className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Materia Medica</h3>
              </div>
              
              <div className="p-4">
                <input
                  type="text"
                  value={materiaMedicaQuery}
                  onChange={(e) => searchMateriaMedica(e.target.value)}
                  placeholder="Search symptoms or medicines..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 mb-4"
                />
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  <p className="text-sm text-gray-400 text-center py-4">
                    Type to search materia medica...
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Fee Panel */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Fee Details</h3>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fee Amount</label>
                <input
                  type="number"
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fee Type</label>
                <select
                  value={feeType}
                  onChange={(e) => setFeeType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="consultation">Consultation</option>
                  <option value="followup">Follow-up</option>
                  <option value="special">Special</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="discounted">Discounted</option>
                  <option value="waived">Waived</option>
                </select>
              </div>
              
              {paymentStatus === 'discounted' && (
                <>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Discount %</label>
                    <input
                      type="number"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      placeholder="10"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Reason</label>
                    <input
                      type="text"
                      value={discountReason}
                      onChange={(e) => setDiscountReason(e.target.value)}
                      placeholder="Discount reason"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* End Consultation Button - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-end gap-4">
          <button
            onClick={() => setShowSameDayReopenModal(true)}
            className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleEndConsultation}
            className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
          >
            End Consultation
          </button>
        </div>
      </div>

      {/* Pharmacy Queue Panel */}
      {showPharmacyQueue && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl border-l border-gray-200 z-40">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Pharmacy Queue</h3>
            <button
              onClick={() => setShowPharmacyQueue(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="p-4 space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800">John Doe</span>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Pending</span>
              </div>
              <p className="text-xs text-gray-600">Arnica 200, Rhus tox 200</p>
              <div className="flex gap-2 mt-2">
                <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Priority</button>
                <button className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Stop</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
