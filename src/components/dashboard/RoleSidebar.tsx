import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Settings, 
  LogOut,
  GraduationCap,
  ClipboardList,
  Award
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export type UserRole = 'super_admin' | 'school_admin' | 'teacher' | 'facilitator' | 'learner' | 'parent';

interface RoleSidebarProps {
  role: UserRole;
}

export function RoleSidebar({ role }: RoleSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const getLinks = () => {
    const base = '/dashboard';
    switch (role) {
      case 'super_admin':
        return [
          { href: `${base}/admin`, label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
          { href: `${base}/admin/schools`, label: 'Schools', icon: <BookOpen className="w-5 h-5" /> },
          { href: `${base}/admin/users`, label: 'Users', icon: <Users className="w-5 h-5" /> },
        ];
      case 'school_admin':
        return [
          { href: `${base}/school`, label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
          { href: `${base}/school/teachers`, label: 'Teachers', icon: <Users className="w-5 h-5" /> },
          { href: `${base}/school/learners`, label: 'Learners', icon: <GraduationCap className="w-5 h-5" /> },
        ];
      case 'teacher':
        return [
          { href: `${base}/teacher`, label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
          { href: `${base}/teacher/classes`, label: 'My Classes', icon: <Users className="w-5 h-5" /> },
          { href: `${base}/teacher/assessments`, label: 'Assessments', icon: <ClipboardList className="w-5 h-5" /> },
        ];
      case 'facilitator':
        return [
          { href: `${base}/facilitator`, label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
          { href: `${base}/facilitator/schedule`, label: 'Schedule', icon: <ClipboardList className="w-5 h-5" /> },
        ];
      case 'learner':
        return [
          { href: `${base}/learner`, label: 'My Hub', icon: <LayoutDashboard className="w-5 h-5" /> },
          { href: `${base}/learner/lessons`, label: 'Lessons', icon: <BookOpen className="w-5 h-5" /> },
          { href: `${base}/learner/badges`, label: 'Badges', icon: <Award className="w-5 h-5" /> },
        ];
      case 'parent':
        return [
          { href: `${base}/parent`, label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
          { href: `${base}/parent/progress`, label: 'Progress Reports', icon: <ClipboardList className="w-5 h-5" /> },
        ];
      default:
        return [];
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const links = getLinks();

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl">G</div>
          <span className="font-bold text-xl tracking-tight">Greycode</span>
        </div>
        
        <div className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                {link.icon}
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      
      <div className="mt-auto p-6 space-y-1">
        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
}
