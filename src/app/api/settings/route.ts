// API Routes for Settings
import { NextRequest, NextResponse } from 'next/server';
import { getData, addItem, updateItem } from '@/lib/db/database';

// Store settings in localStorage with a special key
const SETTINGS_KEY = 'settings';

function getSettingsData() {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveSettingsData(data: any[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const key = searchParams.get('key');
  
  const settings = getSettingsData();
  
  if (key) {
    const setting = settings.find((s: any) => s.key === key);
    if (!setting) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
    }
    return NextResponse.json(setting);
  }
  
  // Return all settings as key-value object
  const settingsObj: Record<string, any> = {};
  settings.forEach((s: any) => {
    if (s.type === 'json') {
      settingsObj[s.key] = JSON.parse(s.value || '[]');
    } else {
      settingsObj[s.key] = s.value;
    }
  });
  
  return NextResponse.json(settingsObj);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const settings = getSettingsData();
    
    // Check if setting exists
    const existingIndex = settings.findIndex((s: any) => s.key === body.key);
    
    if (existingIndex >= 0) {
      // Update existing
      settings[existingIndex] = {
        ...settings[existingIndex],
        value: typeof body.value === 'object' ? JSON.stringify(body.value) : body.value,
        type: body.type || 'string',
        updatedAt: new Date().toISOString()
      };
    } else {
      // Add new
      settings.push({
        id: Date.now().toString(),
        key: body.key,
        value: typeof body.value === 'object' ? JSON.stringify(body.value) : body.value,
        type: body.type || 'string',
        updatedAt: new Date().toISOString()
      });
    }
    
    saveSettingsData(settings);
    return NextResponse.json(settings[existingIndex >= 0 ? existingIndex : settings.length - 1]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, type } = body;
    
    const settings = getSettingsData();
    const existingIndex = settings.findIndex((s: any) => s.key === key);
    
    if (existingIndex >= 0) {
      settings[existingIndex] = {
        ...settings[existingIndex],
        value: typeof value === 'object' ? JSON.stringify(value) : value,
        type: type || 'string',
        updatedAt: new Date().toISOString()
      };
      saveSettingsData(settings);
      return NextResponse.json(settings[existingIndex]);
    } else {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
