'use client';
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function ReportsPage() {
  return (
    <DashboardLayout allowedRoles={['school_admin']}>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Grade Reports</h1>
        <p className="text-slate-600">View performance and grading reports here.</p>
      </div>
    </DashboardLayout>
  );
}
