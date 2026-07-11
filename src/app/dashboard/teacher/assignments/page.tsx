'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { supabase } from '@/lib/supabase';
import { Plus, BookOpen, Clock, Calendar, CheckCircle, Trash2, AlertCircle } from 'lucide-react';
import { LoadingState } from '@/components/dashboard/LoadingState';

export default function AssignmentsPage() {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
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

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
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
          console.error('Error fetching assignments:', error);
        }
      } else if (data) {
        setAssignments(data);
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

      const newAssignment = {
        teacher_id: session.user.id,
        school_id: schoolId,
        ...formData,
        due_date: new Date(formData.due_date).toISOString()
      };

      const { error } = await supabase
        .from('assignments')
        .insert([newAssignment]);

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
      fetchAssignments();
    } catch (err: any) {
      alert(`Error creating assignment: ${err.message}. Ensure you have run the add-assignments.sql file.`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      const { error } = await supabase.from('assignments').delete().eq('id', id);
      if (error) throw error;
      setAssignments(assignments.filter(a => a.id !== id));
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete assignment');
    }
  };

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['teacher']}>
        <LoadingState message="Loading assignments..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={['teacher']}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Assignments & Homework</h1>
          <p className="text-slate-500">Manage tasks across all your subjects</p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {isCreating ? 'Cancel' : <><Plus className="w-5 h-5" /> New Assignment</>}
        </button>
      </div>

      
      {missingTable && (
        <div className="mb-8 p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
          <h3 className="text-lg font-bold flex items-center mb-2">
            <AlertCircle className="w-5 h-5 mr-2" /> Database Setup Required
          </h3>
          <p className="mb-4 text-rose-700">
            The <strong>assignments</strong> table is missing from your Supabase database. 
            To enable assignments and homework, please run the following SQL command in your Supabase SQL Editor:
          </p>
          <div className="relative group">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap">
              {`CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    grade VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all" ON public.assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for teachers" ON public.assignments FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin', 'super_admin', 'school_admin')));
CREATE POLICY "Enable update for teachers" ON public.assignments FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin', 'super_admin', 'school_admin')));
CREATE POLICY "Enable delete for teachers" ON public.assignments FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin', 'super_admin', 'school_admin')));`}
            </pre>
          </div>
          <button 
            onClick={() => setMissingTable(false)}
            className="mt-4 px-4 py-2 bg-rose-100 text-rose-800 hover:bg-rose-200 rounded-lg font-medium text-sm transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {isCreating && (
        <div className="mb-8">
          <DashboardCard title="Create New Assignment">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input 
                    required
                    type="text" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full rounded-lg border-slate-300 shadow-sm p-2 border"
                    placeholder="e.g. Weekly Spelling Words"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <input 
                    required
                    type="text" 
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="w-full rounded-lg border-slate-300 shadow-sm p-2 border"
                    placeholder="e.g. English, Math, Life Skills"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Grade Level</label>
                  <select 
                    required
                    value={formData.grade}
                    onChange={e => setFormData({...formData, grade: e.target.value})}
                    className="w-full rounded-lg border-slate-300 shadow-sm p-2 border bg-white"
                  >
                    <option value="R">Grade R</option>
                    <option value="1">Grade 1</option>
                    <option value="2">Grade 2</option>
                    <option value="3">Grade 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                  <input 
                    required
                    type="datetime-local" 
                    value={formData.due_date}
                    onChange={e => setFormData({...formData, due_date: e.target.value})}
                    className="w-full rounded-lg border-slate-300 shadow-sm p-2 border"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description / Instructions</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full rounded-lg border-slate-300 shadow-sm p-2 border"
                  placeholder="Provide instructions for the students..."
                />
              </div>
              <div className="flex justify-end">
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Publish Assignment
                </button>
              </div>
            </form>
          </DashboardCard>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.length > 0 ? assignments.map(assignment => (
          <DashboardCard key={assignment.id} className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-2">
              <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded uppercase tracking-wider">
                {assignment.subject}
              </span>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                Grade {assignment.grade}
              </span>
            </div>
            
            <h3 className="font-bold text-lg text-slate-800 mb-2">{assignment.title}</h3>
            
            <p className="text-sm text-slate-600 mb-4 flex-grow line-clamp-3">
              {assignment.description}
            </p>
            
            <div className="pt-4 border-t border-slate-100 mt-auto flex flex-col gap-3">
              <div className="flex items-center text-sm text-slate-500">
                <Calendar className="w-4 h-4 mr-2" />
                Due: {new Date(assignment.due_date).toLocaleDateString()} at {new Date(assignment.due_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
              <button 
                onClick={() => handleDelete(assignment.id)}
                className="text-red-500 hover:text-red-700 text-sm flex items-center transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete Assignment
              </button>
            </div>
          </DashboardCard>
        )) : !isCreating && (
          <div className="col-span-full">
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">No assignments yet</h3>
              <p className="text-slate-500">Create your first assignment to share with students and parents.</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
