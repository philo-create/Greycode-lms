'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Building2, Plus, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setSchools(data);
    } catch (err) {
      console.error('Error fetching schools:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (schoolId: string, newStatus: string) => {
    if (!supabase) return;
    try {
      await supabase
        .from('schools')
        .update({ subscription_status: newStatus })
        .eq('id', schoolId);
      
      fetchSchools();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <Building2 className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-800">Schools Management</h1>
        </div>
        <Link 
          href="/dashboard/admin/schools/new"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add School
        </Link>
      </div>

      <DashboardCard title="All Schools">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading schools...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold text-sm text-slate-600">Name</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-600">Location/Contact</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-600">Status</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schools.map(school => (
                  <tr key={school.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{school.name}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {school.contact_info || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                        (school.subscription_status?.toLowerCase() === 'active' || school.subscription_status?.toLowerCase() === 'trial') ? 'bg-emerald-100 text-emerald-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {school.subscription_status || 'active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end space-x-2">
                        {school.subscription_status?.toLowerCase() !== 'active' && (
                          <button
                            onClick={() => handleStatusChange(school.id, 'Active')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            title="Set Active"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        )}
                        {school.subscription_status?.toLowerCase() === 'active' && (
                          <button
                            onClick={() => handleStatusChange(school.id, 'Inactive')}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Set Inactive"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {schools.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No schools found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>
    </DashboardLayout>
  );
}
