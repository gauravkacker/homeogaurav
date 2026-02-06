// API Routes for Combination Medicines
import { NextRequest, NextResponse } from 'next/server';
import { getData, addItem, updateItem, deleteItem } from '@/lib/db/database';

// Type definition for combinations
export interface Combination {
  id: string;
  name: string;
  medicines: string;
  defaultPotency: string;
  notes: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const search = searchParams.get('search');
  
  let combinations = getData<Combination>('combinations');
  
  if (id) {
    const combination = combinations.find(c => c.id === id);
    if (!combination) {
      return NextResponse.json({ error: 'Combination not found' }, { status: 404 });
    }
    return NextResponse.json(combination);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    combinations = combinations.filter(c => 
      c.name.toLowerCase().includes(searchLower)
    );
  }
  
  return NextResponse.json(combinations);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const combination = addItem('combinations', {
      ...body,
      isActive: 1
    });
    return NextResponse.json(combination, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create combination' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Combination ID required' }, { status: 400 });
    }
    
    const combination = updateItem('combinations', id, updates);
    if (!combination) {
      return NextResponse.json({ error: 'Combination not found' }, { status: 404 });
    }
    
    return NextResponse.json(combination);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update combination' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Combination ID required' }, { status: 400 });
  }
  
  const success = deleteItem('combinations', id);
  if (!success) {
    return NextResponse.json({ error: 'Combination not found' }, { status: 404 });
  }
  
  return NextResponse.json({ success: true });
}
