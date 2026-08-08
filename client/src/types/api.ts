/**
 * TypeScript types for request/response payloads used by lib/api.ts that
 * aren't already covered by an entity type (User, Note, Question, Exam...).
 * Field names mirror the backend Pydantic schemas and router return shapes
 * one-to-one - see backend/schemas/*.py and backend/routers/*.py.
 */
import type { Difficulty } from "./question";
import type { ExamType } from "./exam";

/** POST /api/auth/register body. */
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

/** POST /api/auth/login response (backend/schemas/user.py:Token). */
export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
}

/** POST /api/notes body (backend/routers/notes.py:NoteCreate). */
export interface NoteCreateInput {
  title: string;
  subject: string;
  content: string;
  author?: string;
}

/** POST /api/questions body (backend/routers/questions.py:QuestionCreate).
 * difficulty is a plain string here (not the Difficulty union) because the
 * admin form keeps it as free-form state until the backend validates it. */
export interface QuestionCreateInput {
  text: string;
  subject: string;
  difficulty: Difficulty | string;
  options: string[];
  correct_option_id: number;
  explanation: string;
  code_example?: string | null;
  note_id?: number | null;
}

/** Response of POST /api/questions/{id}/answer. */
export interface QuestionAnswerResult {
  is_correct: boolean;
  correct_option_id: number;
  explanation: string;
}

/** Response of PATCH /api/questions/{id}/save and PATCH /api/exams/{id}/save. */
export interface ToggleSaveResult {
  is_saved: boolean;
}

/** One question slot inside POST /api/exams (backend/schemas/exam.py:ExamQuestionCreate). */
export interface ExamQuestionCreateInput {
  question_id: number;
  position: number;
  points?: number;
}

/** POST /api/exams body (backend/schemas/exam.py:ExamCreate). */
export interface ExamCreateInput {
  title: string;
  description?: string | null;
  subject: string;
  author?: string;
  exam_type: ExamType;
  time_limit_seconds?: number | null;
  show_answers_immediately?: boolean;
  is_published?: boolean;
  questions: ExamQuestionCreateInput[];
  filter_values?: Record<string, unknown>;
}

/** One entry in the merged "saved items" feed (backend/routers/saved.py). */
export interface SavedItem {
  type: "note" | "question" | "exam";
  id: number;
  title: string;
  href: string;
  subject?: string | null;
  saved_at?: string;
}

/** GET /api/users/progress response (backend/routers/progress.py). */
export interface WeeklyActivityDay {
  day: string;
  questions: number;
  study_minutes: number;
}

export interface RecentVisitExam {
  id: number;
  title: string;
  href: string;
  visited_at?: string | null;
  score: number | null;
  status: string;
  answered_questions: number;
  total_questions: number;
}

export interface RecentVisitNote {
  id: number;
  title: string;
  href: string;
  visited_at?: string | null;
}

export interface ProgressResponse {
  total_questions: number;
  correct_questions: number;
  progress_percentage: number;
  suggested_subjects: string[];
  weekly_activity: WeeklyActivityDay[];
  recent_visits: {
    exam: RecentVisitExam | null;
    note: RecentVisitNote | null;
  };
}

/** POST /api/study/log response. */
export interface LogStudyTimeResult {
  status: string;
  seconds: number;
}
