'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    }

    // Update time every minute
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="main-header">
      <div className="header-left">
        {title && <h1 className="header-title">{title}</h1>}
      </div>
      <div className="header-right">
        {currentTime && <span className="header-time">{currentTime}</span>}
        {user && (
          <div className="header-user">
            <Link href="/settings" className="header-user-link">
              <span className="header-user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="header-user-name">{user.name}</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
