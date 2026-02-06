// API Routes for Patients
import { NextRequest, NextResponse } from 'next/server';
import { getData, addItem, updateItem, deleteItem, initializeDemoData } from '@/lib/db/database';

// Initialize demo data on first request
if (typeof window === 'undefined') {
  initializeDemoData();
}

// Type definition for patients
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
  occupation: string;
  referredBy: string;
  notes: string;
  photoUrl: string;
  tags: string;
  isActive: number;
  registrationNumber: string;
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const search = searchParams.get('search');
  
  let patients = getData<Patient>('patients');
  
  if (id) {
    const patient = patients.find(p => p.id === id);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }
    return NextResponse.json(patient);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    patients = patients.filter(p => 
      p.firstName.toLowerCase().includes(searchLower) ||
      p.lastName.toLowerCase().includes(searchLower) ||
      p.phone.includes(search) ||
      p.registrationNumber.toLowerCase().includes(searchLower)
    );
  }
  
  return NextResponse.json(patients);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const patients = getData('patients');
    
    // Generate registration number
    const regNumber = `REG${String(patients.length + 1).padStart(3, '0')}`;
    
    const patient = addItem('patients', {
      ...body,
      registrationNumber: regNumber,
      isActive: 1
    });
    
    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Patient ID required' }, { status: 400 });
    }
    
    const patient = updateItem('patients', id, updates);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }
    
    return NextResponse.json(patient);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Patient ID required' }, { status: 400 });
  }
  
  const success = deleteItem('patients', id);
  if (!success) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
  }
  
  return NextResponse.json({ success: true });
}
