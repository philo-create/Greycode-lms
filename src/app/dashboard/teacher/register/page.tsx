'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { getTeacherData } from '@/lib/dashboard/teacherData';
import { supabase } from '@/lib/supabase';
import { saveStudentProgress } from '@/lib/db';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, Search, Calendar, ChevronLeft, ChevronRight, 
  CheckCircle2, XCircle, AlertCircle, LineChart, Download, 
  Save, Sparkles, Sliders, ArrowLeft, RefreshCw, UserCheck
} from 'lucide-react';
import { LoadingState } from '@/components/dashboard/LoadingState';

// Define attendance status type
type AttendanceStatus = 'present' | 'absent' | 'late' | 'unmarked';

interface AttendanceRecord {
  [studentId: string]: {
    status: AttendanceStatus;
    notes?: string;
  };
}

export default function ClassRegisterPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Class Register state
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Format YYYY-MM-DD in local timezone
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  });
  
  // Attendance records state loaded from/saved to cloud database
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Reload/load attendance from student profile progress when date or students change
  useEffect(() => {
    if (!data?.students) return;
    
    const initial: AttendanceRecord = {};
    data.students.forEach((student: any) => {
      let prog = student.progress || {};
      if (typeof prog === 'string') {
        try {
          prog = JSON.parse(prog);
        } catch (e) {
          prog = {};
        }
      }
      const studentAttendance = prog.attendance || {};
      const recordForDate = studentAttendance[selectedDate] || 'unmarked';
      initial[student.id] = { status: recordForDate };
    });
    setAttendance(initial);
  }, [selectedDate, data?.students]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }

      const teacherData = await getTeacherData(session.user.id);
      setData(teacherData);
    } catch (err: any) {
      setError('Failed to load class register data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const initializeUnmarkedAttendance = () => {
    if (!data?.students) return;
    const initial: AttendanceRecord = {};
    data.students.forEach((student: any) => {
      initial[student.id] = { status: 'unmarked' };
    });
    setAttendance(initial);
  };

  // Switch to previous or next day
  const changeDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    const offset = current.getTimezoneOffset();
    const localDate = new Date(current.getTime() - (offset * 60 * 1000));
    setSelectedDate(localDate.toISOString().split('T')[0]);
  };

  // Toggle/set attendance for a student
  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  // Set all students to a specific status at once (e.g., mark all present)
  const markAllStatus = (status: AttendanceStatus) => {
    if (!filteredStudents || filteredStudents.length === 0) return;
    setAttendance(prev => {
      const updated = { ...prev };
      filteredStudents.forEach(student => {
        updated[student.id] = { ...updated[student.id], status };
      });
      return updated;
    });
  };

  // Save attendance register directly to the cloud database!
  const saveAttendance = async () => {
    if (!filteredStudents || filteredStudents.length === 0) return;
    setIsSaving(true);
    setError('');
    
    try {
      const updatedStudents = [...data.students];
      
      for (const student of filteredStudents) {
        const currentRecord = attendance[student.id];
        const status = currentRecord?.status || 'unmarked';
        
        let prog = student.progress || {};
        if (typeof prog === 'string') {
          try {
            prog = JSON.parse(prog);
          } catch (e) {
            prog = {};
          }
        }
        
        const attendanceObj = { ...(prog.attendance || {}) };
        attendanceObj[selectedDate] = status;
        
        const updatedProgress = {
          ...prog,
          attendance: attendanceObj
        };
        
        // Update database for student
        await saveStudentProgress(student.id, updatedProgress);
        
        // Update local memory state
        const idx = updatedStudents.findIndex(s => s.id === student.id);
        if (idx !== -1) {
          updatedStudents[idx] = {
            ...updatedStudents[idx],
            progress: updatedProgress
          };
        }
      }
      
      // Update local state with the newly updated students
      setData((prev: any) => ({
        ...prev,
        students: updatedStudents
      }));
      
      setSuccessMsg('Attendance register successfully saved to the cloud database!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Error saving attendance register:', err);
      setError('Failed to save attendance register to the database. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Export current register as simulated CSV
  const handleExport = () => {
    if (!filteredStudents || filteredStudents.length === 0) return;
    
    const headers = 'Student ID,Student Name,Grade,Date,Status\n';
    const rows = filteredStudents.map(student => {
      const record = attendance[student.id];
      const status = record?.status ? record.status.toUpperCase() : 'UNMARKED';
      const name = `"${student.first_name} ${student.last_name}"`;
      return `${student.id},${name},Grade ${student.grade || 'N/A'},${selectedDate},${status}`;
    }).join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `Class_Register_${selectedDate}_Class_${selectedClassId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <LoadingState />;

  if (error || !data) {
    return (
      <DashboardLayout role="teacher">
        <div className="p-8 text-center">
          <div className="inline-flex p-3 bg-red-100 text-red-600 rounded-full mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Error</h2>
          <p className="text-slate-600 mb-4">{error || 'Could not load class register information.'}</p>
          <button 
            onClick={loadData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Get active class details
  const selectedClass = data.classes?.find((cls: any) => cls.id === selectedClassId);

  // Filter students by selected class/grade & search query
  const filteredStudents = data.students?.filter((student: any) => {
    // Filter by class/grade
    if (selectedClassId !== 'all') {
      if (!selectedClass || student.grade !== selectedClass.grade) {
        return false;
      }
    }
    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
      if (!fullName.includes(q)) {
        return false;
      }
    }
    return true;
  }) || [];

  // Calculate attendance percentages for active selection
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let unmarkedCount = 0;

  filteredStudents.forEach((student: any) => {
    const record = attendance[student.id];
    if (!record || record.status === 'unmarked') {
      unmarkedCount++;
    } else if (record.status === 'present') {
      presentCount++;
    } else if (record.status === 'absent') {
      absentCount++;
    } else if (record.status === 'late') {
      lateCount++;
    }
  });

  const totalFiltered = filteredStudents.length;
  const attendanceRate = totalFiltered > 0 && (presentCount + lateCount + absentCount) > 0
    ? Math.round(((presentCount + lateCount) / (presentCount + lateCount + absentCount)) * 100)
    : 0;

  return (
    <DashboardLayout role="teacher">
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Back Link & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link 
              href="/dashboard/teacher" 
              className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Dashboard
            </Link>
            <h1 id="class-register-header" className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <UserCheck className="w-8 h-8 text-indigo-600" />
              Class Register
            </h1>
            <p className="text-slate-500 mt-1.5 text-sm font-medium">
              Take daily attendance registers and manage multi-grade class records easily.
            </p>
          </div>

          {/* Quick Actions / Date Navigation */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Inline Date Switcher */}
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm p-1">
              <button 
                onClick={() => changeDate(-1)}
                className="p-1.5 hover:bg-slate-50 rounded-xl transition-colors text-slate-500 hover:text-slate-800"
                title="Previous Day"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 px-3 font-semibold text-slate-700 text-sm">
                <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                <input 
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent border-none focus:outline-none focus:ring-0 font-bold text-slate-700 text-xs sm:text-sm cursor-pointer"
                />
              </div>
              <button 
                onClick={() => changeDate(1)}
                className="p-1.5 hover:bg-slate-50 rounded-xl transition-colors text-slate-500 hover:text-slate-800"
                title="Next Day"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={loadData}
              className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-indigo-600 rounded-2xl shadow-sm transition-all"
              title="Refresh register data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Class/Grade Selector - Especially vital for teachers teaching multiple grades! */}
        <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Select Class:</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedClassId('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedClassId === 'all'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Classes ({data.classes?.length || 0})
              </button>
              {data.classes?.map((cls: any) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedClassId === cls.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cls.class_name || `Grade ${cls.grade}`}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats Overlay */}
          <div className="text-xs text-slate-500 font-bold">
            Showing <span className="text-indigo-600 font-extrabold">{totalFiltered}</span> students of{' '}
            <span className="text-slate-700 font-extrabold">{data.students?.length || 0}</span> total
          </div>
        </div>

        {/* Status Indicators / KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Present</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-800">{presentCount}</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                {totalFiltered > 0 ? Math.round((presentCount / totalFiltered) * 100) : 0}%
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                style={{ width: `${totalFiltered > 0 ? (presentCount / totalFiltered) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Late Arrivals</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-800">{lateCount}</span>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                {totalFiltered > 0 ? Math.round((lateCount / totalFiltered) * 100) : 0}%
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                style={{ width: `${totalFiltered > 0 ? (lateCount / totalFiltered) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Absent</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-800">{absentCount}</span>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                {totalFiltered > 0 ? Math.round((absentCount / totalFiltered) * 100) : 0}%
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                style={{ width: `${totalFiltered > 0 ? (absentCount / totalFiltered) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Completion Rate</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-800">{attendanceRate}%</span>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                Attendance
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                style={{ width: `${attendanceRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Success/Error Alerts */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 font-semibold text-sm animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Content Area - Search & Register Table */}
        <DashboardCard 
          title={`Register List: ${selectedClassId === 'all' ? 'All My Classes' : selectedClass?.class_name || `Grade ${selectedClass?.grade} Class`}`}
          action={
            <div className="flex items-center gap-2 flex-wrap">
              {/* Mark all buttons */}
              <button 
                onClick={() => markAllStatus('present')}
                disabled={totalFiltered === 0}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-xs rounded-xl transition border border-emerald-100 disabled:opacity-50"
              >
                Mark All Present
              </button>
              <button 
                onClick={() => markAllStatus('unmarked')}
                disabled={totalFiltered === 0}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-extrabold text-xs rounded-xl transition border border-slate-200/80 disabled:opacity-50"
              >
                Reset All Status
              </button>
            </div>
          }
        >
          {/* Table Toolbar */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
              <input
                type="text"
                placeholder="Search students by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 text-slate-800 shadow-xs"
              />
            </div>

            {/* Export and Save Toolbar Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                disabled={totalFiltered === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4 text-slate-500" />
                Export CSV
              </button>
              <button
                onClick={saveAttendance}
                disabled={isSaving || totalFiltered === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition shadow-md shadow-indigo-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? 'Saving...' : 'Save Register'}
              </button>
            </div>
          </div>

          {/* Table Grid */}
          {filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-bold">Student Name</th>
                    <th className="px-6 py-4 font-bold">Grade</th>
                    <th className="px-6 py-4 font-bold text-center">Stars Earned</th>
                    <th className="px-6 py-4 font-bold text-center">Attendance Register</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student: any) => {
                    const record = attendance[student.id] || { status: 'unmarked' };
                    
                    // Decode total stars from JSON progress column if necessary
                    let totalStars = 0;
                    if (student.progress) {
                      try {
                        const progressObj = typeof student.progress === 'string' 
                          ? JSON.parse(student.progress) 
                          : student.progress;
                        totalStars = progressObj?.totalStars || 0;
                      } catch (e) {
                        totalStars = 0;
                      }
                    }

                    return (
                      <tr 
                        key={student.id} 
                        className={`hover:bg-slate-50/40 transition-colors ${
                          record.status === 'absent' ? 'bg-rose-50/10' : ''
                        }`}
                      >
                        {/* Name & Avatar */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center font-black text-sm uppercase ring-2 ring-slate-200/50">
                              {student.first_name?.[0] || 'S'}{student.last_name?.[0] || ''}
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-800 block">
                                {student.first_name} {student.last_name}
                              </span>
                              <span className="text-[11px] font-bold text-slate-400">
                                Joined {new Date(student.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Grade */}
                        <td className="px-6 py-4 font-semibold text-slate-600">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                            Grade {student.grade || 'N/A'}
                          </span>
                        </td>

                        {/* Stars */}
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl text-amber-700 font-bold border border-amber-100">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                            <span className="text-xs">{totalStars} Stars</span>
                          </div>
                        </td>

                        {/* Attendance Toggle Buttons */}
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <div className="inline-flex p-1 bg-slate-100 rounded-2xl gap-1">
                              <button
                                onClick={() => setStudentStatus(student.id, 'present')}
                                className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1 ${
                                  record.status === 'present'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <CheckCircle2 className={`w-3.5 h-3.5 ${record.status === 'present' ? 'text-white' : 'text-emerald-500'}`} />
                                Present
                              </button>
                              
                              <button
                                onClick={() => setStudentStatus(student.id, 'late')}
                                className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1 ${
                                  record.status === 'late'
                                    ? 'bg-amber-500 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <AlertCircle className={`w-3.5 h-3.5 ${record.status === 'late' ? 'text-white' : 'text-amber-500'}`} />
                                Late
                              </button>

                              <button
                                onClick={() => setStudentStatus(student.id, 'absent')}
                                className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1 ${
                                  record.status === 'absent'
                                    ? 'bg-rose-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <XCircle className={`w-3.5 h-3.5 ${record.status === 'absent' ? 'text-white' : 'text-rose-500'}`} />
                                Absent
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Detail actions */}
                        <td className="px-6 py-4 text-right">
                          <Link 
                            href={`/dashboard/teacher/student/${student.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-xl transition-all font-bold text-xs"
                            title="Student Analytics"
                          >
                            <LineChart className="w-4 h-4" />
                            Analytics
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12">
              <EmptyState 
                title="No Students Found" 
                description={
                  searchQuery.trim()
                    ? `No students in this class match "${searchQuery}".`
                    : "No students are registered in your class register for this grade selection yet."
                }
                icon={<Users className="h-12 w-12 text-slate-300" />}
              />
            </div>
          )}
        </DashboardCard>

        {/* Footer Notes on Persistence */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 font-medium leading-normal">
            <strong>Register Data Persistence:</strong> Active attendance rosters are logged directly to local secure session storage keyed by class date. This register allows multi-grade teachers to take attendance separately across all taught grades and generate clean daily attendance reports anytime.
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
}
