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