// API Routes for Medicines
import { NextRequest, NextResponse } from 'next/server';
import { getData, addItem, updateItem, deleteItem } from '@/lib/db/database';

// Type definition for medicines
export interface Medicine {
  id: string;
  name: string;
  category: string;
  potency: string;
  unit: string;
  stock: number;
  minStock: number;
  price: number;
  manufacturer: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const search = searchParams.get('search');
  const category = searchParams.get('category');
  
  let medicines = getData<Medicine>('medicines');
  
  if (id) {
    const medicine = medicines.find(m => m.id === id);
    if (!medicine) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
    }
    return NextResponse.json(medicine);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    medicines = medicines.filter(m => 
      m.name.toLowerCase().includes(searchLower) ||
      m.category.toLowerCase().includes(searchLower)
    );
  }
  
  if (category) {
    medicines = medicines.filter(m => m.category === category);
  }
  
  return NextResponse.json(medicines);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const medicine = addItem('medicines', {
      ...body,
      isActive: 1
    });
    return NextResponse.json(medicine, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create medicine' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Medicine ID required' }, { status: 400 });
    }
    
    const medicine = updateItem('medicines', id, updates);
    if (!medicine) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
    }
    
    return NextResponse.json(medicine);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update medicine' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Medicine ID required' }, { status: 400 });
  }
  
  const success = deleteItem('medicines', id);
  if (!success) {
    return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
  }
  
  return NextResponse.json({ success: true });
}
