// API Routes for Smart Parsing Settings
import { NextRequest, NextResponse } from 'next/server';
import { getData, addItem, updateItem } from '@/lib/db/database';

// Store smart parsing settings in localStorage with a special key
const SMART_PARSING_KEY = 'smart_parsing_settings';

function getSmartParsingSettings() {
  if (typeof window === 'undefined') {
    return {
      quantities: ['1', '2', '3', '4', '5', '10', '15', '20', '30', '50', '100'],
      doseForms: ['tablet', 'capsule', 'drop', 'puff', 'ml', 'tsp', 'tbsp', 'piece', 'cap'],
      dosePatterns: ['1-0-1', '1-1-1', '2-2-2', '0-0-1', '1-0-0', '0-1-0', '2-0-2', '3-0-3']
    };
  }
  const data = localStorage.getItem(SMART_PARSING_KEY);
  if (data) {
    return JSON.parse(data);
  }
  // Default settings
  const defaultSettings = {
    quantities: ['1', '2', '3', '4', '5', '10', '15', '20', '30', '50', '100'],
    doseForms: ['tablet', 'capsule', 'drop', 'puff', 'ml', 'tsp', 'tbsp', 'piece', 'cap'],
    dosePatterns: ['1-0-1', '1-1-1', '2-2-2', '0-0-1', '1-0-0', '0-1-0', '2-0-2', '3-0-3']
  };
  localStorage.setItem(SMART_PARSING_KEY, JSON.stringify(defaultSettings));
  return defaultSettings;
}

function saveSmartParsingSettings(settings: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SMART_PARSING_KEY, JSON.stringify(settings));
}

export async function GET(request: NextRequest) {
  const settings = getSmartParsingSettings();
  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    saveSmartParsingSettings(body);
    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save smart parsing settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    saveSmartParsingSettings(body);
    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update smart parsing settings' }, { status: 500 });
  }
}
