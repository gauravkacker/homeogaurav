"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Types for smart parsing configuration
interface QuantityMapping {
  id: string;
  keyword: string;
  displayValue: string;
  enabled: boolean;
}

interface DoseFormMapping {
  id: string;
  keyword: string;
  displayValue: string;
  enabled: boolean;
}

interface DosePatternMapping {
  id: string;
  keyword: string;
  patternValue: string;
  description: string;
  enabled: boolean;
}

interface SmartParsingConfig {
  quantities: QuantityMapping[];
  doseForms: DoseFormMapping[];
  dosePatterns: DosePatternMapping[];
}

// Default configurations
const defaultQuantities: QuantityMapping[] = [
  { id: '1', keyword: '1dr', displayValue: '1dr', enabled: true },
  { id: '2', keyword: '2dr', displayValue: '2dr', enabled: true },
  { id: '3', keyword: '3dr', displayValue: '3dr', enabled: true },
  { id: '4', keyword: '4dr', displayValue: '4dr', enabled: true },
  { id: '5', keyword: '5dr', displayValue: '5dr', enabled: true },
  { id: '6', keyword: '1/2oz', displayValue: '0.5oz', enabled: true },
  { id: '7', keyword: '1oz', displayValue: '1oz', enabled: true },
  { id: '8', keyword: '2oz', displayValue: '2oz', enabled: true },
  { id: '9', keyword: '100ml', displayValue: '100ml', enabled: true },
  { id: '10', keyword: '200ml', displayValue: '200ml', enabled: true },
  { id: '11', keyword: '1 bottle', displayValue: '1 bottle', enabled: true },
  { id: '12', keyword: '2 bottles', displayValue: '2 bottles', enabled: true },
];

const defaultDoseForms: DoseFormMapping[] = [
  { id: '1', keyword: 'pills', displayValue: 'pills', enabled: true },
  { id: '2', keyword: 'tab', displayValue: 'tablet', enabled: true },
  { id: '3', keyword: 'tablet', displayValue: 'tablet', enabled: true },
  { id: '4', keyword: 'liq', displayValue: 'liquid', enabled: true },
  { id: '5', keyword: 'liquid', displayValue: 'liquid', enabled: true },
  { id: '6', keyword: 'drops', displayValue: 'drops', enabled: true },
  { id: '7', keyword: 'sachet', displayValue: 'sachet', enabled: true },
  { id: '8', keyword: 'powder', displayValue: 'powder', enabled: true },
  { id: '9', keyword: 'ointment', displayValue: 'ointment', enabled: true },
  { id: '10', keyword: 'capsules', displayValue: 'capsules', enabled: true },
  { id: '11', keyword: 'globules', displayValue: 'globules', enabled: true },
  { id: '12', keyword: 'syrup', displayValue: 'syrup', enabled: true },
];

const defaultDosePatterns: DosePatternMapping[] = [
  { id: '1', keyword: 'od', patternValue: '1-0-0', description: 'Once a day', enabled: true },
  { id: '2', keyword: 'bd', patternValue: '1-0-1', description: 'Twice a day', enabled: true },
  { id: '3', keyword: 'tds', patternValue: '1-1-1', description: 'Three times a day', enabled: true },
  { id: '4', keyword: 'qid', patternValue: '1-1-1-1', description: 'Four times a day', enabled: true },
  { id: '5', keyword: 'sos', patternValue: 'as needed', description: 'As needed', enabled: true },
  { id: '6', keyword: 'hs', patternValue: '0-0-1', description: 'At bedtime', enabled: true },
  { id: '7', keyword: '1-1-1', patternValue: '1-1-1', description: 'Three times a day', enabled: true },
  { id: '8', keyword: '1-0-1', patternValue: '1-0-1', description: 'Twice a day', enabled: true },
  { id: '9', keyword: '4-4-4', patternValue: '4-4-4', description: 'Four pills each time', enabled: true },
  { id: '10', keyword: '3-3-3', patternValue: '3-3-3', description: 'Three pills each time', enabled: true },
  { id: '11', keyword: '2-2-2', patternValue: '2-2-2', description: 'Two pills each time', enabled: true },
  { id: '12', keyword: '1-1-1-1', patternValue: '1-1-1-1', description: 'Four times a day', enabled: true },
];

