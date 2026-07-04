
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { getLearnerData } from '@/lib/dashboard/learnerData';
import { supabase } from '@/lib/supabase';
import { 
  Star, Trophy, PlayCircle, BookOpen, 
  Award, Sparkles, Zap, Palette
} from 'lucide-react';
import { LoadingState } from '@/components/dashboard/LoadingState';

export default function LearnerDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [lessonStatuses, setLessonStatuses] = useState<Record<string, LessonStatus>>({});
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        setUserEmail(session.user.email || '');

        if (session.user.email === 'mapilam2@gmail.com') {
          const hasReset = localStorage.getItem('reset_progress_mapilam_v3');
          if (!hasReset) {
            const emptyProgress = { completedWeeks: {}, starsEarned: {}, totalStars: 0, marksPossible: {} };
            await supabase.from('profiles').update({ progress: emptyProgress }).eq('id', session.user.id);
            await supabase.from('progress').delete().eq('student_id', session.user.id);
            
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && (key.startsWith('gr_wb_') || key.startsWith('w7_act_') || key.startsWith('g1w2_hw_') || key.startsWith('w7_started_'))) {
                keysToRemove.push(key);
              }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));
            
            localStorage.setItem('reset_progress_mapilam_v3', 'true');
            window.location.reload();
            return;
          }
        }

        const { data: userProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single();
          
        setProfile(userProfile);

        const learnerData = await getLearnerData(session.user.id);
        setData(learnerData);
      } catch (err: any) {
        setError('Failed to load your hub. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['learner']}>
        <LoadingState message="Loading your Learning Hub..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout allowedRoles={['learner']}>
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Learner';

  return (
    <DashboardLayout allowedRoles={['learner']}>
      {/* Friendly Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white mb-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold mb-2 flex items-center">
            Hi, {firstName}! <Sparkles className="ml-2 w-8 h-8 text-yellow-300" />
          </h2>
          <p className="text-indigo-100 text-lg mb-6 max-w-md">
            Ready to learn some cool robotics today? You're doing great!
          </p>
          <button 
            onClick={() => router.push('/')}
            className="bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-xl font-bold text-lg flex items-center shadow-sm transition-transform hover:scale-105 active:scale-95"
          >
            <PlayCircle className="w-6 h-6 mr-2" />
            Continue Lesson
          </button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 w-64 h-full opacity-20 pointer-events-none">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#ffffff" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.8,-18,97.4,-2.3C98,13.4,93.2,29.3,83.9,42.4C74.6,55.5,60.8,65.8,45.8,71.8C30.8,77.8,14.6,79.5,-0.8,80.8C-16.2,82.1,-32.4,83,-46.6,77.1C-60.8,71.2,-73.1,58.5,-81.4,43.5C-89.7,28.5,-94,11.2,-92.4,-5.4C-90.8,-22,-83.3,-37.9,-72.6,-50.2C-61.9,-62.5,-48.1,-71.2,-34.1,-78.2C-20.1,-85.2,-6,-90.5,4.7,-98.5L44.7,-76.4Z" transform="translate(100 100)" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Kid-friendly stats */}
        <div className="bg-white rounded-3xl p-6 border-4 border-yellow-100 shadow-sm text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-yellow-100 text-yellow-500 rounded-2xl flex items-center justify-center mb-4 transform rotate-3">
            <Star className="w-10 h-10 fill-current" />
          </div>
          <h3 className="text-slate-500 font-bold mb-1 uppercase tracking-wider text-sm">Points Earned</h3>
          <p className="text-4xl font-black text-slate-800">{data?.stats?.points || 0}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border-4 border-indigo-100 shadow-sm text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-500 rounded-2xl flex items-center justify-center mb-4 transform -rotate-3">
            <Trophy className="w-10 h-10" />
          </div>
          <h3 className="text-slate-500 font-bold mb-1 uppercase tracking-wider text-sm">Badges Won</h3>
          <p className="text-4xl font-black text-slate-800">{data?.stats?.badgesCount || 0}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border-4 border-emerald-100 shadow-sm text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-2xl flex items-center justify-center mb-4 transform rotate-3">
            <Zap className="w-10 h-10 fill-current" />
          </div>
          <h3 className="text-slate-500 font-bold mb-1 uppercase tracking-wider text-sm">Lessons Done</h3>
          <p className="text-4xl font-black text-slate-800">{data?.stats?.completedLessons || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DashboardCard title="My Badges" className="border-4 border-slate-100 rounded-3xl">
          {data?.recentBadges?.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {/* Maps out badges if they exist */}
            </div>
          ) : (
            <EmptyState 
              title="No badges yet!" 
              description="Keep completing lessons to earn cool badges."
              icon={<Award className="w-16 h-16 text-slate-200" />}
            />
          )}
        </DashboardCard>

        <DashboardCard title="Creative Arts Workstation" className="border-4 border-indigo-100 rounded-3xl bg-indigo-50/50">
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border-2 border-indigo-200 flex items-center justify-center mb-4 transform rotate-3">
              <Palette className="w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Maker Space</h3>
            <p className="text-slate-600 mb-6 max-w-sm px-4">
              Draw, design, assemble robots, and connect electronic circuits in your very own creative workstation!
            </p>
            <button 
              onClick={() => router.push('/dashboard/learner/workstation')}
              className="bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-3 rounded-xl font-bold shadow-sm transition-transform hover:scale-105"
            >
              Enter Workstation
            </button>
          </div>
        </DashboardCard>
      </div>
    </DashboardLayout>
  );
}
