/** GET /api/users/study-stats response (study time per day, split by subject). */
export interface StudyStatsDay {
  date: string; // "YYYY-MM-DD"
  total_seconds: number;
  subjects: Record<string, number>; // subject slug -> seconds
}

export interface StudyStatsSubject {
  slug: string;
  name: string;
  total_seconds: number;
}

export interface StudyStats {
  days: StudyStatsDay[];
  subjects: StudyStatsSubject[];
  total_seconds: number;
  active_days: number;
}