export default function SmartParsingSettingsPage() {
  const [quantities, setQuantities] = useState<QuantityMapping[]>(defaultQuantities);
  const [doseForms, setDoseForms] = useState<DoseFormMapping[]>(defaultDoseForms);
  const [dosePatterns, setDosePatterns] = useState<DosePatternMapping[]>(defaultDosePatterns);
  const [saved, setSaved] = useState(false);

  // Load from localStorage on mount
  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('smartParsingConfig');
    if (savedConfig) {
      try {
        const config: SmartParsingConfig = JSON.parse(savedConfig);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (config.quantities?.length) setQuantities(config.quantities);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (config.doseForms?.length) setDoseForms(config.doseForms);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (config.dosePatterns?.length) setDosePatterns(config.dosePatterns);
      } catch (e) {
        console.error('Failed to load smart parsing config:', e);
      }
    }
  }, []);

  // Save to localStorage
  const saveConfig = () => {
    const config: SmartParsingConfig = {
      quantities,
      doseForms,
      dosePatterns,
    };
    localStorage.setItem('smartParsingConfig', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Reset to defaults
  const resetDefaults = () => {
    setQuantities(defaultQuantities);
    setDoseForms(defaultDoseForms);
    setDosePatterns(defaultDosePatterns);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Add new mapping
  const addQuantity = () => {
    setQuantities([...quantities, {
      id: Date.now().toString(),
      keyword: '',
      displayValue: '',
      enabled: true,
    }]);
  };

  const addDoseForm = () => {
    setDoseForms([...doseForms, {
      id: Date.now().toString(),
      keyword: '',
      displayValue: '',
      enabled: true,
    }]);
  };

  const addDosePattern = () => {
    setDosePatterns([...dosePatterns, {
      id: Date.now().toString(),
      keyword: '',
      patternValue: '',
      description: '',
      enabled: true,
    }]);
  };

  // Remove mapping
  const removeQuantity = (id: string) => {
    setQuantities(quantities.filter(q => q.id !== id));
  };

  const removeDoseForm = (id: string) => {
    setDoseForms(doseForms.filter(d => d.id !== id));
  };

  const removeDosePattern = (id: string) => {
    setDosePatterns(dosePatterns.filter(p => p.id !== id));
  };

  // Update mapping
  const updateQuantity = (id: string, field: keyof QuantityMapping, value: string | boolean) => {
    setQuantities(quantities.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateDoseForm = (id: string, field: keyof DoseFormMapping, value: string | boolean) => {
    setDoseForms(doseForms.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const updateDosePattern = (id: string, field: keyof DosePatternMapping, value: string | boolean) => {
    setDosePatterns(dosePatterns.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-gray-800">Smart Parsing Settings</h1>
            <Link
              href="/doctor-panel"
              className="text-sm text-blue-600 hover:underline"
            >
              ← Back to Doctor Panel
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={resetDefaults}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Reset to Defaults
            </button>
            <button
              onClick={saveConfig}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {saved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-medium text-blue-800 mb-2">How Smart Parsing Works</h3>
          <p className="text-sm text-blue-700 mb-2">
            When you type in the medicine field and press <strong>Enter</strong>, the system will automatically:
          </p>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Match keywords like &quot;2dr&quot;, &quot;pills&quot;, &quot;TDS&quot; from your typing</li>
            <li>Auto-fill the Quantity, Dose Form, and Pattern fields</li>
            <li>Example: Type <code className="bg-blue-100 px-1 rounded">Arnica 200 2dr pills TDS for 7 days</code></li>
          </ul>
        </div>

        {/* Quantity Mappings */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Quantity Mappings</h2>
              <p className="text-sm text-gray-500">Map keywords to quantity values</p>
            </div>
            <button
              onClick={addQuantity}
              className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
            >
              + Add Quantity
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-4 gap-4 mb-4 text-sm font-medium text-gray-500">
              <div className="col-span-1">Keyword (what you type)</div>
              <div className="col-span-1">Quantity Value (what fills)</div>
              <div className="col-span-1">Enabled</div>
              <div className="col-span-1">Actions</div>
            </div>
            
            <div className="space-y-2">
              {quantities.map((q) => (
                <div key={q.id} className="grid grid-cols-4 gap-4 items-center">
                  <input
                    type="text"
                    value={q.keyword}
                    onChange={(e) => updateQuantity(q.id, 'keyword', e.target.value)}
                    placeholder="e.g., 2dr"
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={q.displayValue}
                    onChange={(e) => updateQuantity(q.id, 'displayValue', e.target.value)}
                    placeholder="e.g., 2dr"
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={q.enabled}
                      onChange={(e) => updateQuantity(q.id, 'enabled', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => removeQuantity(q.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dose Form Mappings */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Dose Form Mappings</h2>
              <p className="text-sm text-gray-500">Map keywords to dose form values</p>
            </div>
            <button
              onClick={addDoseForm}
              className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
            >
              + Add Dose Form
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-4 gap-4 mb-4 text-sm font-medium text-gray-500">
              <div className="col-span-1">Keyword (what you type)</div>
              <div className="col-span-1">Dose Form Value (what fills)</div>
              <div className="col-span-1">Enabled</div>
              <div className="col-span-1">Actions</div>
            </div>
            
            <div className="space-y-2">
              {doseForms.map((d) => (
                <div key={d.id} className="grid grid-cols-4 gap-4 items-center">
                  <input
                    type="text"
                    value={d.keyword}
                    onChange={(e) => updateDoseForm(d.id, 'keyword', e.target.value)}
                    placeholder="e.g., pills"
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={d.displayValue}
                    onChange={(e) => updateDoseForm(d.id, 'displayValue', e.target.value)}
                    placeholder="e.g., pills"
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={d.enabled}
                      onChange={(e) => updateDoseForm(d.id, 'enabled', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => removeDoseForm(d.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dose Pattern Mappings */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Dose Pattern Mappings</h2>
              <p className="text-sm text-gray-500">Map keywords to pattern values (e.g., TDS → 1-1-1)</p>
            </div>
            <button
              onClick={addDosePattern}
              className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
            >
              + Add Pattern
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-5 gap-4 mb-4 text-sm font-medium text-gray-500">
              <div className="col-span-1">Keyword (what you type)</div>
              <div className="col-span-1">Pattern Value</div>
              <div className="col-span-1">Description</div>
              <div className="col-span-1">Enabled</div>
              <div className="col-span-1">Actions</div>
            </div>
            
            <div className="space-y-2">
              {dosePatterns.map((p) => (
                <div key={p.id} className="grid grid-cols-5 gap-4 items-center">
                  <input
                    type="text"
                    value={p.keyword}
                    onChange={(e) => updateDosePattern(p.id, 'keyword', e.target.value)}
                    placeholder="e.g., tds"
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={p.patternValue}
                    onChange={(e) => updateDosePattern(p.id, 'patternValue', e.target.value)}
                    placeholder="e.g., 1-1-1"
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={p.description}
                    onChange={(e) => updateDosePattern(p.id, 'description', e.target.value)}
                    placeholder="e.g., Three times a day"
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={p.enabled}
                      onChange={(e) => updateDosePattern(p.id, 'enabled', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => removeDosePattern(p.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Example */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Test Your Smart Parsing</h2>
          </div>
          
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Try typing this in the medicine field and press Enter:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
              Arnica 200 2dr pills TDS for 7 days
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Expected result: Medicine=Arnica, Potency=200, Qty=2dr, Dose Form=pills, Pattern=1-1-1, Duration=7 days
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
