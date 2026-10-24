/**
 * TypeScript type for a study Note, mirroring backend/schemas/note.py.
 */

export interface Note { id: number; slug: string; title: string; subject: string; content: string; author?: string; reading_time: number; question_count?: number; is_saved?: boolean; created_at?: string; }
