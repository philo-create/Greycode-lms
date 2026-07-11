'use client';
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function ClassPage() {
  return (
    <DashboardLayout allowedRoles={['facilitator']}>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Start Class</h1>
        <p className="text-slate-600">Start and manage live classes here.</p>
      </div>
    </DashboardLayout>
  );
}
