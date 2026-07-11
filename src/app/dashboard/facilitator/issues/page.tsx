'use client';
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function IssuesPage() {
  return (
    <DashboardLayout allowedRoles={['facilitator']}>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Report Issue</h1>
        <p className="text-slate-600">Report any technical or class issues here.</p>
      </div>
    </DashboardLayout>
  );
}
