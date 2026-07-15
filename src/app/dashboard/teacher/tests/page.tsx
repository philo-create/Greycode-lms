'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { supabase } from '@/lib/supabase';
import { Plus, Clock, Calendar, Trash2, AlertCircle, Sparkles, BookOpen, Layers, Type, AlignLeft } from 'lucide-react';
import { LoadingState } from '@/components/dashboard/LoadingState';

export default function TestsPage() {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [missingTable, setMissingTable] = useState(false);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    grade: 'R',
    description: '',
    due_date: ''
  });

  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', session.user.id)
        .single();
        
      if (profile) setSchoolId(profile.school_id);

      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('teacher_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST205') {
          setMissingTable(true);
        } else {
          console.error('Error fetching tests:', error);
        }
      } else if (data) {
        setTests(data.filter(t => t.title?.startsWith('[TEST/EXAM] ')));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const newTest = {
        teacher_id: session.user.id,
        school_id: schoolId,
        ...formData,
        title: `[TEST/EXAM] ${formData.title}`,
        due_date: new Date(formData.due_date).toISOString()
      };

      const { error } = await supabase
        .from('assignments')
        .insert([newTest]);

      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST205') {
          setMissingTable(true);
          throw new Error('Table missing');
        }
        throw error;
      }
      
      setIsCreating(false);
      setFormData({
        title: '',
        subject: '',
        grade: 'R',
        description: '',
        due_date: ''
      });
      fetchTests();
    } catch (err: any) {
      alert(`Error scheduling test: ${err.message}.`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('assignments').delete().eq('id', id);
      if (error) throw error;
      setTests(tests.filter(t => t.id !== id));
      setDeletingId(null);
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete test');
    }
  };

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['teacher']}>
        <LoadingState message="Loading tests & exams..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={['teacher']}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center">
            <Sparkles className="w-8 h-8 mr-3 text-indigo-600" />
            Tests & Exams
          </h1>
          <p className="text-slate-500 mt-1">Manage scheduled tests and examinations</p>
        </div>
        
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {isCreating ? 'Cancel' : <><Plus className="w-5 h-5" /> Schedule New Test</>}
        </button>
      </div>
      
      {missingTable && (
        <div className="mb-8 p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
          <h3 className="text-lg font-bold flex items-center mb-2">
            <AlertCircle className="w-5 h-5 mr-2" /> Database Setup Required
          </h3>
          <p className="mb-4 text-rose-700">
            The <strong>assignments</strong> table is missing from your Supabase database. 
            To enable tests and exams, please run the SQL command in your Supabase SQL Editor.
          </p>
          <button 
            onClick={() => setMissingTable(false)}
            className="px-4 py-2 bg-rose-100 text-rose-800 hover:bg-rose-200 rounded-lg font-medium text-sm transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {isCreating && (
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden relative">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-rose-50 rounded-full blur-2xl -ml-10 -mb-10 opacity-50 pointer-events-none" />
            
            <div className="relative">
              <div className="px-8 py-8 border-b border-slate-100/80 bg-gradient-to-br from-indigo-50/50 to-white">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-800 text-2xl tracking-tight">Schedule Examination</h2>
                    <p className="text-slate-500 text-sm font-medium">Configure test details, subjects, and scheduling</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreate} className="p-8 md:p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Title Input */}
                  <div className="space-y-2 group">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Type className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      Test Title
                    </label>
                    <input 
                      required
                      type="text" 
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-4 py-3.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400 placeholder:font-medium"
                      placeholder="e.g. Mid-term Assessment"
                    />
                  </div>

                  {/* Subject Input */}
                  <div className="space-y-2 group">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      Subject
                    </label>
                    <input 
                      required
                      type="text" 
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                      className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-4 py-3.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400 placeholder:font-medium"
                      placeholder="e.g. Advanced Mathematics"
                    />
                  </div>

                  {/* Grade Level */}
                  <div className="space-y-2 group">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      Grade Level
                    </label>
                    <div className="relative">
                      <select 
                        required
                        value={formData.grade}
                        onChange={e => setFormData({...formData, grade: e.target.value})}
                        className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-4 py-3.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
                      >
                        {['R', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(g => (
                          <option key={g} value={g} className="font-medium">Grade {g}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="space-y-2 group">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      Date & Time
                    </label>
                    <input 
                      required
                      type="datetime-local" 
                      value={formData.due_date}
                      onChange={e => setFormData({...formData, due_date: e.target.value})}
                      className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-4 py-3.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2 group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <AlignLeft className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    Instructions / Description
                  </label>
                  <textarea 
                    required
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-4 py-3.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all resize-none placeholder:text-slate-400 placeholder:font-medium"
                    placeholder="Provide any specific instructions, materials needed, or topics covered..."
                  />
                </div>

                <div className="flex justify-end pt-6 border-t border-slate-100/80">
                  <button 
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-6 py-3.5 rounded-2xl font-bold text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all mr-3 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-[0_8px_16px_-6px_rgba(79,70,229,0.4)] hover:shadow-[0_12px_20px_-6px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    Schedule Test
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.length > 0 ? tests.map(test => (
          <DashboardCard key={test.id} className="flex flex-col h-full hover:border-indigo-100 hover:shadow-sm transition-all">
            <div className="flex justify-between items-start mb-3">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold rounded uppercase tracking-wider">
                {test.subject} • Grade {test.grade}
              </span>
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 bg-white px-1.5 py-0.5 rounded shadow-sm border border-slate-100">
                <Clock className="w-3 h-3" />
                {new Date(test.due_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
            
            <h3 className="font-black text-lg text-slate-800 mb-2">{test.title.replace('[TEST/EXAM] ', '')}</h3>
            
            <p className="text-sm text-slate-500 mb-4 flex-grow line-clamp-3">
              {test.description}
            </p>
            
            <div className="pt-4 border-t border-slate-100 mt-auto flex flex-col gap-3">
              <div className="flex items-center text-sm text-slate-500 font-medium">
                <Calendar className="w-4 h-4 mr-2 text-indigo-400" />
                {new Date(test.due_date).toLocaleDateString()} at {new Date(test.due_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
              {deletingId === test.id ? (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-slate-500">Are you sure?</span>
                  <button
                    onClick={() => handleDelete(test.id)}
                    className="text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setDeletingId(null)}
                    className="text-slate-600 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setDeletingId(test.id)}
                  className="text-rose-500 hover:text-rose-700 text-sm flex items-center transition-colors font-medium mt-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Cancel Test
                </button>
              )}
            </div>
          </DashboardCard>
        )) : !isCreating && (
          <div className="col-span-full">
            <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-1">No tests scheduled</h3>
              <p className="text-slate-500 text-sm mb-6">Schedule tests to notify students and parents.</p>
              <button 
                onClick={() => setIsCreating(true)}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer bg-indigo-50 px-4 py-2 rounded-xl inline-flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" /> Schedule your first test
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
