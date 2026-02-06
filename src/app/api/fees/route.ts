// API Routes for Fees
import { NextRequest, NextResponse } from 'next/server';
import { getData, addItem, updateItem, deleteItem } from '@/lib/db/database';

// Type definition for fees
export interface Fee {
  id: string;
  name: string;
  amount: number;
  type: 'consultation' | 'procedure' | 'package';
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const type = searchParams.get('type');
  
  let fees = getData<Fee>('fees');
  
  if (id) {
    const fee = fees.find(f => f.id === id);
    if (!fee) {
      return NextResponse.json({ error: 'Fee not found' }, { status: 404 });
    }
    return NextResponse.json(fee);
  }
  
  if (type) {
    fees = fees.filter(f => f.type === type);
  }
  
  return NextResponse.json(fees);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fee = addItem('fees', {
      ...body,
      isActive: 1
    });
    return NextResponse.json(fee, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create fee' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Fee ID required' }, { status: 400 });
    }
    
    const fee = updateItem('fees', id, updates);
    if (!fee) {
      return NextResponse.json({ error: 'Fee not found' }, { status: 404 });
    }
    
    return NextResponse.json(fee);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update fee' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Fee ID required' }, { status: 400 });
  }
  
  const success = deleteItem('fees', id);
  if (!success) {
    return NextResponse.json({ error: 'Fee not found' }, { status: 404 });
  }
  
  return NextResponse.json({ success: true });
}
