import type { Question } from "./question";

export type ExamType = "practice" | "timed";

export interface Exam {
  id: number;
  title: string;
  description?: string | null;
  subject: string;
  author?: string | null;
  exam_type: ExamType;
  time_limit_seconds?: number | null;
  question_count: number;
  is_saved?: boolean;
  filter_values?: Record<string, unknown>;
}

export interface ExamQuestion {
  id: number;
  position: number;
  points: number;
  question: Question & { correct_option_id?: number };
}

export interface ExamDetail extends Exam {
  questions: ExamQuestion[];
  show_answers_immediately?: boolean;
}

export interface ExamResult {
  id: number;
  exam_id: number;
  status: string;
  duration_seconds: number;
  score: number | null;
  correct_count: number;
  wrong_count: number;
  unanswered_count: number;
  started_at: string;
  finished_at?: string | null;
  answers: Record<string, { selected_option_id: number | null; is_correct: boolean }>;
}

export interface PracticeAnswerResult {
  question_id: number;
  selected_option_id: number;
  is_correct: boolean;
  correct_option_id: number;
  explanation: string;
  attempt: ExamResult & {
    answered_questions: number;
    total_questions: number;
  };
}
