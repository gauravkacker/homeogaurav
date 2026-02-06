'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';

interface Fee {
  id: string;
  name: string;
  amount: number;
  type: string;
  isActive: number;
  createdAt: string;
}

export default function FeesSettingsPage() {
  const router = useRouter();
  const [fees, setFees] = useState<Fee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newFee, setNewFee] = useState({ name: '', amount: '', type: 'consultation' });
  const [editingFee, setEditingFee] = useState<Fee | null>(null);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      router.push('/login');
      return;
    }
    fetchFees();
  }, [router]);

  const fetchFees = async () => {
    try {
      const response = await fetch('/api/fees');
      if (response.ok) {
        setFees(await response.json());
      }
    } catch (error) {
      setError('Error fetching fees');
    }
    setIsLoading(false);
  };

  const handleAddFee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newFee,
          amount: parseFloat(newFee.amount),
          isActive: 1
        })
      });

      if (response.ok) {
        const fee = await response.json();
        setFees([...fees, fee]);
        setNewFee({ name: '', amount: '', type: 'consultation' });
        setSuccess('Fee added successfully');
      } else {
        const data = await response.json();
        setError(data.error || 'Error adding fee');
      }
    } catch (error) {
      setError('Error adding fee');
    }
  };

  const handleUpdateFee = async (id: string, updates: Partial<Fee>) => {
    try {
      const response = await fetch(`/api/fees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        setFees(fees.map(fee => fee.id === id ? { ...fee, ...updates } : fee));
        setEditingFee(null);
        setSuccess('Fee updated successfully');
      } else {
        const data = await response.json();
        setError(data.error || 'Error updating fee');
      }
    } catch (error) {
      setError('Error updating fee');
    }
  };

  const handleDeleteFee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fee?')) return;

    try {
      const response = await fetch(`/api/fees/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setFees(fees.filter(fee => fee.id !== id));
        setSuccess('Fee deleted successfully');
      } else {
        const data = await response.json();
        setError(data.error || 'Error deleting fee');
      }
    } catch (error) {
      setError('Error deleting fee');
    }
  };

  if (isLoading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Header title="Consultation Fees" />
          <div className="loading" style={{ minHeight: '100vh' }}><div className="spinner"></div></div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Consultation Fees" />
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">Manage Consultation Fees</h1>
            <p className="page-subtitle">Set up different fee types for consultations and procedures</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="content-grid">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Add New Fee</h3>
              </div>
              <div className="card-content">
                <form onSubmit={handleAddFee} className="form">
                  <Input
                    label="Fee Name"
                    value={newFee.name}
                    onChange={(e) => setNewFee({ ...newFee, name: e.target.value })}
                    placeholder="e.g., Initial Consultation, Follow-up, Procedure"
                    required
                  />
                  <Input
                    label="Amount (₹)"
                    type="number"
                    step="0.01"
                    value={newFee.amount}
                    onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                  <Select
                    label="Fee Type"
                    value={newFee.type}
                    onChange={(e) => setNewFee({ ...newFee, type: e.target.value })}
                    options={[
                      { value: 'consultation', label: 'Consultation' },
                      { value: 'procedure', label: 'Procedure' },
                      { value: 'package', label: 'Package' },
                      { value: 'other', label: 'Other' }
                    ]}
                  />
                  <Button type="submit">Add Fee</Button>
                </form>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Existing Fees ({fees.length})</h3>
              </div>
              <div className="card-content">
                {fees.length === 0 ? (
                  <p className="text-gray-500">No fees configured yet.</p>
                ) : (
                  <div className="fees-list">
                    {fees.map(fee => (
                      <div key={fee.id} className="fee-item">
                        {editingFee?.id === fee.id ? (
                          <div className="fee-edit-form">
                            <Input
                              value={editingFee.name}
                              onChange={(e) => setEditingFee({ ...editingFee, name: e.target.value })}
                              className="fee-name-input"
                            />
                            <Input
                              type="number"
                              step="0.01"
                              value={editingFee.amount}
                              onChange={(e) => setEditingFee({ ...editingFee, amount: parseFloat(e.target.value) })}
                              className="fee-amount-input"
                            />
                            <Button size="sm" onClick={() => handleUpdateFee(fee.id, editingFee)}>
                              Save
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => setEditingFee(null)}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="fee-info">
                              <span className="fee-name">{fee.name}</span>
                              <span className="fee-type">{fee.type}</span>
                            </div>
                            <div className="fee-amount">₹{fee.amount.toFixed(2)}</div>
                            <div className="fee-actions">
                              <Button size="sm" variant="ghost" onClick={() => setEditingFee(fee)}>
                                Edit
                              </Button>
                              <Button size="sm" variant="danger" onClick={() => handleDeleteFee(fee.id)}>
                                Delete
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sidebar component
function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <a href="/settings" className="sidebar-logo">🏥 Homeo PMS</a>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Settings</div>
          <a href="/settings" className="nav-link">General</a>
          <a href="/settings/fees" className="nav-link active">Consultation Fees</a>
          <a href="/settings/registration" className="nav-link">Registration</a>
          <a href="/settings/slots" className="nav-link">Time Slots</a>
          <a href="/settings/smart-parsing" className="nav-link">Smart Parsing</a>
        </div>
      </nav>
    </aside>
  );
}
