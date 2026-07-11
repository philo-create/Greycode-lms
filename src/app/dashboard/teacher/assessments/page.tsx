
'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { ClipboardList, Plus, Search } from 'lucide-react';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { LoadingState } from '@/components/dashboard/LoadingState';

export default function TeacherAssessmentsPage() {
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['teacher']}>
        <LoadingState message="Loading assessments..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={['teacher']}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assessments</h1>
          <p className="text-slate-500">Manage quizzes, tasks, and term marks</p>
        </div>
        <button className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
          <Plus className="w-5 h-5" />
          <span>New Assessment</span>
        </button>
      </div>

      <div className="mb-6 flex">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
            placeholder="Search assessments..."
          />
        </div>
      </div>

      <DashboardCard title="Assessments">
        <EmptyState 
          title="No Assessments Found"
          description="You haven't created any assessments yet."
          icon={<ClipboardList className="w-12 h-12 text-slate-300" />}
        />
      </DashboardCard>
    </DashboardLayout>
  );
}
