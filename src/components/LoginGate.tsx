import { localStore, migrateLocalStorageProgress, getStudentWorkbookStates, mergeProgress, restoreStudentWorkbookStates } from '../lib/localStore';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, UserPlus, ArrowRight, LogIn } from 'lucide-react';
import { StudentProfile, GradeType } from '../types';
import { supabase } from '../lib/supabase';
import { getStudentProfiles } from '../lib/db';
import { GRADES } from '../curriculumData';
import { useRouter } from 'next/navigation';

interface LoginGateProps {
  onLogin: (student: StudentProfile) => void;
}

export default function LoginGate({ onLogin }: LoginGateProps) {
  const router = useRouter();
  const [view, setView] = useState<'login' | 'register'>('login');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  
  const [schools, setSchools] = useState<any[]>([]);
  const [errorText, setErrorText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);

  // Check if session exists on mount
  useEffect(() => {
    if (!supabase) return;
    
    // Fetch active schools
    supabase.from('schools')
      .select('id, name')
      .in('subscription_status', ['active', 'Active'])
      .then(({ data }) => {
        if (data) setSchools(data);
      });
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    }).catch(err => {
      console.warn("Could not fetch session (database might be unreachable):", err);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    if (!supabase) return;
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileError) throw profileError;
      
      if (profile) {
        // Check for enrollment approval
        if ((profile.role === 'student' || profile.role === 'learner') && profile.enrollment_status === 'pending') {
          setIsPendingApproval(true);
          await supabase.auth.signOut();
          return;
        }
        setIsPendingApproval(false);

        let actualGrade = profile.grade || 'R';
        
        if (profile.role === 'learner' || profile.role === 'student') {
          // Fetch from students_classes table to get class as fallback if needed, but we now use profile.grade
          const { data: scData } = await supabase
            .from('students_classes')
            .select('*, classes(grade)')
            .eq('student_id', userId)
            .maybeSingle();
            
          if (scData && scData.classes && scData.classes.grade) {
            actualGrade = scData.classes.grade;
          }
        }
        
        if (profile.role !== 'learner' && profile.role !== 'student') {
          router.push('/dashboard');
          return;
        }

        // Migrate and merge progress to make sure work doesn't disappear
        let localProgress: any = null;
        try {
          const localProfilesStr = localStorage.getItem('caps_student_profiles_v1');
          if (localProfilesStr) {
            const localProfiles = JSON.parse(localProfilesStr);
            const found = localProfiles.find((p: any) => p.id === 'default') || localProfiles[0];
            if (found && found.progress) {
              localProgress = found.progress;
            }
          }
        } catch (e) {
          console.warn('Could not parse local profiles:', e);
        }

        // 1. Migrate detailed workbook states from 'default' to their real logged-in ID
        migrateLocalStorageProgress(profile.id);

        // 2. Fetch the newly copied workbook states for this student
        const localWorkbookStates = getStudentWorkbookStates(profile.id);

        // 3. Construct local progress with those states and any high-level progress found
        const fullLocalProgress = {
          completedWeeks: localProgress?.completedWeeks || {},
          starsEarned: localProgress?.starsEarned || {},
          marksPossible: localProgress?.marksPossible || {},
          totalStars: localProgress?.totalStars || 0,
          workbookStates: localWorkbookStates
        };

        // 4. Merge this local progress with what was returned from the database
        const merged = mergeProgress(fullLocalProgress, profile.progress);

        // 5. Restore the merged detailed workbook states into local storage
        if (merged.workbookStates) {
          restoreStudentWorkbookStates(profile.id, merged.workbookStates);
        }

        // 6. Save the merged progress back to the database so it's durable in the cloud
        const { saveStudentProgress } = await import('../lib/db');
        await saveStudentProgress(profile.id, merged).catch(err => {
          console.error('Failed to update merged progress in DB:', err);
        });

        onLogin({
          id: profile.id,
          name: profile.full_name || profile.first_name || 'Student',
          grade: actualGrade as any,
          avatar: '🦁',
          pin: '',
          progress: merged,
          role: profile.role as 'student' | 'teacher' | 'admin' | 'learner' || 'student'
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setIsPendingApproval(false);
    setIsLoading(true);

    if (!supabase) {
      setErrorText('Supabase is not configured. Check your environment variables.');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      // The onAuthStateChange listener will handle fetching the profile
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        setErrorText('Failed to connect to the database. Please check your Supabase configuration.');
      } else {
        setErrorText(err.message || 'Failed to sign in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setIsPendingApproval(false);
    
    if (!selectedSchool) {
      setErrorText('Please select your school.');
      return;
    }

    if (!selectedGrade) {
      setErrorText('Please select your grade level.');
      return;
    }

    setIsLoading(true);

    if (!supabase) {
      setErrorText('Supabase is not configured.');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            school_id: selectedSchool,
            grade: selectedGrade,
            role: 'learner'
          }
        }
      });

      if (error) throw error;
      
      if (data.user) {
        setIsPendingApproval(true);
        await supabase.auth.signOut();
      }
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        setErrorText('Failed to connect to the database. Please check your Supabase configuration.');
      } else if (err.message && err.message.toLowerCase().includes('rate limit')) {
        setErrorText('Email rate limit exceeded. Please try logging in if you already created an account.');
      } else {
        setErrorText(err.message || 'Failed to register');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isPendingApproval) {
    return (
      <div className="w-full max-w-4xl mx-auto py-10 px-4 min-h-[80vh] flex flex-col justify-center items-center">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl text-center">
          <div className="inline-flex p-4 bg-amber-50 border border-amber-200 rounded-full text-amber-500 mb-6">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Approval Pending</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Your registration has been received! Please wait for a school administrator to approve your account before you can log in and start learning.
          </p>
          <button
            onClick={() => {
              setIsPendingApproval(false);
              setView('login');
            }}
            className="px-6 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4 min-h-[80vh] flex flex-col justify-center items-center" id="login-portal-root">
      <AnimatePresence mode="wait">
        
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl space-y-6 text-center"
        >
          <div className="space-y-3">
            <div className="inline-flex p-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 shadow-xs">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {view === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h1>
            <p className="text-slate-500 text-sm">
              {view === 'login' ? 'Sign in to continue learning' : 'Sign up to start your journey'}
            </p>
          </div>

          <AnimatePresence>
            {errorText && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-rose-50 border border-rose-150 text-rose-700 p-3 rounded-lg text-xs font-bold"
              >
                ⚠️ {errorText}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={view === 'login' ? handleLogin : handleRegister} className="space-y-4 text-left">
            {view === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Select School</label>
                  <select
                    required
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Choose your school --</option>
                    {schools.map(school => (
                      <option key={school.id} value={school.id}>{school.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Grade Level</label>
                  <select
                    required
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Choose your grade --</option>
                    {GRADES.map(g => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black text-sm rounded-xl transition flex items-center justify-center gap-2"
            >
              {isLoading ? 'Please wait...' : view === 'login' ? 'Log In' : 'Create Account'}
              {view === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setView(view === 'login' ? 'register' : 'login');
                setErrorText('');
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              {view === 'login' ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </button>
          </div>
        </motion.div>

      </AnimatePresence>
    </div>
  );
}
