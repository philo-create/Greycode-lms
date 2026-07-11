'use client';

import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  BookOpen, 
  Clock, 
  Tag, 
  Sparkles, 
  Filter, 
  Plus, 
  X, 
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  description?: string;
  due_date: string; // YYYY-MM-DD
  grade?: string;
  subject?: string;
}

interface SchoolActivity {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string;
  category: 'activity' | 'club' | 'exam' | 'reminder';
  color?: string;
}

interface DashboardCalendarProps {
  assignments?: Assignment[];
  role?: 'learner' | 'parent' | 'teacher' | 'facilitator' | 'school_admin' | 'super_admin';
}

function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DEFAULT_ACTIVITIES: SchoolActivity[] = [
  {
    id: 'act-1',
    title: '🚀 Robotics Championship Prep',
    description: 'Special mentorship workshop for the upcoming national robotics tournament.',
    date: getLocalDateString(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)), // 2 days from now
    time: '14:00 - 15:30',
    category: 'activity'
  },
  {
    id: 'act-2',
    title: '💻 Weekly Coding Club Meetup',
    description: 'Level up your scratch and python programming skills. Bring your own laptop!',
    date: (() => {
      // Find next Tuesday
      const d = new Date();
      d.setDate(d.getDate() + ((2 + 7 - d.getDay()) % 7 || 7));
      return getLocalDateString(d);
    })(),
    time: '15:00 - 16:00',
    category: 'club'
  },
  {
    id: 'act-3',
    title: '🎨 Digital Art Exhibition',
    description: 'Showcasing student-designed virtual animations and games in the auditorium.',
    date: getLocalDateString(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)), // 5 days from now
    time: '09:00 - 13:00',
    category: 'activity'
  },
  {
    id: 'act-4',
    title: '🧠 Parent-Teacher Meeting',
    description: 'Term review and digital literacy curriculum showcase with facilitators.',
    date: getLocalDateString(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)), // tomorrow
    time: '17:30 - 19:00',
    category: 'reminder'
  },
  {
    id: 'act-5',
    title: '📚 Robotics Lab Science Fair',
    description: 'Presenting active working electronics and physical computing projects.',
    date: getLocalDateString(new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)),
    time: '10:00 - 15:00',
    category: 'activity'
  },
  {
    id: 'act-6',
    title: 'Celebrate Coding Day! 🎉',
    description: 'Fun puzzles, trivia, and special snacks for coding champions.',
    date: getLocalDateString(new Date()), // Today
    time: 'All Day',
    category: 'activity'
  }
];

