// API Routes for Users
import { NextRequest, NextResponse } from 'next/server';
import { getData, addItem, updateItem, deleteItem } from '@/lib/db/database';

// Type definition for users
export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'doctor' | 'receptionist';
  email: string;
  phone: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const username = searchParams.get('username');
  const role = searchParams.get('role');
  
  let users = getData<User>('users');
  
  if (id) {
    const user = users.find(u => u.id === id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  }
  
  if (username) {
    const user = users.find(u => u.username === username);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  }
  
  if (role) {
    users = users.filter(u => u.role === role);
  }
  
  // Remove password from response
  users = users.map(({ password, ...user }: any) => user);
  
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = addItem<User>('users', {
      ...body,
      isActive: 1
    });
    const { password, ...userWithoutPassword } = user as User & { password: string };
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    const user = updateItem<User>('users', id, updates);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const { password, ...userWithoutPassword } = user as User & { password?: string };
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }
  
  const success = deleteItem('users', id);
  if (!success) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  
  return NextResponse.json({ success: true });
}
