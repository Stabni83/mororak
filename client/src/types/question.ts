export type Difficulty = "beginner" | "intermediate" | "advanced";
export interface QuestionOption { id: number; text: string; }
export interface Question { id: number; subject: string; difficulty: Difficulty; text: string; options: QuestionOption[] | string[]; correct_option_id: number; explanation: string; code_example?: string | null; note_id?: number | null; is_saved?: boolean; created_at?: string; }
export interface UserAnswer { questionId: number; selectedOptionId: number; isCorrect: boolean; answeredAt: string; personalNote?: string; }
