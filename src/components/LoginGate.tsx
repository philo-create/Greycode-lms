'use client';
import { localStore, migrateLocalStorageProgress, getStudentWorkbookStates, mergeProgress, restoreStudentWorkbookStates } from '../lib/localStore';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, UserPlus, ArrowRight, LogIn } from 'lucide-react';
import { StudentProfile, GradeType } from '../types';
import { supabase } from '../lib/supabase';
import { getStudentProfiles } from '../lib/db';
import { GRADES } from '../curriculumData';
import { useRouter } from 'next/navigation';
import FamilyRegistrationForm from './FamilyRegistrationForm';

interface LoginGateProps {
  onLogin: (student: StudentProfile) => void;
}

export default function LoginGate({ onLogin }: LoginGateProps) {
  const router = useRouter();
  const [view, setView] = useState<'login' | 'register' | 'complete_profile' | 'forgot_password' | 'reset_password'>('login');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successText, setSuccessText] = useState('');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  
  // Parent / Guardian Details
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentRelationship, setParentRelationship] = useState('');
  
  const [schools, setSchools] = useState<any[]>([]);
  const [errorText, setErrorText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const initialResetRef = useRef(false);
  const initialRecoveryRef = useRef(false);

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
    
    // Check URL hash/params for password recovery redirect or signup/invite
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const search = window.location.search;
      
      const isRecovery = 
        hash.includes('type=recovery') || 
        search.includes('type=recovery') || 
        search.includes('reset=true');
        
      const isReset = 
        isRecovery ||
        hash.includes('type=signup') || 
        hash.includes('type=invite') || 
        hash.includes('access_token=') ||
        search.includes('type=signup') || 
        search.includes('type=invite');

      if (isRecovery) {
        initialRecoveryRef.current = true;
        setView('reset_password');
        setIsResettingPassword(true);
      } else if (isReset) {
        initialResetRef.current = true;
      }
    }
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    }).catch(err => {
      console.warn("Could not fetch session (database might be unreachable):", err);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setView('reset_password');
        setIsResettingPassword(true);
        initialRecoveryRef.current = true;
        initialResetRef.current = true;
      } else if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, passwordAlreadyUpdated: boolean = false) => {
    if (!supabase) return;
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileError) throw profileError;
      
      if (profile) {
        // Determine if we should show the password reset screen based on URL refs captured on mount
        const hasRecoveryMarker = initialRecoveryRef.current;
        const hasResetMarker = initialResetRef.current;

        if (!passwordAlreadyUpdated) {
          // Determine if they are non-self-registering (invited by admin)
          const isInvitedRole = profile.role === 'teacher' || profile.role === 'school_admin' || profile.role === 'super_admin';
          
          // Show password reset if it's a recovery link, OR if it's an invite link for a teacher/admin.
          // Learners and parents self-register, so they don't need to reset password after email confirmation.
          if (hasRecoveryMarker || (hasResetMarker && isInvitedRole)) {
            setView('reset_password');
            setIsResettingPassword(true);
            return; // Halt further routing so they can set their password
          }
        }

        // If they are a teacher, school admin, or super admin, direct to /dashboard
        if (profile.role !== 'learner') {
          // Add a small delay to ensure Supabase has finished persisting the session to localStorage
        setTimeout(() => {
            router.push('/dashboard');
          }, 500);
          return;
        }

        // If missing critical school_id or grade, prompt to complete profile (only for learners)
        if (profile.role === 'learner' && (!profile.school_id || !profile.grade)) {
          if (session?.user) {
            setSessionUser(session.user);
            setFirstName(profile.first_name || session.user.user_metadata?.first_name || session.user.user_metadata?.full_name?.split(' ')[0] || '');
            setLastName(profile.last_name || session.user.user_metadata?.last_name || session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '');
          }
          setView('complete_profile');
          return;
        }

        // Check for enrollment approval
        if (profile.role === 'learner' && profile.enrollment_status === 'pending') {
          setIsPendingApproval(true);
          await supabase.auth.signOut();
          return;
        }
        setIsPendingApproval(false);

        let actualGrade = profile.grade || 'R';
        
        // Fetch from students_classes table to get class as fallback if needed, but we now use profile.grade
        const { data: scData } = await supabase
          .from('students_classes')
          .select('*, classes(grade)')
          .eq('student_id', userId)
          .maybeSingle();
          
        if (scData && scData.classes && scData.classes.grade) {
          actualGrade = scData.classes.grade;
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
          name: profile.full_name || profile.first_name || 'Learner',
          grade: actualGrade as any,
          avatar: '🦁',
          pin: '',
          progress: merged,
          role: profile.role as 'teacher' | 'admin' | 'learner' || 'learner',
          school_id: profile.school_id
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      // Fallback for social sign-ins: if profile doesn't exist, let them create it!
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const meta = session.user.user_metadata || {};
            const role = (meta.role || 'learner').toLowerCase();
            if (role !== 'learner') {
              // Non-learners should go straight to /dashboard to let it self-heal
              setTimeout(() => {
                router.push('/dashboard');
              }, 500);
              return;
            }
            setSessionUser(session.user);
            setFirstName(meta.first_name || meta.full_name?.split(' ')[0] || '');
            setLastName(meta.last_name || meta.full_name?.split(' ').slice(1).join(' ') || '');
            setView('complete_profile');
          }
        } catch (e) {
          console.error('Could not fetch fallback session:', e);
        }
      }
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
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
          data: {
            first_name: firstName,
            last_name: lastName,
            school_id: selectedSchool,
            grade: selectedGrade,
            role: 'learner',
            parent_name: parentName,
            parent_email: parentEmail,
            parent_phone: parentPhone,
            parent_relationship: parentRelationship
          }
        }
      });

      if (error) throw error;
      
      if (data.user) {
        setIsPendingApproval(true);
        await supabase.auth.signOut();
      }
    } catch (err: any) {
      let errMsg = err.message || '';
      if (errMsg === '{}' || err.name === 'AuthRetryableFetchError' || (typeof errMsg === 'string' && errMsg.includes('confirmation email'))) {
        setErrorText('Failed to send registration confirmation email. Since you want to keep email confirmation enabled, please configure a custom SMTP provider (such as Resend, SendGrid, or Mailgun) in your Supabase Dashboard under Authentication -> Providers -> SMTP. (Otherwise, you can temporarily disable "Confirm email" under Authentication -> Providers -> Email during development).');
      } else if (errMsg === 'Failed to fetch') {
        setErrorText('Failed to connect to the database. Please check your Supabase configuration.');
      } else if (errMsg && errMsg.toLowerCase().includes('rate limit')) {
        setErrorText('Email rate limit exceeded. Please try logging in if you already created an account.');
      } else {
        setErrorText(errMsg || 'Failed to register');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'yahoo') => {
    setErrorText('');
    setIsLoading(true);

    if (!supabase) {
      setErrorText('Supabase is not configured.');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setErrorText(err.message || `Failed to sign in with ${provider}`);
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setSuccessText('');
    setIsLoading(true);

    if (!supabase) {
      setErrorText('Supabase is not configured.');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/`,
      });

      if (error) throw error;
      setSuccessText('Password setup link sent successfully! Please check your email inbox.');
    } catch (err: any) {
      setErrorText(err.message || 'Failed to send password setup link.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setSuccessText('');

    if (newPassword !== confirmPassword) {
      setErrorText('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    if (!supabase) {
      setErrorText('Supabase is not configured.');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setSuccessText('Password updated successfully! Redirecting you now...');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setTimeout(() => {
          setIsResettingPassword(false);
          fetchProfile(session.user.id, true);
        }, 1500);
      } else {
        setTimeout(() => {
          setIsResettingPassword(false);
          setView('login');
        }, 1500);
      }
    } catch (err: any) {
      setErrorText(err.message || 'Failed to update your password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!selectedSchool) {
      setErrorText('Please select your school.');
      return;
    }

    if (!selectedGrade) {
      setErrorText('Please select your grade level.');
      return;
    }

    setIsLoading(true);

    if (!supabase || !sessionUser) {
      setErrorText('System is not ready.');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: sessionUser.id,
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim(),
          school_id: selectedSchool,
          grade: selectedGrade,
          role: 'learner',
          enrollment_status: 'pending',
          parent_name: parentName,
          parent_email: parentEmail,
          parent_phone: parentPhone,
          parent_relationship: parentRelationship
        });

      if (error) {
        if (error.message && (error.message.includes('column') || error.message.includes('parent_'))) {
          console.warn("Attempting fallback profile completion without parent details columns...", error);
          const { error: fallbackError } = await supabase
            .from('profiles')
            .upsert({
              id: sessionUser.id,
              first_name: firstName,
              last_name: lastName,
              full_name: `${firstName} ${lastName}`.trim(),
              school_id: selectedSchool,
              grade: selectedGrade,
              role: 'learner',
              enrollment_status: 'pending'
            });
          if (fallbackError) throw fallbackError;
        } else {
          throw error;
        }
      }

      setIsPendingApproval(true);
      await supabase.auth.signOut();
    } catch (err: any) {
      setErrorText(err.message || 'Failed to complete profile configuration.');
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
            className="px-6 py-3 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition"
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
        
        {view === 'register' ? (
          <FamilyRegistrationForm 
            key="register"
            schools={schools} 
            onComplete={() => {
              setView('login');
              setSuccessText('Family registered successfully! Please check your emails to verify your accounts before logging in.');
            }}
            onCancel={() => {
              setView('login');
              setErrorText('');
              setSuccessText('');
            }}
          />
        ) : (
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl space-y-6 text-center"
        >
          <div className="space-y-3">
            <div className="inline-flex p-3.5 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600 shadow-xs">
              <svg 
                id="Layer_2" 
                data-name="Layer 2" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 215.64 252.18" 
                className="w-8 h-8 fill-current"
              >
                <g id="Layer_3" data-name="Layer 3">
                  <path d="M89.42,252.13c0-7.59,0-14.8,0-22.01,0-3.62-.11-7.24.05-10.85.11-2.4-.54-3.29-3.16-3.42-42.86-2.08-77.38-32.54-84.94-74.8C-7.65,90.63,29.06,41.73,79.96,36.36c2.69-.28,5.39-.53,8.66-.85,0-1.16.01-2.34,0-3.53-.12-9.27-.1-18.55-.45-27.81C88.04.75,89.28-.06,92.43,0c14.69.29,28.65,3.87,42.11,9.44,21.6,8.94,40.87,21.32,56.04,39.43,5.12,6.11,9.29,12.81,11.48,20.59,1.02,3.63.78,3.97-2.87,4.04-11.08.2-22.16.47-33.24.47-1.51,0-3.53-.94-4.45-2.12-17.04-21.75-39.37-33.36-66.84-35.28-5.26-.37-5.23-.36-5.11,4.98.2,8.7.18,17.42.55,26.11.14,3.29-.72,4.42-4.16,4.75-35.42,3.48-59.48,41.42-47.5,74.68,6.88,19.1,25.25,32.04,45.59,32.12,1.91,0,3.83,0,6.2,0,.07,1.19.2,2.37.2,3.55-.05,9.72-.06,19.45-.25,29.17-.05,2.47.56,3.37,3.19,3.31,39.38-.98,75.24-30.33,83.76-68.69.16-.74.17-1.51.26-2.46h-87.39c-.09-.73-.23-1.37-.23-2.02.02-10.06.11-20.13.04-30.19-.02-2.35.73-3.11,3.1-3.13,39.35-.28,78.7-.61,118.04-1.05,2.82-.03,3.38,1.18,3.66,3.48,7.11,58.52-23.08,110.2-77.85,131.53-13.37,5.21-27.23,8.25-41.51,9.39-1.78.14-3.58.02-5.83.02Z" />
                </g>
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {view === 'login' 
                ? 'Welcome Back' 
                : view === 'complete_profile' 
                ? 'Complete Profile' 
                : view === 'forgot_password'
                ? 'Set Up or Reset Password'
                : view === 'reset_password'
                ? 'Choose Your Password'
                : 'Create an Account'}
            </h1>
            <p className="text-slate-500 text-sm">
              {view === 'login' 
                ? 'Sign in to continue learning' 
                : view === 'complete_profile' 
                ? 'Please configure your school and grade level' 
                : view === 'forgot_password'
                ? 'Enter your email to receive a password setup link'
                : view === 'reset_password'
                ? 'Enter your new password to complete account setup'
                : 'Sign up to start your journey'}
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
            {successText && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs font-bold"
              >
                ✅ {successText}
              </motion.div>
            )}
          </AnimatePresence>

          <form 
            onSubmit={
              view === 'login' 
                ? handleLogin 
                : view === 'complete_profile' 
                ? handleCompleteProfile 
                : view === 'forgot_password'
                ? handleForgotPassword
                : view === 'reset_password'
                ? handleResetPassword
                : undefined
            } 
            className="space-y-4 text-left"
          >
            {(view === 'complete_profile') && (
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

                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h3 className="text-xs font-extrabold text-indigo-700 uppercase tracking-wider">Parent / Guardian Details</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Parent Full Name</label>
                      <input
                        type="text"
                        required
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
                        placeholder="Mary Smith"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Relationship</label>
                      <select
                        required
                        value={parentRelationship}
                        onChange={(e) => setParentRelationship(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">-- Select --</option>
                        <option value="Mother">Mother</option>
                        <option value="Father">Father</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Parent Email</label>
                      <input
                        type="email"
                        required
                        value={parentEmail}
                        onChange={(e) => setParentEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
                        placeholder="parent@example.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Parent Phone</label>
                      <input
                        type="tel"
                        required
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
                        placeholder="+27 82 123 4567"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {view !== 'complete_profile' && view !== 'forgot_password' && view !== 'reset_password' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setView('forgot_password');
                        setErrorText('');
                        setSuccessText('');
                      }}
                      className="text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-800 transition"
                    >
                      Setup / Forgot Password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </>
            )}

            {view === 'forgot_password' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
                  placeholder="Enter your registered email address"
                />
              </div>
            )}

            {view === 'reset_password' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
                    placeholder="Minimum 6 characters"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
                    placeholder="Repeat your new password"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black text-sm rounded-xl transition flex items-center justify-center gap-2"
            >
              {isLoading 
                ? 'Please wait...' 
                : view === 'login' 
                ? 'Log In' 
                : view === 'complete_profile' 
                ? 'Complete Registration' 
                : view === 'forgot_password'
                ? 'Send Password Setup Link'
                : view === 'reset_password'
                ? 'Update Password & Log In'
                : 'Submit'
              }
              {view === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </button>
          </form>

          {view !== 'complete_profile' && view !== 'forgot_password' && view !== 'reset_password' && (
            <>
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-black uppercase tracking-wider">Or continue with</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('google')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition font-bold text-xs text-slate-700 shadow-sm animate-none"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('yahoo')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition font-bold text-xs text-slate-700 shadow-sm animate-none"
                >
                  <svg className="w-4 h-4 text-[#6001d2]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.44 12.87L17.7 3H14.1l-3.32 6.64L7.46 3H3.84l5.26 9.87v8.13h3.34v-8.13zM21 3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                  </svg>
                  Yahoo
                </button>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-slate-100">
            {view === 'complete_profile' ? (
              <button
                type="button"
                onClick={async () => {
                  if (supabase) await supabase.auth.signOut();
                  setView('login');
                  setErrorText('');
                  setSuccessText('');
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Cancel and Return to Login
              </button>
            ) : view === 'forgot_password' || view === 'reset_password' ? (
              <button
                type="button"
                onClick={() => {
                  setView('login');
                  setErrorText('');
                  setSuccessText('');
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Return to Login
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setView('register');
                  setErrorText('');
                  setSuccessText('');
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                {view === 'login' ? "New Parent? Register Your Family Here" : "Already have an account? Log in"}
              </button>
            )}
          </div>
        </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
