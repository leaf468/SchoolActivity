# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
cd frontend
npm install          # Install dependencies
npm start           # Start development server (port 3000)
npm run dev         # Alternative start command
npm run build       # Build for production
npm test            # Run tests
```

### Environment Setup
```bash
# Required environment variables in frontend/.env
REACT_APP_OPENAI_API_KEY=your-api-key        # OpenAI API key (required)
REACT_APP_OPENAI_MODEL=gpt-4o                # Model selection (gpt-4o or gpt-4o-mini)
REACT_APP_SUPABASE_URL=your-url              # Supabase project URL
REACT_APP_SUPABASE_ANON_KEY=your-key         # Supabase anon key
```

## Architecture

This is an AI-powered Korean school activity record (생기부) generation system built as a React TypeScript frontend application. It helps high school students write professional school activity records using OpenAI's GPT-4.

### Project Structure
```
SchoolActivity/
├── frontend/                        # React TypeScript frontend (CRA + Vite)
│   ├── src/
│   │   ├── pages/                  # 4-page wizard flow
│   │   │   ├── Page1BasicInfo.tsx      # Student info input
│   │   │   ├── Page2ActivityInput.tsx  # Activity summary input
│   │   │   ├── Page3DraftReview.tsx    # AI draft review
│   │   │   └── Page4FinalEdit.tsx      # Final verification
│   │   ├── components/             # React components
│   │   │   ├── CommonHeader.tsx        # Global header
│   │   │   ├── CommonFooter.tsx        # Global footer
│   │   │   ├── InitialAuthPopup.tsx    # Auth flow
│   │   │   ├── LoginModal.tsx          # Supabase login
│   │   │   ├── SignupModal.tsx         # Supabase signup
│   │   │   ├── MyPage.tsx              # User dashboard
│   │   │   └── ui/                     # Reusable UI
│   │   ├── services/               # Business logic
│   │   │   ├── schoolRecordGenerator.ts # A-M-A-R generation
│   │   │   ├── recordVerifier.ts       # 5-criterion verification
│   │   │   ├── schoolRecordService.ts  # Main orchestrator
│   │   │   └── pdfGenerator.ts         # PDF export
│   │   ├── contexts/               # React Context
│   │   │   ├── SchoolActivityContext.tsx # Main state
│   │   │   └── AuthContext.tsx         # Supabase auth
│   │   ├── types/                  # TypeScript interfaces
│   │   │   └── schoolActivity.ts       # Core types
│   │   ├── data/                   # Data files
│   │   │   ├── fewShotExamples.ts      # Few-shot examples
│   │   │   └── universitySlogans.ts    # University data
│   │   ├── config/
│   │   │   └── supabase.ts             # Supabase client
│   │   └── App.tsx                 # Main app routing
│   └── package.json
├── vercel.json                     # Vercel deployment
├── README.md                       # Project README (Korean)
├── IMPLEMENTATION_SUMMARY.md       # Detailed implementation
└── HOW_TO_ADD_FEWSHOTS.md        # Few-shot guide
```

### Core Workflow

The application implements a 4-page wizard flow for AI-powered 생기부 generation:

1. **Page1BasicInfo** - Student information input (name, grade, major track)
2. **Page2ActivityInput** - Activity summary and keywords input
3. **Page3DraftReview** - AI-generated draft with A-M-A-R structure highlighting
4. **Page4FinalEdit** - Verification results and final export

### AI Generation System

#### A-M-A-R Methodology
The system structures school records using the A-M-A-R framework:
- **Action**: Core activity from user input
- **Motivation**: Intellectual curiosity linked to career path
- **Advanced Action**: Specific deeper exploration
- **Realization**: Learning outcomes and career connections

#### Two-Prompt Architecture

**Prompt 1: Generation Expert** (`schoolRecordGenerator.ts`)
- Implements A-M-A-R methodology
- AI detection evasion through linguistic burstiness
- Teacher observation tone enforcement
- Career-aligned fusion thinking (same activity → different narratives per major track)
- Few-shot learning with real examples

**Prompt 2: Verification Consultant** (`recordVerifier.ts`)
- 5-criterion evaluation system:
  1. Authenticity (genuine student writing)
  2. Consistency (matches original activity)
  3. Plagiarism Risk Assessment
  4. Credibility Check
  5. Improvement Recommendations

### Data Models

Core types in `src/types/schoolActivity.ts`:
- `MajorTrack` - 5 major tracks (상경/공학/인문사회/자연과학/의생명)
- `SectionType` - 5 record sections (교과세특/자율/동아리/봉사/진로)
- `StudentInfo` - Student basic information
- `ActivityInput` - User activity input with emphasis keywords
- `GeneratedRecord` - AI-generated output with metadata
- `VerificationResult` - 5-criterion evaluation scores

### Supabase Database Schema

The application uses Supabase for backend data persistence with the following tables:

#### 1. user_profiles
User profile information (1:1 relationship with auth.users)
```sql
- id: UUID (primary key)
- user_id: UUID (references auth.users, unique)
- school: TEXT
- grade: TEXT
- semester: TEXT
- target_university: TEXT
- target_major: TEXT
- university_slogan: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ (auto-updated via trigger)
```

**RLS Policies**: Users can only view/insert/update their own profile

#### 2. todos
User todo list management
```sql
- id: UUID (primary key)
- user_id: UUID (references auth.users)
- text: TEXT (not null)
- done: BOOLEAN (default false)
- due_date: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ (auto-updated via trigger)
```

**RLS Policies**: Users can view/insert/update/delete only their own todos

#### 3. activity_records (Core Table)
Stores complete activity record data including all wizard steps
```sql
- id: UUID (primary key)
- user_id: UUID (references auth.users)
- session_id: TEXT (tracks wizard session)

