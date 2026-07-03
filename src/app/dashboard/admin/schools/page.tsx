'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Building2, Plus, Edit2, CheckCircle2, XCircle, Trash2, UserPlus, RefreshCw, X, ShieldAlert, Check, Loader2 } from 'lucide-react';
import { supabase, supabaseUrl, supabaseAnonKey } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [selectedSchool, setSelectedSchool] = useState<any | null>(null);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'assign'>('create');
  
  // Create New Form State
  const [newAdminFirstName, setNewAdminFirstName] = useState('');
  const [newAdminLastName, setNewAdminLastName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  
  // Assign Existing Form State
  const [existingUsers, setExistingUsers] = useState<any[]>([]);
  const [selectedExistingUserId, setSelectedExistingUserId] = useState('');
  
  // Modal feedback
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  useEffect(() => {
    fetchSchools();
    fetchAdmins();
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

  const fetchAdmins = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, school_id, role')
        .eq('role', 'school_admin')
        .order('first_name');
      
      if (data) setAdmins(data);
    } catch (err) {
      console.error('Error fetching admins:', err);
    }
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#%&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleOpenAddAdminModal = async (school: any) => {
    setSelectedSchool(school);
    setModalMode('create');
    setNewAdminFirstName('');
    setNewAdminLastName('');
    setNewAdminEmail('');
    setNewAdminPassword(generatePassword());
    setModalError('');
    setModalSuccess('');
    setSelectedExistingUserId('');
    setShowAddAdminModal(true);
    
    // Fetch profiles that could be potential admins
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, role')
          .neq('role', 'super_admin')
          .order('first_name');
        if (data) {
          setExistingUsers(data);
        }
      } catch (err) {
        console.error('Error fetching eligible existing users:', err);
      }
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !selectedSchool) return;
    setModalLoading(true);
    setModalError('');
    setModalSuccess('');

    if (!supabaseUrl || !supabaseAnonKey) {
      setModalError('Supabase connection details are missing.');
      setModalLoading(false);
      return;
    }

    try {
      const tempSupabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      });

      const { data, error: signUpError } = await tempSupabase.auth.signUp({
        email: newAdminEmail.trim(),
        password: newAdminPassword,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
          data: {
            first_name: newAdminFirstName.trim(),
            last_name: newAdminLastName.trim(),
            role: 'school_admin',
            school_id: selectedSchool.id,
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('User creation did not return a valid user.');

      setModalSuccess(`Successfully created and assigned administrator ${newAdminFirstName} ${newAdminLastName}!`);
      await fetchAdmins();
      setTimeout(() => {
        setShowAddAdminModal(false);
      }, 1500);
    } catch (err: any) {
      console.error('Error creating admin:', err);
      let errMsg = err.message || '';
      if (errMsg === '{}' || err.name === 'AuthRetryableFetchError' || (typeof errMsg === 'string' && errMsg.includes('confirmation email'))) {
        errMsg = 'Failed to send confirmation email. Since you want to keep email confirmation enabled, you must configure a custom SMTP provider (such as Resend, SendGrid, or Mailgun) in your Supabase Dashboard under Authentication -> Providers -> SMTP. (For temporary testing, you can disable "Confirm email" under Authentication -> Providers -> Email).';
      }
      setModalError(errMsg || 'Failed to create new administrator.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleAssignExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !selectedSchool || !selectedExistingUserId) {
      setModalError('Please select a user.');
      return;
    }
    setModalLoading(true);
    setModalError('');
    setModalSuccess('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          role: 'school_admin',
          school_id: selectedSchool.id
        })
        .eq('id', selectedExistingUserId);

      if (error) throw error;

      setModalSuccess('Successfully assigned existing user as school administrator!');
      await fetchAdmins();
      setTimeout(() => {
        setShowAddAdminModal(false);
      }, 1500);
    } catch (err: any) {
      console.error('Error assigning admin:', err);
      setModalError(err.message || 'Failed to assign administrator.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    if (!supabase) return;
    if (!confirm('Are you sure you want to remove this school administrator? They will be demoted back to a default account.')) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: 'learner', 
          school_id: null 
        })
        .eq('id', adminId);

      if (error) throw error;
      await fetchAdmins();
    } catch (err: any) {
      console.error('Error removing admin:', err);
      alert(`Failed to remove admin: ${err.message || 'Unknown error'}`);
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
                  <th className="py-3 px-4 font-semibold text-sm text-slate-600">School Administrators</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-600">Status</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schools.map(school => (
                  <tr key={school.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{school.name}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {school.contact_info || '-'}
                    </td>
                    <td className="py-3 px-4">
                      {(() => {
                        const schoolAdmins = admins.filter(a => a.school_id === school.id);
                        return (
                          <div className="space-y-1.5 max-w-[280px]">
                            {schoolAdmins.map(admin => (
                              <div key={admin.id} className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-200/60 px-2 py-1 rounded-lg text-xs">
                                <div className="truncate">
                                  <span className="font-bold text-slate-800 block">
                                    {admin.first_name} {admin.last_name}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono block truncate">
                                    {admin.email}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleRemoveAdmin(admin.id)}
                                  className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                                  title="Remove admin role"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                            {schoolAdmins.length === 0 && (
                              <span className="text-slate-400 text-xs italic block">No administrators</span>
                            )}
                            <button
                              onClick={() => handleOpenAddAdminModal(school)}
                              className="mt-1 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              Add Admin
                            </button>
                          </div>
                        );
                      })()}
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
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No schools found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>

      {/* Add School Administrator Modal */}
      <AnimatePresence>
        {showAddAdminModal && selectedSchool && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Add School Administrator</h3>
                  <p className="text-xs text-slate-500">For {selectedSchool.name}</p>
                </div>
                <button
                  onClick={() => setShowAddAdminModal(false)}
                  className="p-1.5 hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mode Selection Tabs */}
              <div className="flex border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setModalMode('create');
                    setModalError('');
                    setModalSuccess('');
                  }}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                    modalMode === 'create'
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Create New Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalMode('assign');
                    setModalError('');
                    setModalSuccess('');
                  }}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                    modalMode === 'assign'
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Assign Existing User
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-4">
                {modalError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg">
                    ⚠️ {modalError}
                  </div>
                )}
                {modalSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{modalSuccess}</span>
                  </div>
                )}

                {modalMode === 'create' ? (
                  <form onSubmit={handleCreateAdmin} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">First Name</label>
                        <input
                          type="text"
                          required
                          value={newAdminFirstName}
                          onChange={e => setNewAdminFirstName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500 transition-all"
                          placeholder="First Name"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Last Name</label>
                        <input
                          type="text"
                          required
                          value={newAdminLastName}
                          onChange={e => setNewAdminLastName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500 transition-all"
                          placeholder="Last Name"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Email Address</label>
                      <input
                        type="email"
                        required
                        value={newAdminEmail}
                        onChange={e => setNewAdminEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500 transition-all"
                        placeholder="admin@example.com"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Temporary Password</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={newAdminPassword}
                          onChange={e => setNewAdminPassword(e.target.value)}
                          className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-indigo-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setNewAdminPassword(generatePassword())}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Regenerate"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        They can use the &quot;Setup / Forgot Password&quot; link on the login gate with this email to set up their custom password.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAddAdminModal(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={modalLoading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-xs font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                      >
                        {modalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        Create Admin Account
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleAssignExisting} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Select User to Promote</label>
                      <select
                        required
                        value={selectedExistingUserId}
                        onChange={e => setSelectedExistingUserId(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                      >
                        <option value="">-- Choose User --</option>
                        {existingUsers.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.first_name} {user.last_name} ({user.email}) - Current: {user.role || 'learner'}
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-slate-400">
                        Selecting a user will change their role to &quot;school_admin&quot; and link them to this school.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAddAdminModal(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={modalLoading || !selectedExistingUserId}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-xs font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                      >
                        {modalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        Assign as Admin
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