export function DashboardCalendar({ assignments = [], role = 'learner' }: DashboardCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [customEvents, setCustomEvents] = useState<SchoolActivity[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'assignment' | 'activity'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state for adding a custom activity
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDateStr, setNewDateStr] = useState(getLocalDateString(new Date()));
  const [newTime, setNewTime] = useState('14:00');
  const [newCategory, setNewCategory] = useState<'activity' | 'club' | 'exam' | 'reminder'>('activity');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const getSouthAfricanEvents = (year: number) => {
    const list: Array<{
      id: string;
      title: string;
      description: string;
      date: string; // YYYY-MM-DD
      time?: string;
      type: 'activity';
      category: 'activity' | 'reminder' | 'club' | 'exam';
    }> = [];

    // 1. South African Public Holidays
    let goodFriday = '';
    let familyDay = '';
    if (year === 2026) {
      goodFriday = '2026-04-03';
      familyDay = '2026-04-06';
    } else if (year === 2027) {
      goodFriday = '2027-03-26';
      familyDay = '2027-03-29';
    } else {
      goodFriday = `${year}-04-03`;
      familyDay = `${year}-04-06`;
    }

    const holidays = [
      { date: `${year}-01-01`, title: '🎉 New Year\'s Day 🇿🇦', desc: 'South African Public Holiday. Start of the new year!' },
      { date: `${year}-03-21`, title: '🕊️ Human Rights Day 🇿🇦', desc: 'South African Public Holiday honoring human rights.' },
      { date: goodFriday, title: '⛪ Good Friday 🇿🇦', desc: 'South African Public Holiday (Easter Weekend).' },
      { date: familyDay, title: '👨‍👩‍👧‍👦 Family Day 🇿🇦', desc: 'South African Public Holiday (Easter Monday).' },
      { date: `${year}-04-27`, title: '🗳️ Freedom Day 🇿🇦', desc: 'South African Public Holiday celebrating the first democratic elections in 1994.' },
      { date: `${year}-05-01`, title: '🛠️ Workers\' Day 🇿🇦', desc: 'South African Public Holiday honoring workers\' contributions.' },
      { date: `${year}-06-16`, title: '✊ Youth Day 🇿🇦', desc: 'South African Public Holiday honoring the youth of the 1976 Soweto Uprising.' },
      { date: `${year}-08-09`, title: '👩 National Women\'s Day 🇿🇦', desc: 'South African Public Holiday commemorating the 1956 march of women to the Union Buildings.' },
      { date: `${year}-08-10`, title: '👩 National Women\'s Day Observed 🇿🇦', desc: 'As Women\'s Day falls on a Sunday, Monday is observed as a public holiday.' },
      { date: `${year}-09-24`, title: '🔥 Heritage Day 🇿🇦', desc: 'South African Public Holiday celebrating our rich, diverse cultural heritage. (Commonly enjoyed as National Braai Day!)' },
      { date: `${year}-12-16`, title: '🤝 Day of Reconciliation 🇿🇦', desc: 'South African Public Holiday fostering national unity.' },
      { date: `${year}-12-25`, title: '🎄 Christmas Day 🇿🇦', desc: 'South African Public Holiday.' },
      { date: `${year}-12-26`, title: '🎁 Day of Goodwill 🇿🇦', desc: 'South African Public Holiday.' }
    ];

    holidays.forEach((h, i) => {
      list.push({
        id: `sa-ph-${year}-${i}`,
        title: h.title,
        description: h.desc,
        date: h.date,
        time: 'Public Holiday',
        type: 'activity',
        category: 'reminder'
      });
    });

    // 2. School Term start/end dates & holiday ranges for 2026
    if (year === 2026) {
      list.push({
        id: 'sa-2026-t1-start',
        title: '🏫 School Term 1 Starts 🇿🇦',
        description: 'First day of the 2026 South African public school academic year.',
        date: '2026-01-14',
        time: 'School Opens',
        type: 'activity',
        category: 'activity'
      });
      list.push({
        id: 'sa-2026-t1-end',
        title: '🏫 School Term 1 Ends 🇿🇦',
        description: 'Last day of the first term for South African public schools.',
        date: '2026-03-27',
        time: 'School Closes',
        type: 'activity',
        category: 'activity'
      });

      list.push({
        id: 'sa-2026-t2-start',
        title: '🏫 School Term 2 Starts 🇿🇦',
        description: 'First day of public school term 2.',
        date: '2026-04-08',
        time: 'School Opens',
        type: 'activity',
        category: 'activity'
      });
      list.push({
        id: 'sa-2026-t2-end',
        title: '🏫 School Term 2 Ends 🇿🇦',
        description: 'Last day of public school term 2 before winter break.',
        date: '2026-06-19',
        time: 'School Closes',
        type: 'activity',
        category: 'activity'
      });

      list.push({
        id: 'sa-2026-t3-start',
        title: '🏫 School Term 3 Starts 🇿🇦',
        description: 'First day of public school term 3 after winter break.',
        date: '2026-07-14',
        time: 'School Opens',
        type: 'activity',
        category: 'activity'
      });
      list.push({
        id: 'sa-2026-t3-end',
        title: '🏫 School Term 3 Ends 🇿🇦',
        description: 'Last day of public school term 3.',
        date: '2026-09-18',
        time: 'School Closes',
        type: 'activity',
        category: 'activity'
      });

      list.push({
        id: 'sa-2026-t4-start',
        title: '🏫 School Term 4 Starts 🇿🇦',
        description: 'First day of public school term 4. Final term of the year!',
        date: '2026-09-29',
        time: 'School Opens',
        type: 'activity',
        category: 'activity'
      });
      list.push({
        id: 'sa-2026-t4-end',
        title: '🏫 School Term 4 Ends 🇿🇦',
        description: 'Last day of public school term 4. Summer holidays begin!',
        date: '2026-12-09',
        time: 'School Closes',
        type: 'activity',
        category: 'activity'
      });

      // Helper to generate events for holiday ranges
      const generateHolidays = (startStr: string, endStr: string, name: string) => {
        const start = new Date(startStr);
        const end = new Date(endStr);
        let index = 0;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dStr = d.toISOString().split('T')[0];
          list.push({
            id: `sa-vac-${startStr}-${index++}`,
            title: `🌴 ${name} 🇿🇦`,
            description: `Official South African school holidays. Safe travels and happy resting!`,
            date: dStr,
            time: 'School Holiday',
            type: 'activity',
            category: 'activity'
          });
        }
      };

      generateHolidays('2026-03-28', '2026-04-07', 'Autumn School Holidays');
      generateHolidays('2026-06-20', '2026-07-13', 'Winter School Holidays');
      generateHolidays('2026-09-19', '2026-09-28', 'Spring School Holidays');
      generateHolidays('2026-12-10', '2026-12-31', 'Summer School Holidays');

    } else if (year === 2027) {
      list.push({
        id: 'sa-2027-t1-start',
        title: '🏫 School Term 1 Starts 🇿🇦',
        description: 'First day of the 2027 South African public school academic year.',
        date: '2027-01-13',
        time: 'School Opens',
        type: 'activity',
        category: 'activity'
      });
      list.push({
        id: 'sa-2027-t1-end',
        title: '🏫 School Term 1 Ends 🇿🇦',
        description: 'Last day of the first term for South African public schools.',
        date: '2027-03-25',
        time: 'School Closes',
        type: 'activity',
        category: 'activity'
      });

      list.push({
        id: 'sa-2027-t2-start',
        title: '🏫 School Term 2 Starts 🇿🇦',
        description: 'First day of public school term 2.',
        date: '2027-04-07',
        time: 'School Opens',
        type: 'activity',
        category: 'activity'
      });
      list.push({
        id: 'sa-2027-t2-end',
        title: '🏫 School Term 2 Ends 🇿🇦',
        description: 'Last day of public school term 2 before winter break.',
        date: '2027-06-18',
        time: 'School Closes',
        type: 'activity',
        category: 'activity'
      });

      list.push({
        id: 'sa-2027-t3-start',
        title: '🏫 School Term 3 Starts 🇿🇦',
        description: 'First day of public school term 3 after winter break.',
        date: '2027-07-13',
        time: 'School Opens',
        type: 'activity',
        category: 'activity'
      });
      list.push({
        id: 'sa-2027-t3-end',
        title: '🏫 School Term 3 Ends 🇿🇦',
        description: 'Last day of public school term 3.',
        date: '2027-09-17',
        time: 'School Closes',
        type: 'activity',
        category: 'activity'
      });

      list.push({
        id: 'sa-2027-t4-start',
        title: '🏫 School Term 4 Starts 🇿🇦',
        description: 'First day of public school term 4. Final term of the year!',
        date: '2027-09-28',
        time: 'School Opens',
        type: 'activity',
        category: 'activity'
      });
      list.push({
        id: 'sa-2027-t4-end',
        title: '🏫 School Term 4 Ends 🇿🇦',
        description: 'Last day of public school term 4. Summer holidays begin!',
        date: '2027-12-08',
        time: 'School Closes',
        type: 'activity',
        category: 'activity'
      });

      const generateHolidays = (startStr: string, endStr: string, name: string) => {
        const start = new Date(startStr);
        const end = new Date(endStr);
        let index = 0;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dStr = d.toISOString().split('T')[0];
          list.push({
            id: `sa-vac-${startStr}-${index++}`,
            title: `🌴 ${name} 🇿🇦`,
            description: `Official South African school holidays. Safe travels and happy resting!`,
            date: dStr,
            time: 'School Holiday',
            type: 'activity',
            category: 'activity'
          });
        }
      };

      generateHolidays('2027-03-26', '2027-04-06', 'Autumn School Holidays');
      generateHolidays('2027-06-19', '2027-07-12', 'Winter School Holidays');
      generateHolidays('2027-09-18', '2027-09-27', 'Spring School Holidays');
      generateHolidays('2027-12-09', '2027-12-31', 'Summer School Holidays');
    }

    return list;
  };

  const handleSelectToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Merge default activities, assignments, and custom events
  const allEvents = useMemo(() => {
    const eventsList: Array<{
      id: string;
      title: string;
      description?: string;
      date: string; // YYYY-MM-DD
      time?: string;
      type: 'assignment' | 'activity';
      subject?: string;
      category?: string;
    }> = [];

    // Add assignments
    assignments.forEach(asg => {
      let asgDateOnly = '';
      if (asg.due_date) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(asg.due_date)) {
          asgDateOnly = asg.due_date;
        } else {
          asgDateOnly = getLocalDateString(new Date(asg.due_date));
        }
      }
      const asgTime = asg.due_date ? new Date(asg.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Due end of day';
      eventsList.push({
        id: `asg-${asg.id}`,
        title: `📖 Homework: ${asg.title}`,
        description: asg.description || 'No description provided.',
        date: asgDateOnly,
        time: asgTime,
        type: 'assignment',
        subject: asg.subject || 'General'
      });
    });

    // Add default activities
    DEFAULT_ACTIVITIES.forEach(act => {
      eventsList.push({
        id: act.id,
        title: act.title,
        description: act.description,
        date: act.date,
        time: act.time,
        type: 'activity',
        category: act.category
      });
    });

    // Add South African School Calendar and Public Holidays dynamically!
    const saEvents = [...getSouthAfricanEvents(2026), ...getSouthAfricanEvents(2027)];
    saEvents.forEach(act => {
      eventsList.push(act);
    });

    // Add custom events
    customEvents.forEach(act => {
      eventsList.push({
        id: act.id,
        title: act.title,
        description: act.description,
        date: act.date,
        time: act.time,
        type: 'activity',
        category: act.category
      });
    });

    return eventsList;
  }, [assignments, customEvents]);

  // Calendar math: grid generation
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells: Array<{
      date: Date;
      isCurrentMonth: boolean;
      dayNum: number;
      dateString: string;
    }> = [];

    // Previous Month's padding days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDayNum = daysInPrevMonth - i;
      const date = new Date(currentYear, currentMonth - 1, prevDayNum);
      cells.push({
        date,
        isCurrentMonth: false,
        dayNum: prevDayNum,
        dateString: getLocalDateString(date)
      });
    }

    // Current Month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      cells.push({
        date,
        isCurrentMonth: true,
        dayNum: i,
        dateString: getLocalDateString(date)
      });
    }

    // Next Month's padding days to complete grid (multiples of 7, usually 35 or 42)
    const totalSlots = cells.length > 35 ? 42 : 35;
    const remaining = totalSlots - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(currentYear, currentMonth + 1, i);
      cells.push({
        date,
        isCurrentMonth: false,
        dayNum: i,
        dateString: getLocalDateString(date)
      });
    }

    return cells;
  }, [currentYear, currentMonth]);

  // Map events to their dates for fast rendering
  const eventsByDate = useMemo(() => {
    const mapping: Record<string, typeof allEvents> = {};
    allEvents.forEach(event => {
      if (!mapping[event.date]) {
        mapping[event.date] = [];
      }
      mapping[event.date].push(event);
    });
    return mapping;
  }, [allEvents]);

  // Selected date events filter
  const selectedDateStr = getLocalDateString(selectedDate);
  
  const filteredEventsForSelectedDate = useMemo(() => {
    const eventsOnDay = eventsByDate[selectedDateStr] || [];
    return eventsOnDay.filter(e => {
      if (filterType === 'assignment' && e.type !== 'assignment') return false;
      if (filterType === 'activity' && e.type !== 'activity') return false;
      
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        return e.title.toLowerCase().includes(query) || (e.description || '').toLowerCase().includes(query);
      }
      return true;
    });
  }, [eventsByDate, selectedDateStr, filterType, searchTerm]);

  // Global events search list
  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    const query = searchTerm.toLowerCase();
    return allEvents.filter(e => {
      if (filterType === 'assignment' && e.type !== 'assignment') return false;
      if (filterType === 'activity' && e.type !== 'activity') return false;
      return e.title.toLowerCase().includes(query) || (e.description || '').toLowerCase().includes(query);
    });
  }, [allEvents, searchTerm, filterType]);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const emojiPrefix = newCategory === 'exam' ? '📝' : newCategory === 'club' ? '💻' : '✨';
    const finalTitle = `${emojiPrefix} ${newTitle}`;

    const newAct: SchoolActivity = {
      id: `custom-${Date.now()}`,
      title: finalTitle,
      description: newDesc,
      date: newDateStr,
      time: newTime,
      category: newCategory
    };

    setCustomEvents(prev => [...prev, newAct]);
    
    // Reset form states
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-3xl border-4 border-slate-100 shadow-sm p-6 overflow-hidden flex flex-col md:flex-row gap-6" id="dashboard-calendar-card">
      
      {/* LEFT COLUMN: Calendar Month Grid */}
      <div className="flex-1 min-w-[280px]">
        {/* Calendar Header Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-800 leading-tight">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Interactive Schedule
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-xl p-1">
            <button 
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white text-slate-600 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={handleSelectToday}
              className="px-2.5 py-1 text-xs font-bold text-indigo-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
            >
              Today
            </button>
            <button 
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white text-slate-600 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Row */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {daysOfWeek.map(day => (
            <span key={day} className="text-xs font-bold text-slate-400 uppercase tracking-wider py-1.5">
              {day}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((cell, idx) => {
            const hasEvents = !!eventsByDate[cell.dateString];
            const eventsOnDay = eventsByDate[cell.dateString] || [];
            
            const hasAssignment = eventsOnDay.some(e => e.type === 'assignment');
            const hasActivity = eventsOnDay.some(e => e.type === 'activity');

            const isSelected = selectedDateStr === cell.dateString;
            const isToday = getLocalDateString(new Date()) === cell.dateString;

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(cell.date)}
                className={`
                  relative aspect-square p-1 rounded-2xl flex flex-col justify-between items-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400
                  ${cell.isCurrentMonth ? 'text-slate-700 font-bold' : 'text-slate-300 font-normal'}
                  ${isSelected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 scale-105' : 'hover:bg-slate-50'}
                  ${isToday && !isSelected ? 'border-2 border-indigo-400 bg-indigo-50/30' : ''}
                `}
              >
                <span className={`text-xs ${isToday ? 'font-black' : ''}`}>
                  {cell.dayNum}
                </span>

                {/* Event indicators */}
                {hasEvents && (
                  <div className="flex gap-1 justify-center w-full pb-0.5">
                    {hasAssignment && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`} />
                    )}
                    {hasActivity && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-yellow-300' : 'bg-emerald-500'}`} />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: Selected Date Details & Controls */}
      <div className="w-full md:w-80 shrink-0 flex flex-col border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6">
        
        {/* Search & Filters */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search assignments or events..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
            />
          </div>

          <div className="flex gap-1.5 bg-slate-50 p-1 rounded-xl">
            <button
              onClick={() => setFilterType('all')}
              className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${filterType === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('assignment')}
              className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${filterType === 'assignment' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Homework
            </button>
            <button
              onClick={() => setFilterType('activity')}
              className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${filterType === 'activity' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Activities
            </button>
          </div>
        </div>

        {/* Selected Date Header */}
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-extrabold text-sm text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
            {searchTerm ? 'Search Results' : selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </h4>
          
          {/* Quick add event option for teachers, admins, and parents */}
          {['teacher', 'parent', 'school_admin', 'super_admin'].includes(role) && (
            <button 
              onClick={() => {
                setNewDateStr(selectedDateStr);
                setShowAddModal(true);
              }}
              className="p-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="Add School Activity/Reminder"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Events list container */}
        <div className="flex-1 overflow-y-auto max-h-[220px] md:max-h-[260px] pr-1 space-y-3 scrollbar-thin">
          {searchTerm ? (
            searchResults.length > 0 ? (
              searchResults.map(event => (
                <div key={event.id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-2xl hover:border-slate-200 transition-all">
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${event.type === 'assignment' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {event.type === 'assignment' ? 'Homework' : 'School Activity'}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h5 className="font-black text-slate-800 text-xs leading-snug">{event.title}</h5>
                  {event.description && (
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{event.description}</p>
                  )}
                  {event.time && (
                    <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{event.time}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-400">No events matched your search.</p>
              </div>
            )
          ) : (
            filteredEventsForSelectedDate.length > 0 ? (
              filteredEventsForSelectedDate.map(event => (
                <div key={event.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-100 transition-all">
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${event.type === 'assignment' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {event.type === 'assignment' ? 'Homework' : 'Activity'}
                    </span>
                    {event.time && (
                      <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.time}
                      </span>
                    )}
                  </div>
                  <h5 className="font-black text-slate-800 text-xs leading-snug">{event.title}</h5>
                  {event.description && (
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{event.description}</p>
                  )}
                  {event.subject && (
                    <div className="mt-2 inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[9px] font-bold uppercase tracking-wider">
                      <Tag className="w-2.5 h-2.5" />
                      <span>{event.subject}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400">No homework or activities planned today!</p>
                <p className="text-[10px] text-slate-300 mt-0.5">Enjoy your free time or trace some words! 🌟</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* MODAL: Add Custom Activity Form */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border-4 border-indigo-100 shadow-xl max-w-sm w-full p-6 relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="font-black text-slate-800 text-md">Add Calendar Activity</h3>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Activity Title
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Science Lab Project Showcase"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Description
                </label>
                <textarea 
                  placeholder="Briefly describe what's happening..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Date
                  </label>
                  <input 
                    type="date"
                    required
                    value={newDateStr}
                    onChange={(e) => setNewDateStr(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Time
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. 14:00 - 15:00"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-200 bg-white rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="activity">School Activity</option>
                  <option value="club">After-School Club</option>
                  <option value="exam">Homework / Exam Review</option>
                  <option value="reminder">Special Reminder</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  Save Activity ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
