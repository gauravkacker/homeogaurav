'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';

interface TimeSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: number;
}

const DAYS = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' }
];

export default function SlotsSettingsPage() {
  const router = useRouter();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newSlot, setNewSlot] = useState({
    dayOfWeek: '1',
    startTime: '09:00',
    endTime: '18:00',
    slotDuration: '30'
  });

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      router.push('/login');
      return;
    }
    fetchSlots();
  }, [router]);

  const fetchSlots = async () => {
    try {
      const response = await fetch('/api/slots');
      if (response.ok) {
        setSlots(await response.json());
      }
    } catch (err) {
      setError('Error fetching time slots');
    }
    setIsLoading(false);
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSlot,
          dayOfWeek: parseInt(newSlot.dayOfWeek),
          slotDuration: parseInt(newSlot.slotDuration),
          isActive: 1
        })
      });

      if (response.ok) {
        const slot = await response.json();
        setSlots([...slots, slot]);
        setNewSlot({
          dayOfWeek: '1',
          startTime: '09:00',
          endTime: '18:00',
          slotDuration: '30'
        });
        setSuccess('Time slot added successfully');
      } else {
        const data = await response.json();
        setError(data.error || 'Error adding time slot');
      }
    } catch (err) {
      setError('Error adding time slot');
    }
  };

  const handleDeleteSlot = async (id: string) => {
    if (!confirm('Are you sure you want to delete this time slot?')) return;

    try {
      const response = await fetch(`/api/slots/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSlots(slots.filter(slot => slot.id !== id));
        setSuccess('Time slot deleted successfully');
      } else {
        const data = await response.json();
        setError(data.error || 'Error deleting time slot');
      }
    } catch (err) {
      setError('Error deleting time slot');
    }
  };

  const toggleSlot = async (id: string, currentStatus: number) => {
    try {
      const response = await fetch(`/api/slots/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: currentStatus === 1 ? 0 : 1 })
      });

      if (response.ok) {
        setSlots(slots.map(slot => slot.id === id ? { ...slot, isActive: slot.isActive === 1 ? 0 : 1 } : slot));
      }
    } catch (err) {
      setError('Error updating time slot');
    }
  };

  // Group slots by day
  const slotsByDay = DAYS.map(day => ({
    ...day,
    slots: slots.filter(slot => slot.dayOfWeek === parseInt(day.value))
  }));

  if (isLoading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Header title="Time Slots" />
          <div className="loading" style={{ minHeight: '100vh' }}><div className="spinner"></div></div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Time Slots" />
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">Manage Time Slots</h1>
            <p className="page-subtitle">Configure clinic timing and appointment slot durations</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="content-grid">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Add Time Slot</h3>
              </div>
              <div className="card-content">
                <form onSubmit={handleAddSlot} className="form">
                  <Select
                    label="Day"
                    value={newSlot.dayOfWeek}
                    onChange={(e) => setNewSlot({ ...newSlot, dayOfWeek: e.target.value })}
                    options={DAYS}
                  />
                  <div className="form-row">
                    <Input
                      label="Start Time"
                      type="time"
                      value={newSlot.startTime}
                      onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                      required
                    />
                    <Input
                      label="End Time"
                      type="time"
                      value={newSlot.endTime}
                      onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                      required
                    />
                  </div>
                  <Select
                    label="Slot Duration (minutes)"
                    value={newSlot.slotDuration}
                    onChange={(e) => setNewSlot({ ...newSlot, slotDuration: e.target.value })}
                    options={[
                      { value: '15', label: '15 minutes' },
                      { value: '20', label: '20 minutes' },
                      { value: '30', label: '30 minutes' },
                      { value: '45', label: '45 minutes' },
                      { value: '60', label: '60 minutes' }
                    ]}
                  />
                  <Button type="submit">Add Slot</Button>
                </form>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Configured Slots</h3>
              </div>
              <div className="card-content">
                {slots.length === 0 ? (
                  <p className="text-gray-500">No time slots configured yet.</p>
                ) : (
                  <div className="slots-list">
                    {slotsByDay.map(day => (
                      <div key={day.value} className="day-slots">
                        {day.slots.length > 0 && (
                          <>
                            <h4 className="day-title">{day.label}</h4>
                            {day.slots.map(slot => (
                              <div key={slot.id} className={`slot-item ${slot.isActive === 0 ? 'inactive' : ''}`}>
                                <div className="slot-time">
                                  {slot.startTime} - {slot.endTime}
                                </div>
                                <div className="slot-duration">
                                  {slot.slotDuration} min slots
                                </div>
                                <div className="slot-actions">
                                  <Button
                                    size="sm"
                                    variant={slot.isActive === 1 ? 'ghost' : 'outline'}
                                    onClick={() => toggleSlot(slot.id, slot.isActive)}
                                  >
                                    {slot.isActive === 1 ? 'Active' : 'Inactive'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => handleDeleteSlot(slot.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            ))}
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
          <a href="/settings/fees" className="nav-link">Consultation Fees</a>
          <a href="/settings/registration" className="nav-link">Registration</a>
          <a href="/settings/slots" className="nav-link active">Time Slots</a>
          <a href="/settings/smart-parsing" className="nav-link">Smart Parsing</a>
        </div>
      </nav>
    </aside>
  );
}
