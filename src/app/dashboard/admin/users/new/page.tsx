
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Users, Save, X, RefreshCw, Key, Check } from 'lucide-react';
import { supabase, supabaseUrl, supabaseAnonKey } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

function NewUserForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') || 'learner';
  
  const [loading, setLoading] = useState(false);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [schools, setSchools] = useState<any[]>([]);

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#%&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: initialRole,
    school_id: '',
    grade: ''
  });

  // Pre-fill a generated password on component mount
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      password: generatePassword()
    }));
  }, []);

  // Fetch schools on mount
  useEffect(() => {
    const fetchSchools = async () => {
      if (!supabase) {
        setSchoolsLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('schools')
          .select('id, name')
          .order('name');
        if (error) throw error;
        if (data) setSchools(data);
      } catch (err: any) {
        console.error('Failed to load schools:', err);
        setError('Failed to load schools list. Please refresh.');
      } finally {
        setSchoolsLoading(false);
      }
    };

    fetchSchools();
  }, []);

  const handleGeneratePassword = () => {
    setFormData(prev => ({
      ...prev,
      password: generatePassword()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Field Validations based on selected Role
    const isSchoolRequired = ['learner', 'teacher', 'school_admin', 'facilitator'].includes(formData.role);
    const isGradeRequired = ['learner', 'teacher'].includes(formData.role);

    if (isSchoolRequired && !formData.school_id) {
      setError('Please select a school for this role.');
      setLoading(false);
      return;
    }

    if (isGradeRequired && !formData.grade) {
      setError('Please select a grade level for this role.');
      setLoading(false);
      return;
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      setError('Supabase connection details are missing.');
      setLoading(false);
      return;
    }

    try {
      // 1. Create a non-persistent Supabase client so we sign up the user without losing our current session
      const tempSupabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      });

      // 2. Register the user in Supabase auth
      const { data, error: signUpError } = await tempSupabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: formData.role,
            school_id: formData.school_id || null,
            grade: formData.grade || null,
          }
        }
      });

      if (signUpError) throw signUpError;

      if (!data.user) {
        throw new Error('User was not created successfully.');
      }

      // Send branded Zoho Welcome/Invitation Email in the background
      try {
        await fetch('/api/email/send-welcome', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            role: formData.role
          })
        });
      } catch (welcomeErr) {
        console.warn('Failed to send welcome notification email:', welcomeErr);
      }

      setSuccess(`User successfully registered! An invitation email has been dispatched to ${formData.email}.`);
      
      // Delay navigation to let the success state render nicely
      setTimeout(() => {
        window.location.href = '/dashboard/admin/users';
      }, 2000);

    } catch (err: any) {
      console.error('User creation failed:', err);
      let errMsg = err.message || '';
      if (errMsg === '{}' || err.name === 'AuthRetryableFetchError' || (typeof errMsg === 'string' && errMsg.includes('confirmation email'))) {
        errMsg = 'Failed to send confirmation email. Since you want to keep email confirmation enabled, you must configure a custom SMTP provider (such as Resend, SendGrid, or Mailgun) in your Supabase Dashboard under Authentication -> Providers -> SMTP. (For temporary testing, you can disable "Confirm email" under Authentication -> Providers -> Email).';
      }
      setError(errMsg || 'Failed to create user. Please check details and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Determine which options to show
  const showSchoolSelect = ['learner', 'teacher', 'school_admin', 'facilitator'].includes(formData.role);
  const showGradeSelect = ['learner', 'teacher'].includes(formData.role);

  return (
    <div className="max-w-2xl mx-auto" id="new-user-container">
      <div className="flex items-center space-x-3 mb-6" id="new-user-header">
        <Users className="w-8 h-8 text-indigo-600" />
        <h1 className="text-2xl font-bold text-slate-800">Add New User</h1>
      </div>

      <DashboardCard title="User Account Details" id="new-user-card">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm font-semibold" id="form-error">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-sm font-bold flex items-center space-x-2" id="form-success">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" id="new-user-form">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                First Name
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="e.g. Jane"
                id="input-first-name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="e.g. Doe"
                id="input-last-name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="jane@example.com"
                id="input-email"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="Password"
                  id="input-password"
                />
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Generate random password"
                  id="btn-generate-password"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Role
            </label>
            <select
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value, school_id: '', grade: ''})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
              id="select-role"
            >
              <option value="learner">Learner / Student</option>
              <option value="teacher">Teacher</option>
              <option value="school_admin">School Admin</option>
              <option value="facilitator">Facilitator</option>
              <option value="parent">Parent</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          {showSchoolSelect && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                School
              </label>
              <select
                required
                disabled={schoolsLoading}
                value={formData.school_id}
                onChange={e => setFormData({...formData, school_id: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer disabled:opacity-50"
                id="select-school"
              >
                <option value="">-- Select School --</option>
                {schools.map(school => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showGradeSelect && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                {formData.role === 'teacher' ? 'Assigned Grades (Select multiple)' : 'Grade'}
              </label>
              {formData.role === 'teacher' ? (
                <div className="grid grid-cols-4 gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3" id="select-grade">
                  {['R', '1', '2', '3', '4', '5', '6', '7'].map(g => {
                    const selectedGrades = formData.grade ? formData.grade.split(',') : [];
                    const isSelected = selectedGrades.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          let newGrades;
                          if (isSelected) {
                            newGrades = selectedGrades.filter((x: string) => x !== g);
                          } else {
                            newGrades = [...selectedGrades, g];
                          }
                          const sortedGrades = ['R', '1', '2', '3', '4', '5', '6', '7'].filter(x => newGrades.includes(x));
                          setFormData({ ...formData, grade: sortedGrades.join(',') });
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span>Grade {g}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <select
                  required
                  value={formData.grade}
                  onChange={e => setFormData({...formData, grade: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                  id="select-grade"
                >
                  <option value="">-- Select Grade --</option>
                  <option value="R">Grade R</option>
                  <option value="1">Grade 1</option>
                  <option value="2">Grade 2</option>
                  <option value="3">Grade 3</option>
                  <option value="4">Grade 4</option>
                  <option value="5">Grade 5</option>
                  <option value="6">Grade 6</option>
                  <option value="7">Grade 7</option>
                </select>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100" id="form-actions">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 flex items-center space-x-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-semibold transition-colors"
              id="btn-cancel"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              disabled={loading || schoolsLoading}
              className="px-5 py-2.5 flex items-center space-x-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
              id="btn-save"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Create User'}</span>
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
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      }>
        <NewUserForm />
      </Suspense>
    </DashboardLayout>
  );
}
