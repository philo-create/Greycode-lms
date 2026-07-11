'use client';
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function NotesPage() {
  return (
    <DashboardLayout allowedRoles={['facilitator']}>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Class Notes</h1>
        <p className="text-slate-600">Add notes for classes here.</p>
      </div>
    </DashboardLayout>
  );
}
