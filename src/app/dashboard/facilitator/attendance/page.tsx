'use client';
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function AttendancePage() {
  return (
    <DashboardLayout allowedRoles={['facilitator']}>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Capture Attendance</h1>
        <p className="text-slate-600">Mark learner attendance here.</p>
      </div>
    </DashboardLayout>
  );
}
