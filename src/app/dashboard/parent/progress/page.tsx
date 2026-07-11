'use client';
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function ProgressPage() {
  return (
    <DashboardLayout allowedRoles={['parent']}>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Progress Reports</h1>
        <p className="text-slate-600">View detailed progress reports for your children here.</p>
      </div>
    </DashboardLayout>
  );
}
