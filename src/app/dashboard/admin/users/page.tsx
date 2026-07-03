'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Users, UserPlus, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
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

      // Fetch users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (profilesError) {
        console.error('Supabase query error in AdminUsersPage:', profilesError);
        return;
      }
      
      if (profiles) {
        // Map schools to users
        const mappedUsers = profiles.map(user => {
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
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('You are not authenticated. Please log in again.');
      }

      const response = await fetch('/api/admin/users/delete', {
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
            <table className="w-full text-left border-collapse">
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
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {user.role === 'teacher' ? (
                        <div className="flex flex-wrap gap-1 max-w-[200px]" id={`teacher-grades-${user.id}`}>
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
                                  // Sort them naturally so they display in order
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
                      ) : (
                        <select
                          value={user.grade || ''}
                          onChange={(e) => handleGradeChange(user.id, e.target.value)}
                          disabled={updatingId === user.id}
                          className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded text-xs font-medium border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-colors"
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
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {user.parent_name ? (
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-700">{user.parent_name} <span className="font-normal text-slate-400">({user.parent_relationship || 'Parent'})</span></div>
                          <div className="text-[10px] text-slate-500">{user.parent_email}</div>
                          <div className="text-[10px] text-slate-500">{user.parent_phone}</div>
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
                          <span className={`px-2 py-1 rounded text-xs font-semibold capitalize whitespace-nowrap ${
                            displayStatus === 'pending' ? 'bg-amber-100 text-amber-700' :
                            displayStatus === 'unconfirmed' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                            displayStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-rose-100 text-rose-700'
                          }`}>
                            {displayStatus === 'unconfirmed' ? 'Pending Confirmation' : displayStatus}
                          </span>
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
    </DashboardLayout>
  );
}
