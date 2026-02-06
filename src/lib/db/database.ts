// Database helper functions for Homeo PMS
// Uses localStorage for demo purposes

const STORAGE_PREFIX = 'homeopms_';

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get data from localStorage
export function getData<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_PREFIX + key);
  return data ? JSON.parse(data) : [];
}

// Save data to localStorage
export function saveData<T extends { id: string }>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
}

// Get single item
export function getItem<T>(key: string, id: string): T | undefined {
  const data = getData<T>(key);
  return data.find(item => (item as any).id === id);
}

// Add item
export function addItem<T extends { id: string; createdAt: string }>(key: string, item: Omit<T, 'id' | 'createdAt'>): T {
  const data = getData<T>(key);
  const newItem = {
    ...item,
    id: generateId(),
    createdAt: new Date().toISOString()
  } as T;
  data.push(newItem);
  saveData(key, data);
  return newItem;
}

// Update item
export function updateItem<T extends { id: string; updatedAt: string }>(key: string, id: string, updates: Partial<T>): T | undefined {
  const data = getData<T>(key);
  const index = data.findIndex(item => (item as any).id === id);
  if (index === -1) return undefined;
  
  data[index] = {
    ...data[index],
    ...updates,
    updatedAt: new Date().toISOString()
  } as T;
  saveData(key, data);
  return data[index];
}

// Delete item
export function deleteItem(key: string, id: string): boolean {
  const data = getData<any>(key);
  const index = data.findIndex(item => item.id === id);
  if (index === -1) return false;
  
  data.splice(index, 1);
  saveData(key, data);
  return true;
}

