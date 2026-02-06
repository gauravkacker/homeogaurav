'use client';

import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  size?: 'sm' | 'md';
}

export function Badge({ className = '', variant = 'default', size = 'md', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-indigo-100 text-indigo-800',
    gray: 'bg-gray-100 text-gray-800'
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm'
  };
  
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    scheduled: { variant: 'info', label: 'Scheduled' },
    confirmed: { variant: 'success', label: 'Confirmed' },
    completed: { variant: 'default', label: 'Completed' },
    cancelled: { variant: 'danger', label: 'Cancelled' },
    'no-show': { variant: 'warning', label: 'No Show' },
    waiting: { variant: 'warning', label: 'Waiting' },
    'in-progress': { variant: 'info', label: 'In Progress' },
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'gray', label: 'Inactive' },
    new: { variant: 'success', label: 'New' },
    followup: { variant: 'info', label: 'Follow-up' },
    emergency: { variant: 'danger', label: 'Emergency' }
  };
  
  const config = statusConfig[status] || { variant: 'default', label: status };
  
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