-- Page1: Student Basic Info
- student_name: TEXT
- student_grade: INTEGER (1-3)
- desired_major: TEXT
- track: TEXT (상경계열/공학계열/인문사회계열/자연과학계열/의생명계열)
- school: TEXT
- class_number: TEXT

-- Page2: Activity Input
- section_type: TEXT (subject/autonomy/club/service/career/behavior)
- subject: TEXT (for 교과세특)
- activity_summary: TEXT
- activity_date: TEXT
- keywords: JSONB (emphasis keywords array)
- activity_details: JSONB (full activity object)

-- Page3: AI Generated Draft
- generated_draft: TEXT
- draft_confidence: NUMERIC(3,2) (0-1 scale)
- used_few_shots: JSONB (few-shot example IDs)
- amar_breakdown: JSONB (A-M-A-R structure analysis)

-- Verification Results
- verification_result: JSONB (complete VerificationResult object)

-- Page4: Final Output
- final_text: TEXT
- is_finalized: BOOLEAN (default false)

-- Metadata
- title: TEXT (display title, e.g. "수학 교과세특 - 2024.03.15")
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ (auto-updated via trigger)
```

**Indexes**: user_id, session_id, is_finalized, created_at DESC
**RLS Policies**: Users can view/insert/update/delete only their own records

#### 4. revision_history
Tracks revision history for activity records
```sql
- id: UUID (primary key)
- activity_record_id: UUID (references activity_records)
- user_id: UUID (references auth.users)
- original_draft: TEXT (not null)
- revision_request: TEXT
- revised_draft: TEXT (not null)
- created_at: TIMESTAMPTZ
```

**Indexes**: activity_record_id, created_at DESC
**RLS Policies**: Users can view/insert only their own revision history

#### 5. Database Functions & Triggers

**Auto-create user profile on signup**:
```sql
-- Function: public.handle_new_user()
-- Automatically creates a user_profiles row when a new auth.users row is created
-- Trigger: on_auth_user_created (AFTER INSERT on auth.users)
```

**Auto-update timestamps**:
```sql
-- Function: public.update_updated_at_column()
-- Automatically updates updated_at to NOW() on row updates
-- Applied to: user_profiles, todos, activity_records
```

#### Database Access Pattern

Frontend interacts with Supabase via:
- `src/config/supabase.ts` - Supabase client initialization
- `AuthContext` - Authentication and user session management
- Direct Supabase client calls for CRUD operations on tables

All tables use Row Level Security (RLS) to ensure users can only access their own data.

### State Management

**SchoolActivityContext** (`contexts/SchoolActivityContext.tsx`)
- Reducer-based state management with localStorage persistence
- Manages student info, activities, generated drafts, and verification results
- Session management for tracking user flow

**AuthContext** (`contexts/AuthContext.tsx`)
- Supabase authentication integration
- Supports login, signup, and guest mode
- User profile and saved records management

### Tech Stack

- **React 19.1.1** with TypeScript for UI
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for animations
- **React Hook Form** for form management
- **React Query** for server state
- **OpenAI API** for AI generation
- **Supabase** for authentication and data persistence
- **React Markdown** for content rendering
- **jsPDF & HTML2Canvas** for PDF export

### Key Services

#### School Record Services
- `schoolRecordService.ts` - Main orchestrator combining generation and verification
- `schoolRecordGenerator.ts` - A-M-A-R based content generation
- `recordVerifier.ts` - Quality and plagiarism verification
- `pdfGenerator.ts` - Export to PDF functionality

#### Data Management
- `fewShotExamples.ts` - Real example database (42 examples needed across tracks/grades/sections)
- `universitySlogans.ts` - University name auto-completion data

### Deployment
- Configured for Vercel deployment via `vercel.json`
- Frontend builds to `frontend/build`
- Uses Create React App build system

## Important Context

### Korean Education System
- 생기부 (School Activity Record) is crucial for Korean university admissions
- Records are written from teacher's observational perspective
- Must demonstrate career alignment and intellectual growth
- Requires specific tone and structure to appear authentic

### AI Detection Evasion
The system includes sophisticated measures to avoid AI detection:
- Enforced teacher observation tone ("~함.", "~임.", "~이 돋보임.")
- Linguistic burstiness (20-30% short sentences, 70-80% long sentences)
- Prohibition of template mimicry
- Exclusion of clichéd expressions

### Few-Shot Learning Framework
- Currently has 2 sample examples, needs 42 total
- Examples organized by track × grade × section type
- Guide for adding examples in `HOW_TO_ADD_FEWSHOTS.md`
- Helper functions: `getRelevantExamples()`, `getExamplesBySubject()`, `getRandomExamples()`
