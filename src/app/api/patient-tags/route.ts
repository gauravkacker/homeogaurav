// API Routes for Patient Tags
import { NextRequest, NextResponse } from 'next/server';
import { getData, addItem, updateItem, deleteItem } from '@/lib/db/database';

// Type definition for patient tags
export interface PatientTag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  const tags = getData<PatientTag>('patientTags');
  
  if (id) {
    const tag = tags.find(t => t.id === id);
    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }
    return NextResponse.json(tag);
  }
  
  return NextResponse.json(tags);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tag = addItem('patientTags', body);
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Tag ID required' }, { status: 400 });
    }
    
    const tag = updateItem('patientTags', id, updates);
    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }
    
    return NextResponse.json(tag);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Tag ID required' }, { status: 400 });
  }
  
  const success = deleteItem('patientTags', id);
  if (!success) {
    return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
  }
  
  return NextResponse.json({ success: true });
}
