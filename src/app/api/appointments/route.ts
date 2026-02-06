// API Routes for Appointments
import { NextRequest, NextResponse } from 'next/server';
import { getData, addItem, updateItem, deleteItem } from '@/lib/db/database';

// Type definition for appointments
export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  type: 'new' | 'followup' | 'emergency';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes: string;
  fees: number;
  feesPaid: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const date = searchParams.get('date');
  const doctorId = searchParams.get('doctorId');
  const patientId = searchParams.get('patientId');
  
  let appointments = getData<Appointment>('appointments');
  
  if (id) {
    const appointment = appointments.find(a => a.id === id);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    return NextResponse.json(appointment);
  }
  
  if (date) {
    appointments = appointments.filter(a => a.appointmentDate === date);
  }
  
  if (doctorId) {
    appointments = appointments.filter(a => a.doctorId === doctorId);
  }
  
  if (patientId) {
    appointments = appointments.filter(a => a.patientId === patientId);
  }
  
  // Sort by date and time
  appointments.sort((a, b) => {
    const dateCompare = a.appointmentDate.localeCompare(b.appointmentDate);
    if (dateCompare !== 0) return dateCompare;
    return a.appointmentTime.localeCompare(b.appointmentTime);
  });
  
  return NextResponse.json(appointments);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const appointment = addItem('appointments', {
      ...body,
      feesPaid: body.feesPaid || 0,
      isActive: 1
    });
    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Appointment ID required' }, { status: 400 });
    }
    
    const appointment = updateItem('appointments', id, updates);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    
    return NextResponse.json(appointment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Appointment ID required' }, { status: 400 });
  }
  
  const success = deleteItem('appointments', id);
  if (!success) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  }
  
  return NextResponse.json({ success: true });
}
