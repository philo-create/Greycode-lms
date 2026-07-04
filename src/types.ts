export type GradeType = 'R' | '1' | '2' | '3';

export type StrandType = 'Coding' | 'Robotics' | 'Digital';

export interface Lesson {
  id: string; // e.g., "R-T1-W1"
  grade: GradeType;
  term: number; // 1 | 2 | 3 | 4
  week: number; // 1 to 10
  strand: StrandType;
  title: string;
  capsCode: string[]; // e.g., ["C.6", "C.1"]
  description: string;
  highlights: string[];
  suggestedActivity: string;
  activityType: 'pattern' | 'grid' | 'robotics' | 'digital' | 'exploration' | 'sequence';
  activityId?: string; // which interactive simulation level to play
}

export interface UserProgress {
  completedWeeks: Record<string, boolean>; // key: "Grade-Term-Week"
  starsEarned: Record<string, number>; // key: "Grade-Term-Week"
  totalStars: number;
  marksPossible?: Record<string, number>; // key: "Grade-Term-Week"
}

export interface StudentProfile {
  id: string;
  name: string;
  grade: GradeType;
  avatar: string; // emoji character
  pin: string;    // optional 4-digit PIN
  progress: UserProgress;
  role?: 'teacher' | 'admin' | 'learner' | 'school_admin' | 'super_admin' | 'parent' | 'facilitator';
}


export type LessonStatus = 'locked' | 'teacher_unlocked' | 'pending_approval' | 'unlocked_for_students';

export interface ClassLessonStatus {
  id: string;
  school_id: string;
  teacher_id: string;
  grade: string;
  lesson_id: string;
  status: LessonStatus;
  completed_at?: string;
  approved_at?: string;
}
