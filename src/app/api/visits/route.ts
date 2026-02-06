// API Routes for Visits
import { NextRequest, NextResponse } from 'next/server';
import { getData, addItem, updateItem, deleteItem } from '@/lib/db/database';

// Type definition for visits
export interface Visit {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  visitDate: string;
  chiefComplaint: string;
  history: string;
  examination: string;
  diagnosis: string;
  prescription: string;
  advice: string;
  nextVisitDate: string;
  weight: number;
  temperature: number;
  pulse: number;
  bloodPressure: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const patientId = searchParams.get('patientId');
  const doctorId = searchParams.get('doctorId');
  
  let visits = getData<Visit>('visits');
  
  if (id) {
    const visit = visits.find(v => v.id === id);
    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }
    return NextResponse.json(visit);
  }
  
  if (patientId) {
    visits = visits.filter(v => v.patientId === patientId);
  }
  
  if (doctorId) {
    visits = visits.filter(v => v.doctorId === doctorId);
  }
  
  // Sort by date descending
  visits.sort((a, b) => b.visitDate.localeCompare(a.visitDate));
  
  return NextResponse.json(visits);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const visit = addItem('visits', {
      ...body,
      isActive: 1
    });
    return NextResponse.json(visit, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create visit' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Visit ID required' }, { status: 400 });
    }
    
    const visit = updateItem('visits', id, updates);
    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }
    
    return NextResponse.json(visit);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update visit' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Visit ID required' }, { status: 400 });
  }
  
  const success = deleteItem('visits', id);
  if (!success) {
    return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
  }
  
  return NextResponse.json({ success: true });
}
