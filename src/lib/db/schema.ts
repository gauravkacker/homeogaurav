// Database schema for Homeo PMS
// Using localStorage for demo purposes

export type User = {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'doctor' | 'receptionist' | 'nurse';
  email?: string;
  phone?: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
};

export type Patient = {
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
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  occupation?: string;
  referredBy?: string;
  notes?: string;
  photoUrl?: string;
  tags: string;
  isActive: number;
  registrationNumber: string;
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
};

export type PatientTag = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
};

export type Appointment = {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  type: 'new' | 'followup' | 'emergency';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  fees?: number;
  feesPaid: number;
  createdAt: string;
  updatedAt: string;
};

export type Visit = {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
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
  createdAt: string;
  updatedAt: string;
};

export type Medicine = {
  id: string;
  name: string;
  category: string;
  potency?: string;
  unit: string;
  stock: number;
  minStock: number;
  price: number;
  manufacturer?: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
};

export type CombinationMedicine = {
  id: string;
  name: string;
  medicines: string;
  defaultPotency?: string;
  notes?: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
};

export type Fee = {
  id: string;
  name: string;
  amount: number;
  type: 'consultation' | 'procedure' | 'package' | 'other';
  isActive: number;
  createdAt: string;
  updatedAt: string;
};

export type TimeSlot = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
};

export type QueueItem = {
  id: string;
  doctorId: string;
  date: string;
  patientId: string;
  appointmentId?: string;
  position: number;
  status: 'waiting' | 'in-progress' | 'completed' | 'skipped';
  estimatedTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  subject?: string;
  body: string;
  isRead: number;
  createdAt: string;
};

export type Settings = {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  updatedAt: string;
};

export type SmartParsingSettings = {
  quantities: string[];
  doseForms: string[];
  dosePatterns: string[];
};
