'use client';
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function BadgesPage() {
  return (
    <DashboardLayout allowedRoles={['learner']}>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Badges & Achievements</h1>
        <p className="text-slate-600">View your earned badges here.</p>
      </div>
    </DashboardLayout>
  );
}
