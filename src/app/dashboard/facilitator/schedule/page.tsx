'use client';
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function SchedulePage() {
  return (
    <DashboardLayout allowedRoles={['facilitator']}>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Schedule</h1>
        <p className="text-slate-600">View your facilitating schedule here.</p>
      </div>
    </DashboardLayout>
  );
}
