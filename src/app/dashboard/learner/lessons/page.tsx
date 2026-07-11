'use client';
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function LessonsPage() {
  return (
    <DashboardLayout allowedRoles={['learner']}>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Lessons</h1>
        <p className="text-slate-600">Access your assigned lessons here.</p>
      </div>
    </DashboardLayout>
  );
}
