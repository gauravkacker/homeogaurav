'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface PatientTag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export default function PatientTagsPage() {
  const router = useRouter();
  const [tags, setTags] = useState<PatientTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newTag, setNewTag] = useState({ name: '', color: '#3B82F6' });
  const [editingTag, setEditingTag] = useState<PatientTag | null>(null);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      router.push('/login');
      return;
    }
    fetchTags();
  }, [router]);

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/patient-tags');
      if (response.ok) {
        setTags(await response.json());
      }
    } catch (error) {
      setError('Error fetching tags');
    }
    setIsLoading(false);
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/patient-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTag)
      });

      if (response.ok) {
        const tag = await response.json();
        setTags([...tags, tag]);
        setNewTag({ name: '', color: '#3B82F6' });
        setSuccess('Tag added successfully');
      } else {
        const data = await response.json();
        setError(data.error || 'Error adding tag');
      }
    } catch (error) {
      setError('Error adding tag');
    }
  };

  const handleUpdateTag = async (id: string, updates: Partial<PatientTag>) => {
    try {
      const response = await fetch(`/api/patient-tags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        setTags(tags.map(tag => tag.id === id ? { ...tag, ...updates } : tag));
        setEditingTag(null);
        setSuccess('Tag updated successfully');
      } else {
        const data = await response.json();
        setError(data.error || 'Error updating tag');
      }
    } catch (error) {
      setError('Error updating tag');
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;

    try {
      const response = await fetch(`/api/patient-tags/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTags(tags.filter(tag => tag.id !== id));
        setSuccess('Tag deleted successfully');
      } else {
        const data = await response.json();
        setError(data.error || 'Error deleting tag');
      }
    } catch (error) {
      setError('Error deleting tag');
    }
  };

  if (isLoading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Header title="Patient Tags" />
          <div className="loading" style={{ minHeight: '100vh' }}><div className="spinner"></div></div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Patient Tags" />
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">Manage Patient Tags</h1>
            <p className="page-subtitle">Create and manage tags for categorizing patients</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="content-grid">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Add New Tag</h3>
              </div>
              <div className="card-content">
                <form onSubmit={handleAddTag} className="form">
                  <Input
                    label="Tag Name"
                    value={newTag.name}
                    onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                    placeholder="e.g., VIP, Regular, Follow-up"
                    required
                  />
                  <div className="form-group">
                    <label className="form-label">Color</label>
                    <input
                      type="color"
                      value={newTag.color}
                      onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                      className="color-input"
                    />
                  </div>
                  <Button type="submit">Add Tag</Button>
                </form>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Existing Tags ({tags.length})</h3>
              </div>
              <div className="card-content">
                {tags.length === 0 ? (
                  <p className="text-gray-500">No tags created yet.</p>
                ) : (
                  <div className="tags-list">
                    {tags.map(tag => (
                      <div key={tag.id} className="tag-item">
                        {editingTag?.id === tag.id ? (
                          <div className="tag-edit-form">
                            <Input
                              value={editingTag.name}
                              onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                              className="tag-name-input"
                            />
                            <input
                              type="color"
                              value={editingTag.color}
                              onChange={(e) => setEditingTag({ ...editingTag, color: e.target.value })}
                              className="color-input"
                            />
                            <Button size="sm" onClick={() => handleUpdateTag(tag.id, editingTag)}>
                              Save
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => setEditingTag(null)}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div
                              className="tag-color"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span className="tag-name">{tag.name}</span>
                            <div className="tag-actions">
                              <Button size="sm" variant="ghost" onClick={() => setEditingTag(tag)}>
                                Edit
                              </Button>
                              <Button size="sm" variant="danger" onClick={() => handleDeleteTag(tag.id)}>
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
        <a href="/dashboard" className="sidebar-logo">🏥 Homeo PMS</a>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">
          <a href="/dashboard" className="nav-link">Dashboard</a>
          <a href="/patients" className="nav-link active">Patients</a>
          <a href="/appointments" className="nav-link">Appointments</a>
          <a href="/queue" className="nav-link">Queue</a>
          <a href="/doctor-panel" className="nav-link">Doctor Panel</a>
          <a href="/messages" className="nav-link">Messages</a>
        </div>
      </nav>
    </aside>
  );
}
