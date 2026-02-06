'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const user = localStorage.getItem('currentUser');
    if (user) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`/api/users?username=${encodeURIComponent(username)}`);
      const data = await res.json();

      if (res.ok && data.password === password) {
        // Store user in localStorage
        const { password: _, ...userWithoutPassword } = data;
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        router.push('/dashboard');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      // For demo, use hardcoded credentials
      const demoUsers: Record<string, { password: string; role: string; name: string }> = {
        'doctor': { password: 'doctor123', role: 'doctor', name: 'Dr. Smith' },
        'admin': { password: 'admin123', role: 'admin', name: 'Admin User' },
        'reception': { password: 'reception123', role: 'receptionist', name: 'Receptionist' }
      };

      const user = demoUsers[username.toLowerCase()];
      if (user && user.password === password) {
        localStorage.setItem('currentUser', JSON.stringify({ id: '1', username, name: user.name, role: user.role }));
        router.push('/dashboard');
      } else {
        setError('Invalid username or password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"/>
            <path d="m18 15-2-2"/>
            <path d="m15 18-2-2"/>
          </svg>
        </div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to Homeo PMS</p>

        <form onSubmit={handleLogin}>
          {error && (
            <div className="error" style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fee2e2', borderRadius: '0.375rem' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="label">Username</label>
            <input
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider">
          <span>Demo Credentials</span>
        </div>

        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
          <p><strong>Doctor:</strong> doctor / doctor123</p>
          <p><strong>Admin:</strong> admin / admin123</p>
          <p><strong>Reception:</strong> reception / reception123</p>
        </div>
      </div>
    </div>
  );
}
