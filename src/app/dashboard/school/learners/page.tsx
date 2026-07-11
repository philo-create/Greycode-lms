'use client';
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function LearnersPage() {
  return (
    <DashboardLayout allowedRoles={['school_admin']}>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Learners</h1>
        <p className="text-slate-600">Manage your school's learners here.</p>
      </div>
    </DashboardLayout>
  );
}
