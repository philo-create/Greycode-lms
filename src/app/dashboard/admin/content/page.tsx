'use client';
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function ContentPage() {
  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Manage Content</h1>
        <p className="text-slate-600">Manage learning content here.</p>
      </div>
    </DashboardLayout>
  );
}
