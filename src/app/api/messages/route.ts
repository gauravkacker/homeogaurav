// API Routes for Messages
import { NextRequest, NextResponse } from 'next/server';
import { getData, addItem, updateItem, deleteItem } from '@/lib/db/database';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const senderId = searchParams.get('senderId');
  const receiverId = searchParams.get('receiverId');
  
  let messages = getData('messages');
  
  if (id) {
    const message = messages.find(m => m.id === id);
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    return NextResponse.json(message);
  }
  
  if (senderId) {
    messages = messages.filter(m => m.senderId === senderId);
  }
  
  if (receiverId) {
    messages = messages.filter(m => m.receiverId === receiverId);
  }
  
  // Sort by created date descending
  messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return NextResponse.json(messages);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = addItem('messages', {
      ...body,
      isRead: 0
    });
    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
    }
    
    const message = updateItem('messages', id, updates);
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    
    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
  }
  
  const success = deleteItem('messages', id);
  if (!success) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 });
  }
  
  return NextResponse.json({ success: true });
}
