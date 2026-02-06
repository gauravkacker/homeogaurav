// API Routes for Queue
import { NextRequest, NextResponse } from 'next/server';
import { getData, addItem, updateItem, deleteItem } from '@/lib/db/database';

// Type definition for queue items
export interface QueueItem {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  position: number;
  status: 'waiting' | 'in-progress' | 'completed' | 'cancelled';
  appointmentId?: string;
  notes?: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const doctorId = searchParams.get('doctorId');
  const date = searchParams.get('date');
  
  let queue = getData<QueueItem>('queue');
  
  if (id) {
    const item = queue.find(q => q.id === id);
    if (!item) {
      return NextResponse.json({ error: 'Queue item not found' }, { status: 404 });
    }
    return NextResponse.json(item);
  }
  
  if (doctorId) {
    queue = queue.filter(q => q.doctorId === doctorId);
  }
  
  if (date) {
    queue = queue.filter(q => q.date === date);
  }
  
  // Sort by position
  queue.sort((a, b) => a.position - b.position);
  
  return NextResponse.json(queue);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get current queue count for this doctor/date to set position
    const existingQueue = getData<QueueItem>('queue').filter(
      q => q.doctorId === body.doctorId && q.date === body.date
    );
    
    const queueItem = addItem('queue', {
      ...body,
      position: existingQueue.length + 1,
      isActive: 1
    });
    
    return NextResponse.json(queueItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add to queue' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Queue ID required' }, { status: 400 });
    }
    
    const queueItem = updateItem('queue', id, updates);
    if (!queueItem) {
      return NextResponse.json({ error: 'Queue item not found' }, { status: 404 });
    }
    
    return NextResponse.json(queueItem);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update queue' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Queue ID required' }, { status: 400 });
  }
  
  const success = deleteItem('queue', id);
  if (!success) {
    return NextResponse.json({ error: 'Queue item not found' }, { status: 404 });
  }
  
  return NextResponse.json({ success: true });
}