// Initialize demo data
export function initializeDemoData() {
  if (typeof window === 'undefined') return;
  
  // Check if already initialized
  if (localStorage.getItem(STORAGE_PREFIX + 'initialized')) return;
  
  // Demo Users
  const users = [
    { id: '1', username: 'doctor', password: 'doctor123', name: 'Dr. Smith', role: 'doctor' as const, email: 'doctor@homeopms.com', phone: '9876543210', isActive: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '2', username: 'admin', password: 'admin123', name: 'Admin User', role: 'admin' as const, email: 'admin@homeopms.com', phone: '9876543211', isActive: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '3', username: 'reception', password: 'reception123', name: 'Receptionist', role: 'receptionist' as const, email: 'reception@homeopms.com', phone: '9876543212', isActive: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ];
  localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(users));
  
  // Demo Patients
  const patients = [
    { id: 'p1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '9876543210', address: '123 Main St', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', dateOfBirth: '1985-03-15', gender: 'male' as const, bloodGroup: 'A+', occupation: 'Engineer', referredBy: 'Dr. Sharma', notes: '', photoUrl: '', tags: '["t1"]', isActive: 1, registrationNumber: 'REG001', registrationDate: '2024-01-15', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'p2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phone: '9876543211', address: '456 Oak Ave', city: 'Delhi', state: 'Delhi', pincode: '110001', dateOfBirth: '1990-07-22', gender: 'female' as const, bloodGroup: 'B+', occupation: 'Teacher', referredBy: '', notes: '', photoUrl: '', tags: '[]', isActive: 1, registrationNumber: 'REG002', registrationDate: '2024-02-20', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'p3', firstName: 'Rajesh', lastName: 'Kumar', email: 'rajesh@example.com', phone: '9876543212', address: '789 Pine Rd', city: 'Bangalore', state: 'Karnataka', pincode: '560001', dateOfBirth: '1978-11-08', gender: 'male' as const, bloodGroup: 'O+', occupation: 'Business', referredBy: 'Mrs. Kumar', notes: '', photoUrl: '', tags: '["t2"]', isActive: 1, registrationNumber: 'REG003', registrationDate: '2024-03-10', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ];
  localStorage.setItem(STORAGE_PREFIX + 'patients', JSON.stringify(patients));
  
  // Demo Patient Tags
  const tags = [
    { id: 't1', name: 'VIP', color: '#FFD700', createdAt: new Date().toISOString() },
    { id: 't2', name: 'Regular', color: '#4CAF50', createdAt: new Date().toISOString() },
    { id: 't3', name: 'Follow-up', color: '#2196F3', createdAt: new Date().toISOString() }
  ];
  localStorage.setItem(STORAGE_PREFIX + 'patientTags', JSON.stringify(tags));
  
  // Demo Medicines
  const medicines = [
    { id: 'm1', name: 'Arnica Montana', category: 'Homeopathy', potency: '30C', unit: 'drops', stock: 100, minStock: 20, price: 150, manufacturer: 'SBL', isActive: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'm2', name: 'Belladonna', category: 'Homeopathy', potency: '30C', unit: 'drops', stock: 80, minStock: 20, price: 150, manufacturer: 'SBL', isActive: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'm3', name: 'Rhus Tox', category: 'Homeopathy', potency: '30C', unit: 'drops', stock: 120, minStock: 20, price: 150, manufacturer: 'SBL', isActive: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'm4', name: 'Nux Vomica', category: 'Homeopathy', potency: '200C', unit: 'drops', stock: 60, minStock: 15, price: 180, manufacturer: 'Bakson', isActive: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'm5', name: 'Sulphur', category: 'Homeopathy', potency: '30C', unit: 'drops', stock: 90, minStock: 20, price: 150, manufacturer: 'SBL', isActive: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ];
  localStorage.setItem(STORAGE_PREFIX + 'medicines', JSON.stringify(medicines));
  
  // Demo Combination Medicines
  const combinations = [
    { id: 'c1', name: 'Biochemic 6x', medicines: JSON.stringify([{ medicineId: 'm1', potency: '6x' }, { medicineId: 'm2', potency: '6x' }]), defaultPotency: '6x', notes: 'Tissue salts combination', isActive: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'c2', name: 'Cold & Flu Kit', medicines: JSON.stringify([{ medicineId: 'm1', potency: '30C' }, { medicineId: 'm2', potency: '30C' }]), defaultPotency: '30C', notes: 'For cold and flu symptoms', isActive: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ];
  localStorage.setItem(STORAGE_PREFIX + 'combinations', JSON.stringify(combinations));
  
  // Demo Fees
  const fees = [
    { id: 'f1', name: 'New Patient Consultation', amount: 500, type: 'consultation' as const, isActive: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'f2', name: 'Follow-up Consultation', amount: 300, type: 'consultation' as const, isActive: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'f3', name: 'Emergency Consultation', amount: 800, type: 'consultation' as const, isActive: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ];
  localStorage.setItem(STORAGE_PREFIX + 'fees', JSON.stringify(fees));
  
  // Demo Appointments
  const appointments = [
    { id: 'a1', patientId: 'p1', doctorId: '1', appointmentDate: new Date().toISOString().split('T')[0], appointmentTime: '10:00', type: 'followup' as const, status: 'scheduled' as const, notes: '', fees: 300, feesPaid: 300, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'a2', patientId: 'p2', doctorId: '1', appointmentDate: new Date().toISOString().split('T')[0], appointmentTime: '11:00', type: 'new' as const, status: 'confirmed' as const, notes: '', fees: 500, feesPaid: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ];
  localStorage.setItem(STORAGE_PREFIX + 'appointments', JSON.stringify(appointments));
  
  // Demo Visits
  const visits = [
    { id: 'v1', patientId: 'p1', doctorId: '1', appointmentId: 'a1', visitDate: '2024-03-01', chiefComplaint: 'Joint pain', history: '', examination: '', diagnosis: 'Arthritis', prescription: JSON.stringify([{ medicineId: 'm1', potency: '30C', dosage: '1-0-1', duration: '15 days' }]), advice: 'Take after food', nextVisitDate: '2024-03-15', weight: 70, temperature: 98.6, pulse: 72, bloodPressure: '120/80', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ];
  localStorage.setItem(STORAGE_PREFIX + 'visits', JSON.stringify(visits));
  
  // Mark as initialized
  localStorage.setItem(STORAGE_PREFIX + 'initialized', 'true');
}
