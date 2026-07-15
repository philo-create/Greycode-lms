
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Users, UserPlus, CheckCircle, XCircle, Trash2, Key, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminUsersPage() {
  return (
    <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
    }>
      <AdminUsersPageContent />
    </Suspense>
  );
}

function AdminUsersPageContent() {
  const [users, setUsers] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Custom states for manual confirmation and password reset
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');

  const getProfileSubjects = (user: any): string[] => {
    if (!user) return [];
    if (user.subjects && typeof user.subjects === 'string') {
      return user.subjects.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    const progressObj = typeof user.progress === 'string' ? JSON.parse(user.progress) : user.progress;
    if (progressObj && progressObj.subjects && Array.isArray(progressObj.subjects)) {
      return progressObj.subjects;
    }
    if (progressObj && typeof progressObj.subjects === 'string') {
      return progressObj.subjects.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    return ['Coding and Robotics'];
  };

  const getProfileClassName = (user: any): string => {
    if (!user) return '';
    if (user.class_name && typeof user.class_name === 'string') {
      return user.class_name.trim();
    }
    const progressObj = typeof user.progress === 'string' ? JSON.parse(user.progress) : user.progress;
    if (progressObj && progressObj.class_name && typeof progressObj.class_name === 'string') {
      return progressObj.class_name.trim();
    }
    return '';
  };

  const handleSubjectsChange = async (userId: string, subjects: string[]) => {
    if (!supabase) return;
    setUpdatingId(userId);
    try {
      const subjectsStr = subjects.join(',');
      
      const { error } = await supabase
        .from('profiles')
        .update({ subjects: subjectsStr })
        .eq('id', userId);
        
      if (error) {
        console.warn('Direct column update failed, retrying via progress JSON...', error);
        
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('progress')
          .eq('id', userId)
          .single();
          
        let currentProgress = userProfile?.progress || {};
        if (typeof currentProgress === 'string') {
          try { currentProgress = JSON.parse(currentProgress); } catch(e) { currentProgress = {}; }
        }
        
        const updatedProgress = {
          ...currentProgress,
          subjects: subjects
        };
        
        await supabase
          .from('profiles')
          .update({ progress: updatedProgress })
          .eq('id', userId);
      }
      
      setUsers(prev => prev.map(user => {
        if (user.id === userId) {
          let updatedProgress = user.progress || {};
          if (typeof updatedProgress === 'string') {
            try { updatedProgress = JSON.parse(updatedProgress); } catch(e) { updatedProgress = {}; }
          }
          return {
            ...user,
            subjects: subjectsStr,
            progress: {
              ...updatedProgress,
              subjects: subjects
            }
          };
        }
        return user;
      }));
    } catch (err) {
      console.error('Failed to update subjects:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClassNameChange = async (userId: string, className: string) => {
    if (!supabase) return;
    setUpdatingId(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ class_name: className })
        .eq('id', userId);
        
      if (error) {
        console.warn('Direct column update failed, retrying via progress JSON...', error);
        
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('progress')
          .eq('id', userId)
          .single();
          
        let currentProgress = userProfile?.progress || {};
        if (typeof currentProgress === 'string') {
          try { currentProgress = JSON.parse(currentProgress); } catch(e) { currentProgress = {}; }
        }
        
        const updatedProgress = {
          ...currentProgress,
          class_name: className
        };
        
        await supabase
          .from('profiles')
          .update({ progress: updatedProgress })
          .eq('id', userId);
      }
      
      setUsers(prev => prev.map(user => {
        if (user.id === userId) {
          let updatedProgress = user.progress || {};
          if (typeof updatedProgress === 'string') {
            try { updatedProgress = JSON.parse(updatedProgress); } catch(e) { updatedProgress = {}; }
          }
          return {
            ...user,
            class_name: className,
            progress: {
              ...updatedProgress,
              class_name: className
            }
          };
        }
        return user;
      }));
    } catch (err) {
      console.error('Failed to update class name:', err);
    } finally {
      setUpdatingId(null);
    }
  };
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          setCurrentUser(user);
        } catch (err) {
          console.warn('Could not get current authenticated user:', err);
        }
      }
      await Promise.all([fetchSchools(), fetchUsers()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const fetchSchools = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .order('name');
      if (error) throw error;
      if (data) setSchools(data);
    } catch (err) {
      console.error('Failed to load schools:', err);
    }
  };

  const fetchUsers = async () => {
    if (!supabase) return;
    try {
      // Fetch latest schools to build an up-to-date map
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name');
      
      const schoolsMap = new Map<string, { id: string, name: string }>();
      if (!schoolsError && schoolsData) {
        schoolsData.forEach(s => schoolsMap.set(s.id, s));
        setSchools(schoolsData);
      }

      let profiles: any[] = [];
      let loadedFromApi = false;

      // Try loading from our admin users endpoint which has auto-sync of email confirmation status
      try {
        await supabase.auth.getUser().catch(() => {});
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (token) {
          const response = await fetch('/api/platform/profiles', { cache: 'no-store',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            if (data && Array.isArray(data.profiles)) {
              profiles = data.profiles;
              loadedFromApi = true;
              console.log('Successfully loaded and synchronized users from server API', data.debug);
              if (data.debug && data.debug.mode === 'user') {
                setApiError('Warning: Supabase Service Role Key is missing or invalid in environment variables. Email confirmation status may be inaccurate.');
              }
            }
          } else {
            const errData = await response.json();
            console.error('Admin API fetch failed with status:', response.status, errData);
          }
        }
      } catch (apiErr) {
        console.warn('Could not sync/fetch users via admin API, falling back to direct query:', apiErr);
      }

      // Fallback: Direct query if api fetch wasn't successful
      if (!loadedFromApi) {
        const { data: directProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (profilesError) {
          console.error('Supabase query error in AdminUsersPage fallback:', profilesError);
          return;
        }
        if (directProfiles) {
          profiles = directProfiles;
        }
      }
      
      if (profiles) {
        // Map schools to users
        const mappedUsers = profiles
          .filter(user => user.role !== 'super_admin')
          .map(user => {
          const matchedSchool = user.school_id ? schoolsMap.get(user.school_id) : null;
          return {
            ...user,
            schools: matchedSchool ? { id: matchedSchool.id, name: matchedSchool.name } : null,
            school: matchedSchool ? { id: matchedSchool.id, name: matchedSchool.name } : null
          };
        });
        setUsers(mappedUsers);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    if (!supabase) return;
    setUpdatingId(userId);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ enrollment_status: newStatus })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      await fetchUsers();
    } catch (err: any) {
      console.error('Failed to update status:', err);
      let msg = 'Unknown error';
      if (err?.message) msg = err.message;
      else if (err?.details) msg = err.details;
      else if (typeof err === 'object') msg = JSON.stringify(err);
      else if (typeof err === 'string') msg = err;
      
      alert(`Failed to update status: ${msg}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!supabase) return;
    if (!confirm(`Are you sure you want to permanently delete user "${userName}"? This will remove their profile and enrollment.`)) {
      return;
    }
    setUpdatingId(userId);
    try {
      await supabase.auth.getUser().catch(() => {});
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('You are not authenticated. Please log in again.');
      }

      const response = await fetch('/api/platform/profiles/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }
      
      // Update local state
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      alert(`Failed to delete user: ${err.message || 'Unknown error'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleForceConfirmEmail = async (userId: string) => {
    if (!supabase) return;
    setUpdatingId(userId);
    try {
      await supabase.auth.getUser().catch(() => {});
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        throw new Error('Not authenticated. Please log in again.');
      }

      const response = await fetch('/api/platform/profiles/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, emailConfirmed: true })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to confirm email');
      }

      // Update local state
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            email_confirmed: true
          };
        }
        return u;
      }));
    } catch (err: any) {
      console.error('Failed to confirm email:', err);
      alert(`Failed to confirm email: ${err.message || 'Unknown error'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSetUserPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !selectedUserForPassword) return;
    if (newPassword.length < 6) {
      setPasswordErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordSuccessMsg('');
    setPasswordErrorMsg('');

    try {
      await supabase.auth.getUser().catch(() => {});
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        throw new Error('Not authenticated. Please log in again.');
      }

      const response = await fetch('/api/platform/profiles/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          userId: selectedUserForPassword.id, 
          password: newPassword, 
          emailConfirmed: true 
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update password');
      }

      setPasswordSuccessMsg(`Successfully set password for ${selectedUserForPassword.first_name || ''}!`);
      
      // Update local email confirmed state too
      setUsers(prev => prev.map(u => {
        if (u.id === selectedUserForPassword.id) {
          return {
            ...u,
            email_confirmed: true
          };
        }
        return u;
      }));

      setTimeout(() => {
        setSelectedUserForPassword(null);
        setNewPassword('');
        setPasswordSuccessMsg('');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to update password:', err);
      setPasswordErrorMsg(err.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!supabase) return;
    setUpdatingId(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
        
      if (error) throw error;
      
      // Update local state
      setUsers(prev => prev.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            role: newRole
          };
        }
        return user;
      }));
    } catch (err: any) {
      console.error('Failed to update role:', err);
      alert(`Failed to update role: ${err.message || 'Unknown error'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSchoolChange = async (userId: string, schoolId: string) => {
    if (!supabase) return;
    setUpdatingId(userId);
    try {
      const targetSchoolId = schoolId === '' ? null : schoolId;
      const { error } = await supabase
        .from('profiles')
        .update({ school_id: targetSchoolId })
        .eq('id', userId);
        
      if (error) throw error;
      
      // Update local state
      setUsers(prev => prev.map(user => {
        if (user.id === userId) {
          const matchedSchool = schools.find(s => s.id === targetSchoolId);
          return {
            ...user,
            school_id: targetSchoolId,
            schools: matchedSchool ? { id: matchedSchool.id, name: matchedSchool.name } : null
          };
        }
        return user;
      }));
    } catch (err) {
      console.error('Failed to update school:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleGradeChange = async (userId: string, grade: string) => {
    if (!supabase) return;
    setUpdatingId(userId);
    try {
      const targetGrade = grade === '' ? null : grade;
      const { error } = await supabase
        .from('profiles')
        .update({ grade: targetGrade })
        .eq('id', userId);
        
      if (error) throw error;
      
      // Update local state
      setUsers(prev => prev.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            grade: targetGrade
          };
        }
        return user;
      }));
    } catch (err) {
      console.error('Failed to update grade:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
        </div>
        <Link 
          href="/dashboard/admin/users/new"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </Link>
      </div>

      <DashboardCard title="All Users & Enrollments">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold text-sm text-slate-600">Name</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-600">Role</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-600">School</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-600">Grade</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-600">Parent / Contact</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-600">Status</th>
                  <th className="py-3 px-4 font-semibold text-sm text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{user.first_name} {user.last_name}</div>
                      {user.email && (
                        <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={user.role || 'learner'}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={updatingId === user.id}
                        className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded text-xs font-semibold capitalize border border-transparent focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-colors"
                      >
                        <option value="learner">Learner</option>
                        <option value="teacher">Teacher</option>
                        <option value="school_admin">School Admin</option>
                        <option value="facilitator">Facilitator</option>
                        <option value="parent">Parent</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      <select
                        value={user.school_id || ''}
                        onChange={(e) => handleSchoolChange(user.id, e.target.value)}
                        disabled={updatingId === user.id}
                        className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded text-xs font-medium border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-colors max-w-[150px] truncate"
                      >
                        <option value="">No School</option>
                        {schools.map(school => (
                          <option key={school.id} value={school.id}>{school.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 min-w-[250px]">
                      {user.role === 'teacher' ? (
                        <div className="space-y-3">
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Grades</span>
                            <div className="flex flex-wrap gap-1" id={`teacher-grades-${user.id}`}>
                              {['R', '1', '2', '3', '4', '5', '6', '7'].map(g => {
                                const teacherGrades = user.grade ? user.grade.split(',') : [];
                                const isActive = teacherGrades.includes(g);
                                return (
                                  <button
                                    key={g}
                                    disabled={updatingId === user.id}
                                    onClick={async () => {
                                      let newGrades;
                                      if (isActive) {
                                        newGrades = teacherGrades.filter((x: string) => x !== g);
                                      } else {
                                        newGrades = [...teacherGrades, g];
                                      }
                                      const sortedGrades = ['R', '1', '2', '3', '4', '5', '6', '7'].filter(x => newGrades.includes(x));
                                      await handleGradeChange(user.id, sortedGrades.join(','));
                                    }}
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                                      isActive 
                                        ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500 scale-105' 
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                                    }`}
                                    title={`Toggle Grade ${g}`}
                                  >
                                    {g}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subjects Offered</span>
                            <div className="flex flex-wrap gap-1">
                              {['Coding and Robotics', 'Mathematics', 'Life Skills', 'Home Language', 'First Additional Language'].map(s => {
                                const userSubjs = getProfileSubjects(user);
                                const isSelected = userSubjs.includes(s);
                                return (
                                  <button
                                    key={s}
                                    disabled={updatingId === user.id}
                                    onClick={() => {
                                      const newSubjs = isSelected
                                        ? userSubjs.filter(x => x !== s)
                                        : [...userSubjs, s];
                                      handleSubjectsChange(user.id, newSubjs);
                                    }}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
                                      isSelected
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                    }`}
                                  >
                                    {s}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : user.role === 'learner' ? (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Grade</span>
                              <select
                                value={user.grade || ''}
                                onChange={(e) => handleGradeChange(user.id, e.target.value)}
                                disabled={updatingId === user.id}
                                className="w-full px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded text-xs font-medium border border-slate-200 focus:outline-none cursor-pointer transition-colors"
                              >
                                <option value="">No Grade</option>
                                <option value="R">Grade R</option>
                                <option value="1">Grade 1</option>
                                <option value="2">Grade 2</option>
                                <option value="3">Grade 3</option>
                                <option value="4">Grade 4</option>
                                <option value="5">Grade 5</option>
                                <option value="6">Grade 6</option>
                                <option value="7">Grade 7</option>
                              </select>
                            </div>
                            <div className="flex-1">
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Class</span>
                              <input
                                type="text"
                                placeholder="e.g. 3A"
                                value={getProfileClassName(user)}
                                onChange={(e) => handleClassNameChange(user.id, e.target.value)}
                                disabled={updatingId === user.id}
                                className="w-full px-2 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded text-xs font-medium border border-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                              />
                            </div>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subjects Enrolled</span>
                            <div className="flex flex-wrap gap-1">
                              {['Coding and Robotics', 'Mathematics', 'Life Skills', 'Home Language', 'First Additional Language'].map(s => {
                                const userSubjs = getProfileSubjects(user);
                                const isSelected = userSubjs.includes(s);
                                return (
                                  <button
                                    key={s}
                                    disabled={updatingId === user.id}
                                    onClick={() => {
                                      const newSubjs = isSelected
                                        ? userSubjs.filter(x => x !== s)
                                        : [...userSubjs, s];
                                      handleSubjectsChange(user.id, newSubjs);
                                    }}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
                                      isSelected
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                    }`}
                                  >
                                    {s}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-400">-</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {user.parent_name ? (
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-700">{user.parent_name} <span className="font-normal text-slate-400">({user.parent_relationship || 'Parent'})</span></div>
                          <div className="text-[10px] text-slate-500">{user.parent_email}</div>
                          <div className="text-[10px] text-slate-500">{user.parent_phone}</div>
                        </div>
                      ) : user.email ? (
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-700">Account Email</div>
                          <div className="text-[10px] text-slate-500 font-mono select-all">{user.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {(() => {
                        const isLearner = user.role === 'learner';
                        const isConfirmed = user.email_confirmed === true;
                        
                        let displayStatus = user.enrollment_status || (isLearner ? 'pending' : 'approved');
                        if (!isLearner && !isConfirmed && displayStatus === 'approved') {
                          displayStatus = 'unconfirmed';
                        }

                        return (
                          <div className="flex flex-col items-start gap-1">
                            <span className={`px-2 py-1 rounded text-xs font-semibold capitalize whitespace-nowrap ${
                              displayStatus === 'pending' ? 'bg-amber-100 text-amber-700' :
                              displayStatus === 'unconfirmed' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                              displayStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-rose-100 text-rose-700'
                            }`}>
                              {displayStatus === 'unconfirmed' ? 'Pending Email Verification' : displayStatus === 'pending' ? 'Pending Admin Verification' : displayStatus}
                            </span>
                            {displayStatus === 'unconfirmed' && (
                              <button
                                onClick={() => handleForceConfirmEmail(user.id)}
                                disabled={updatingId === user.id}
                                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer disabled:opacity-50 mt-0.5"
                                title="Click to manually confirm this user's email address"
                              >
                                {updatingId === user.id ? 'Confirming...' : 'Confirm Email'}
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end items-center space-x-2">
                        {(() => {
                          const userStatus = user.enrollment_status || 
                            ((user.role === 'learner') ? 'pending' : 'approved');
                          return userStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(user.id, 'approved')}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                title="Approve"
                                disabled={updatingId === user.id}
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(user.id, 'rejected')}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                title="Reject"
                                disabled={updatingId === user.id}
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </>
                          );
                        })()}

                        {/* Force Change Password Button */}
                        <button
                          onClick={() => {
                            setSelectedUserForPassword(user);
                            setNewPassword('');
                            setPasswordSuccessMsg('');
                            setPasswordErrorMsg('');
                          }}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                          title="Set / Reset User Password"
                          disabled={updatingId === user.id}
                        >
                          <Key className="w-5 h-5" />
                        </button>

                        {currentUser?.id !== user.id ? (
                          <button
                            onClick={() => handleDeleteUser(user.id, `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User')}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors disabled:opacity-50"
                            title="Delete / Remove User"
                            disabled={updatingId === user.id}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold select-none px-1.5 py-0.5 bg-slate-100 rounded">
                            You (Admin)
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>

      {/* Password Reset Modal */}
      {selectedUserForPassword && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-950 text-base">Set Password</h3>
                <p className="text-xs text-slate-500">
                  For {selectedUserForPassword.first_name} {selectedUserForPassword.last_name} ({selectedUserForPassword.role})
                </p>
              </div>
            </div>

            <form onSubmit={handleSetUserPassword} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                This will update the user's password directly and automatically confirm their email address, allowing them to log in immediately.
              </p>

              {passwordErrorMsg && (
                <div className="p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-xs font-bold">
                  ⚠️ {passwordErrorMsg}
                </div>
              )}

              {passwordSuccessMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs font-bold">
                  ✅ {passwordSuccessMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">New Password</label>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
                  placeholder="Min 6 characters"
                  disabled={isUpdatingPassword}
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForPassword(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                  disabled={isUpdatingPassword}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1"
                  disabled={isUpdatingPassword}
                >
                  {isUpdatingPassword ? 'Updating...' : 'Set Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
