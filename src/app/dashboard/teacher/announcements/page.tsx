'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { Megaphone, Plus, Search, Filter, PlayCircle, Trash2, Calendar } from 'lucide-react';
import { LoadingState } from '@/components/dashboard/LoadingState';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schoolId, setSchoolId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: new Date().toISOString().slice(0, 16),
    grade: 'R',
    subject: 'General',
    type: 'ANNOUNCEMENT'
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
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
        console.error('Error fetching announcements:', error);
      } else {
        const filteredData = (data || []).filter(a => a.title?.includes('[ANNOUNCEMENT]') || a.title?.includes('[ACTIVITY]'));
        setAnnouncements(filteredData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const newAnnouncement = {
        teacher_id: session.user.id,
        school_id: schoolId,
        title: `[${formData.type}] ${formData.title}`,
        description: formData.description,
        due_date: new Date(formData.due_date).toISOString(),
        grade: formData.grade,
        subject: formData.subject,
      };

      const { error } = await supabase.from('assignments').insert([newAnnouncement]);
      if (error) throw error;

      setIsCreating(false);
      setFormData({
        title: '',
        description: '',
        due_date: new Date().toISOString().slice(0, 16),
        grade: 'R',
        subject: 'General',
        type: 'ANNOUNCEMENT'
      });
      fetchAnnouncements();
    } catch (err: any) {
      alert(`Error scheduling announcement: ${err.message}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    try {
      const { error } = await supabase.from('assignments').delete().eq('id', id);
      if (error) throw error;
      setAnnouncements(announcements.filter(t => t.id !== id));
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete');
    }
  };

  const filteredAnnouncements = announcements.filter(a => {
    const matchesSearch = a.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'ALL') return matchesSearch;
    return matchesSearch && a.title?.includes(`[${filterType}]`);
  });

  return (
    <DashboardLayout allowedRoles={['teacher']}>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Announcements</h1>
          <p className="text-slate-500 mt-2">Manage your class announcements and activities.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>New Announcement</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 bg-slate-50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Types</option>
              <option value="ANNOUNCEMENT">Announcements</option>
              <option value="ACTIVITY">Activities</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingState message="Loading announcements..." />
        ) : filteredAnnouncements.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Megaphone className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-1">No announcements found</p>
            <p>You haven't posted anything yet, or no items match your search.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredAnnouncements.map((item) => {
              const isActivity = item.title?.includes('[ACTIVITY]');
              const cleanTitle = item.title?.replace(/\[.*?\]\s*/, '');
              
              return (
                <div key={item.id} className="p-6 hover:bg-slate-50 transition-colors flex gap-4 group">
                  <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${
                    isActivity ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {isActivity ? <PlayCircle className="w-6 h-6" /> : <Megaphone className="w-6 h-6" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg mb-1">{cleanTitle}</h3>
                        <p className="text-slate-600 mb-3">{item.description}</p>
                      </div>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-slate-400 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(item.created_at || item.due_date).toLocaleDateString(undefined, { 
                          weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
                        })}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs ${
                        isActivity ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {isActivity ? 'Class Activity' : 'Announcement'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-800">New Post</h2>
                <p className="text-sm text-slate-500">Create an announcement or activity</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Post Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'ANNOUNCEMENT'})}
                    className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${
                      formData.type === 'ANNOUNCEMENT' 
                        ? 'border-amber-500 bg-amber-50 text-amber-700 font-medium' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Megaphone className="w-5 h-5" />
                    Announcement
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'ACTIVITY'})}
                    className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${
                      formData.type === 'ACTIVITY' 
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <PlayCircle className="w-5 h-5" />
                    Class Activity
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Bring art supplies tomorrow"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Provide details..."
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
                  <input 
                    required
                    type="text" 
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                  <input 
                    required
                    type="datetime-local" 
                    value={formData.due_date}
                    onChange={e => setFormData({...formData, due_date: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors mr-3"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting...' : 'Post Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
