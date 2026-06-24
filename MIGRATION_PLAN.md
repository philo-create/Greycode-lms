# Greycode LMS Migration Plan: React to Next.js + Supabase

## 1. Why Moving Now Makes Sense
- **Smaller surface area:** With only Term 1 completed, you have a manageable amount of content and state logic to refactor. It is much easier to migrate 10 components now than 100 components later.
- **Architectural Foundation:** Next.js provides built-in file-based routing, API routes, and Server-Side Rendering (SSR). Adding routing and secure backend API calls later to a massive plain React app is painful and often requires rewriting large chunks of state management.
- **Auth & Database Readiness:** Supabase integrates beautifully with Next.js App Router. Baking authentication and progress tracking into the foundation now prevents complex data migrations later.
- **Performance & SEO:** Server-rendered pages load faster, which is crucial for schools with varying internet quality and older devices.

## 2. Reusing Current React Components
Because Next.js is built on React, your existing UI components (buttons, cards, animations) are completely valid and will not be wasted.
- **`"use client"`:** Your interactive components (like `ColoringCanvas.tsx`, `CodingGridActivity.tsx`, and anything using `useState` or `motion/react`) will simply have the `"use client"` directive added to the very top of the file.
- **Presentational vs. Container:** You will separate data fetching (done securely on the server in Next.js) from the presentation (your existing React components). Your current components will just receive data via props.
- **Assets:** Your existing SVGs and JPGs in `src/assets` move easily into the Next.js `public/` directory for faster serving.

## 3. Recommended Folder Structure (Next.js App Router)
```text
/
├── app/
│   ├── (auth)/             # Login, Register, Forgot Password routes
│   ├── (dashboard)/        # Layout for authenticated users
│   │   ├── student/        # Learner dashboard (Current UI)
│   │   ├── teacher/        # Teacher dashboard (Grading, Attendance)
│   │   └── admin/          # School admin dashboard
│   ├── courses/            # Grade/Term/Module routing (e.g., /courses/grade-1/term-1)
│   ├── api/                # Next.js API routes (webhooks, payment endpoints)
│   ├── layout.tsx          # Root layout (fonts, global providers)
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # Reusable buttons, modals, cards
│   ├── activities/         # CodingGridActivity, ColoringCanvas, SequenceActivity
│   └── shared/             # Navbars, Sidebars, Mascot animations
├── lib/
│   ├── supabase/           # Supabase client setup
│   └── utils.ts            # Helper functions (like tailwind merge)
├── types/                  # TypeScript interfaces (Database schemas)
└── public/                 # Images, SVGs (moved from src/assets)
```

## 4. Proposed Supabase Database Schema (PostgreSQL)
To support a full LMS, you need relational data. Here is the core schema:
- **`users`**: Managed by Supabase Auth (handles email, password, magic links).
- **`profiles`**: `id` (references users), `role` (student, teacher, admin), `first_name`, `last_name`, `school_id`.
- **`schools`**: `id`, `name`, `contact_info`, `subscription_status`.
- **`classes`**: `id`, `school_id`, `grade`, `teacher_id`, `year`.
- **`students_classes`**: Mapping table linking students to their specific class.
- **`modules`**: `id`, `grade`, `term`, `title`, `description`. (Represents curriculum weeks/topics).
- **`lessons`**: `id`, `module_id`, `title`, `content_type` (video, interactive, quiz), `order`.
- **`progress`**: `id`, `student_id`, `lesson_id`, `status` (not_started, in_progress, completed), `score`, `completed_at`.
- **`assessments`**: `id`, `student_id`, `module_id`, `score`, `teacher_feedback`, `created_at`.
- **`attendance`**: `id`, `student_id`, `class_id`, `date`, `status` (present, absent).

## 5. Static Content vs. Database Content
- **Static Content (Code/JSON):**
  - Core curriculum structure (`GRADES`, terms, week titles) can stay as configuration files (`curriculumData.ts`) initially. It changes rarely and is faster to read from code.
  - Interactive activity logic (e.g., how the robotics grid works, animation logic).
  - Heavy media (images, PDFs) should go into **Supabase Storage** (buckets), not the database itself.
- **Database Content (Dynamic):**
  - User accounts, roles, and profiles.
  - Learner progress (which weeks are completed, stars earned, timestamps).
  - Assessment scores and teacher feedback.
  - Attendance records and payment status.

## 6. Step-by-Step Migration Plan
**Phase 1: Foundation (Do not break existing app)**
- Keep the current React project alive as the reference point.
- Set up a new Next.js project with Tailwind CSS.
- Configure the Supabase project and set up authentication tables.
- Migrate the global CSS and Tailwind config.

**Phase 2: UI Porting**
- Move static assets to the `public` folder.
- Copy over standalone React components (`ColoringCanvas`, `CodingGridActivity`) into `/components/activities`. Add `"use client"` to them.
- Recreate the main `Dashboard` using Next.js layouts (`app/(dashboard)/layout.tsx`).

**Phase 3: State & Data Migration**
- Replace the current `localStorage` progress logic in `App.tsx` with Supabase API calls.
- Create Server Components to fetch a student's progress directly from Supabase, and pass that data down to the client components.
- Implement the authentication flow using Supabase Auth, replacing the local `LoginGate`.

**Phase 4: Expansion**
- Once Term 1 is fully functional on Next.js + Supabase, begin adding the Teacher Dashboard and Assessment tables.
- Add Term 2 content following the new, scalable architecture.

## 7. Next Steps in AI Studio
Right now, you are building in a Vite+React environment. To prioritize speed and long-term control while we are here:
1. We should refactor the current codebase to rigidly separate **Data Fetching** from **UI Components**.
2. We can move your `localStorage` logic into an API simulation layer (or an Express backend if you prefer). This makes dropping the code into Next.js later incredibly easy, as the UI will already expect data from an external source rather than local state.
