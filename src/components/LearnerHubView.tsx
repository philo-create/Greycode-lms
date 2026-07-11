import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { DashboardCalendar } from '@/components/dashboard/DashboardCalendar';
import { getLearnerData } from '@/lib/dashboard/learnerData';
import { supabase } from '@/lib/supabase';
import { 
  Star, Trophy, PlayCircle, BookOpen, 
  Award, Sparkles, Zap, Palette
} from 'lucide-react';
import { LoadingState } from '@/components/dashboard/LoadingState';

let cachedData: any = null;
let cachedProfile: any = null;

export default function LearnerHubView({ onSelectWorkstation }: { onSelectWorkstation?: () => void }) {
  const router = useRouter();
  const [data, setData] = useState<any>(cachedData);
  const [loading, setLoading] = useState(!cachedData || !cachedProfile);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<any>(cachedProfile);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        if (!cachedProfile) {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .single();
          setProfile(userProfile);
          cachedProfile = userProfile;
        }

        // Always fetch to ensure assignments are up-to-date
        const learnerData = await getLearnerData(session.user.id);
        setData(learnerData);
        cachedData = learnerData;
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
    return <LoadingState message="Loading your Learning Hub..." />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
        {error}
      </div>
    );
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Learner';

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full">
      {/* Friendly Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl py-24 px-8 text-white min-h-[300px] flex flex-col justify-center shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold mb-2 flex items-center">
            Hi, {firstName}! <Sparkles className="ml-2 w-8 h-8 text-yellow-300" />
          </h2>
          <p className="text-indigo-100 text-lg mb-6 max-w-md">
            Ready to learn some cool robotics today? You're doing great!
          </p>
          {/* We remove Continue Lesson button here since they are already in the app, or maybe keep it but it just scrolls down? Or maybe just remove it as they click Curriculum Map to continue */}
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

      <div className="mb-8">
        <DashboardCalendar assignments={data?.assignments || []} role="learner" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DashboardCard title="Assignments & Homework" className="border-4 border-slate-100 rounded-3xl overflow-y-auto max-h-[400px]">
          {data?.assignments && data.assignments.length > 0 ? (
            <div className="space-y-4">
              {data.assignments.map((assignment: any) => (
                <div key={assignment.id} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm hover:border-indigo-200 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded uppercase tracking-wider">
                      {assignment.subject}
                    </span>
                    <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded">
                      Due: {new Date(assignment.due_date).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg mb-1">{assignment.title}</h4>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">{assignment.description}</p>
                  <button 
                    onClick={() => setSelectedAssignment(assignment)}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Open
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No pending homework" 
              description="You're all caught up! Great job!"
              icon={<BookOpen className="w-16 h-16 text-slate-200" />}
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
          </div>
        </DashboardCard>
      </div>

      {selectedAssignment && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative">
            <button 
              onClick={() => setSelectedAssignment(null)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800">{selectedAssignment.title}</h3>
                <p className="text-slate-500 font-medium">{selectedAssignment.subject}</p>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100">
              <h4 className="font-bold text-slate-700 mb-2">Instructions</h4>
              <p className="text-slate-600 text-sm whitespace-pre-wrap">{selectedAssignment.description}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-400">
                Due: {new Date(selectedAssignment.due_date).toLocaleDateString()}
              </span>
              <button 
                onClick={() => setSelectedAssignment(null)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
