'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  role: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject?: string;
  body: string;
  isRead: number;
  createdAt: string;
  sender?: User;
  receiver?: User;
}

export default function MessagesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({ receiverId: '', subject: '', body: '' });
  const [filter, setFilter] = useState<'inbox' | 'sent'>('inbox');

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(JSON.parse(user));
    loadData();
  }, [router]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [messagesRes, usersRes] = await Promise.all([
        fetch('/api/messages'),
        fetch('/api/users')
      ]);
      
      const messagesData = await messagesRes.json();
      const usersData = await usersRes.json();
      
      setMessages(Array.isArray(messagesData) ? messagesData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...composeData,
          senderId: currentUser.id
        })
      });
      setShowCompose(false);
      setComposeData({ receiverId: '', subject: '', body: '' });
      loadData();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: 1 })
      });
      loadData();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const getUser = (userId: string) => users.find(u => u.id === userId) || { name: 'Unknown', role: '' };

  const filteredMessages = messages.filter(m => {
    if (filter === 'inbox') return m.receiverId === currentUser?.id;
    return m.senderId === currentUser?.id;
  });

  if (isLoading) {
    return <div className="loading" style={{ minHeight: '100vh' }}><div className="spinner"></div></div>;
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link href="/dashboard" className="sidebar-logo">🏥 Homeo PMS</Link>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Main</div>
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
            <Link href="/patients" className="nav-link">Patients</Link>
            <Link href="/appointments" className="nav-link">Appointments</Link>
            <Link href="/queue" className="nav-link">Queue</Link>
          </div>
          <div className="nav-section">
            <div className="nav-section-title">Doctor</div>
            <Link href="/doctor-panel" className="nav-link">Doctor Panel</Link>
            <Link href="/messages" className="nav-link active">Messages</Link>
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <h1 className="page-title">Messages</h1>
            <p className="page-subtitle">Internal messaging system</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCompose(true)}>
            + Compose
          </button>
        </header>

        <div className="page-content">
          {showCompose ? (
            <div className="card" style={{ maxWidth: '600px' }}>
              <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>New Message</h3>
              <form onSubmit={sendMessage}>
                <div className="form-group">
                  <label className="label">To</label>
                  <select
                    className="input"
                    value={composeData.receiverId}
                    onChange={(e) => setComposeData(prev => ({ ...prev, receiverId: e.target.value }))}
                    required
                  >
                    <option value="">Select recipient...</option>
                    {users.filter(u => u.id !== currentUser?.id).map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Subject</label>
                  <input
                    type="text"
                    className="input"
                    value={composeData.subject}
                    onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="label">Message</label>
                  <textarea
                    className="input"
                    rows={5}
                    value={composeData.body}
                    onChange={(e) => setComposeData(prev => ({ ...prev, body: e.target.value }))}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" className="btn btn-primary">Send</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCompose(false)}>Cancel</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card">
              <div className="tabs" style={{ marginBottom: '1rem' }}>
                <button
                  className={`tab ${filter === 'inbox' ? 'active' : ''}`}
                  onClick={() => setFilter('inbox')}
                >
                  Inbox
                </button>
                <button
                  className={`tab ${filter === 'sent' ? 'active' : ''}`}
                  onClick={() => setFilter('sent')}
                >
                  Sent
                </button>
              </div>

              {filteredMessages.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📧</div>
                  <h3 className="empty-state-title">No Messages</h3>
                  <p>{filter === 'inbox' ? 'No messages received.' : 'No messages sent.'}</p>
                </div>
              ) : (
                <div>
                  {filteredMessages.map(message => {
                    const otherUser = filter === 'inbox' 
                      ? getUser(message.senderId) 
                      : getUser(message.receiverId);
                    return (
                      <div
                        key={message.id}
                        onClick={() => {
                          if (filter === 'inbox' && !message.isRead) {
                            markAsRead(message.id);
                          }
                        }}
                        style={{
                          padding: '1rem',
                          background: message.isRead === 0 && filter === 'inbox' ? '#eff6ff' : '#f8fafc',
                          borderBottom: '1px solid #e2e8f0',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: message.isRead === 0 && filter === 'inbox' ? '600' : '400' }}>
                            {otherUser.name}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {new Date(message.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {message.subject && (
                          <div style={{ fontWeight: '500', marginTop: '0.25rem' }}>{message.subject}</div>
                        )}
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                          {message.body.substring(0, 100)}...
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
