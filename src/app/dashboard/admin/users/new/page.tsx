'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Users, Save, X } from 'lucide-react';

function NewUserForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') || 'learner';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: initialRole,
    school_id: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/dashboard/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <Users className="w-8 h-8 text-indigo-600" />
        <h1 className="text-2xl font-bold text-slate-800">Add New User</h1>
      </div>

      <DashboardCard title="User Details">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. Jane Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="jane@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="learner">Learner</option>
              <option value="teacher">Teacher</option>
              <option value="school_admin">School Admin</option>
              <option value="facilitator">Facilitator</option>
              <option value="parent">Parent</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 flex items-center space-x-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 flex items-center space-x-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save User'}</span>
            </button>
          </div>
        </form>
      </DashboardCard>
    </div>
  );
}

export default function NewUserPage() {
  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <Suspense fallback={<div>Loading...</div>}>
        <NewUserForm />
      </Suspense>
    </DashboardLayout>
  );
}
