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

export interface SubjectAssessment {
  id: string; // unique assessment ID
  name: string; // assessment name e.g., "Counting 1 to 10"
  score: number; // teacher-assigned score
  outOf: number; // max possible score
  date: string;  // ISO date string
  feedback?: string; // teacher feedback
  type?: 'home' | 'classwork' | 'test' | 'practical test';
  activityId?: string; // linked class activity ID
}

export interface UserProgress {
  completedWeeks: Record<string, boolean>; // key: "Grade-Term-Week"
  starsEarned: Record<string, number>; // key: "Grade-Term-Week"
  totalStars: number;
  marksPossible?: Record<string, number>; // key: "Grade-Term-Week"
  subjectGrades?: Record<string, SubjectAssessment[]>; // key: Subject name (e.g., "Mathematics")
}

export interface StudentProfile {
  id: string;
  name: string;
  grade: GradeType;
  avatar: string; // emoji character
  pin: string;    // optional 4-digit PIN
  progress: UserProgress;
  role?: 'teacher' | 'admin' | 'learner' | 'school_admin' | 'super_admin' | 'parent' | 'facilitator';
  school_id?: string;
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
