/**
 * Single API client. Every network call from the frontend goes through this
 * file: it attaches the JWT to outgoing requests, redirects to /login on a
 * 401 (except for the auth endpoints themselves, which are expected to fail
 * for logged-out users), and turns backend error responses into readable
 * Error objects.
 *
 * NOTE FOR THE TEAM: this file was missing from the repository because the
 * root .gitignore has a generic Python rule `lib/` (meant to ignore
 * site-packages folders like backend/venv/lib/) that was ALSO matching
 * client/src/lib/ and silently excluding it from every commit. See the fix
 * in .gitignore - make sure this file is tracked by git from now on.
 */
import type {
  User,
  Note,
  Question,
  Exam,
  ExamDetail,
  ExamResult,
  PracticeAnswerResult,
  SubjectItem,
  FilterDefinition,
  FilterScope,
  RegisterInput,
  AuthTokenResponse,
  NoteCreateInput,
  QuestionCreateInput,
  ExamCreateInput,
  ToggleSaveResult,
  QuestionAnswerResult,
  SavedItem,
  ProgressResponse,
  LogStudyTimeResult,
  Resource,
  StudyStats,
} from "@/types";

const TOKEN_KEY = "access_token";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("userName");
  }
}

type QueryValue = string | number | boolean | undefined | null;

/** Builds a "?a=1&b=2" query string, skipping undefined/null/empty values. */
function qs(params?: Record<string, QueryValue>): string {
  if (!params) return "";
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    usp.set(key, String(value));
  });
  const s = usp.toString();
  return s ? `?${s}` : "";
}

interface RequestOptions extends RequestInit {
  /** Skip the auto-redirect-to-/login behavior on 401 (used by the auth endpoints themselves). */
  skipAuthRedirect?: boolean;
}

async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuthRedirect, headers: rawHeaders, ...rest } = options;
  const token = getToken();
  const skipContentType = rest.body instanceof URLSearchParams || rest.body instanceof FormData;

  const headers: Record<string, string> = { ...(rawHeaders as Record<string, string> | undefined) };
  if (!skipContentType && rest.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...rest, headers });

  if (res.status === 401 && !skipAuthRedirect) {
    clearToken();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
  }

  if (!res.ok) {
    let message = "خطایی رخ داد. لطفا دوباره تلاش کنید.";
    try {
      const data = await res.json();
      if (typeof data?.detail === "string") message = data.detail;
      else if (Array.isArray(data?.detail) && data.detail[0]?.msg) message = data.detail[0].msg;
    } catch {
      // Response body wasn't JSON (or was empty) - keep the generic message.
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

async function requestBlob(path: string): Promise<Blob> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { headers, cache: "no-store" });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
  }

  if (!res.ok) throw new Error(`دریافت فایل با خطا مواجه شد (کد ${res.status}).`);

  const blob = await res.blob();
  if (blob.size === 0) {
    throw new Error(
      `سرور فایل خالی برگردوند (کد ${res.status}، Content-Length=${res.headers.get("content-length")}). مشکل از سمت بک‌اند/پروکسی است.`
    );
  }
  return blob;
}

export const api = {
  auth: {
    async register(input: RegisterInput): Promise<User> {
      return request<User>("/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
        skipAuthRedirect: true,
      });
    },

    async login(email: string, password: string): Promise<AuthTokenResponse> {
      // The backend expects OAuth2PasswordRequestForm: form-encoded
      // "username"/"password" fields, even though we log in with email.
      const body = new URLSearchParams();
      body.set("username", email);
      body.set("password", password);
      const data = await request<AuthTokenResponse>("/auth/login", {
        method: "POST",
        body,
        skipAuthRedirect: true,
      });
      if (data?.access_token) setToken(data.access_token);
      return data;
    },

    async me(): Promise<User> {
      return request<User>("/auth/me", { skipAuthRedirect: true });
    },

    async logout(): Promise<void> {
      clearToken();
    },
  },

  notes: {
    list(params?: { subject?: string; is_saved?: boolean; search?: string }): Promise<Note[]> {
      return request<Note[]>(`/notes${qs(params)}`);
    },
    get(id: number): Promise<Note> {
      return request<Note>(`/notes/${id}`);
    },
    getBySlug(slug: string): Promise<Note> {
      return request<Note>(`/notes/slug/${encodeURIComponent(slug)}`);
    },
    personalNote(id: number): Promise<{ note_id: number; content: string }> {
      return request(`/notes/${id}/personal-note`);
    },
    savePersonalNote(id: number, content: string): Promise<{ note_id: number; content: string }> {
      return request(`/notes/${id}/personal-note`, {
        method: "PATCH",
        body: JSON.stringify({ content }),
      });
    },
    toggleSave(id: number): Promise<Note> {
      return request<Note>(`/notes/${id}/save`, { method: "PATCH" });
    },
    create(input: NoteCreateInput): Promise<Note> {
      return request<Note>("/notes", { method: "POST", body: JSON.stringify(input) });
    },
  },

  questions: {
    list(params?: {
      subject?: string;
      difficulty?: string;
      is_saved?: boolean;
      mine?: boolean;
    }): Promise<Question[]> {
      return request<Question[]>(`/questions${qs(params)}`);
    },
    get(id: number): Promise<Question> {
      return request<Question>(`/questions/${id}`);
    },
    create<T = Question>(input: QuestionCreateInput): Promise<T> {
      return request<T>("/questions", { method: "POST", body: JSON.stringify(input) });
    },
    save(id: number): Promise<ToggleSaveResult> {
      return request<ToggleSaveResult>(`/questions/${id}/save`, { method: "PATCH" });
    },
    answer(id: number, selectedOptionId: number, personalNote?: string): Promise<QuestionAnswerResult> {
      return request<QuestionAnswerResult>(`/questions/${id}/answer`, {
        method: "POST",
        body: JSON.stringify({ selected_option_id: selectedOptionId, personal_note: personalNote }),
      });
    },
  },

  exams: {
    list(params?: Record<string, QueryValue>): Promise<Exam[]> {
      return request<Exam[]>(`/exams${qs(params)}`);
    },
    get(id: number): Promise<ExamDetail> {
      return request<ExamDetail>(`/exams/${id}`);
    },
    create(input: ExamCreateInput): Promise<ExamDetail> {
      return request<ExamDetail>("/exams", { method: "POST", body: JSON.stringify(input) });
    },
    save(id: number): Promise<Exam> {
      return request<Exam>(`/exams/${id}/save`, { method: "PATCH" });
    },
    start(id: number): Promise<{ id: number; started_at: string; score?: number }> {
      return request(`/exams/${id}/attempts`, { method: "POST" });
    },
    practiceAnswer(examId: number, questionId: number, selectedOptionId: number): Promise<PracticeAnswerResult> {
      return request<PracticeAnswerResult>(`/exams/${examId}/practice-answer`, {
        method: "POST",
        body: JSON.stringify({ question_id: questionId, selected_option_id: selectedOptionId }),
      });
    },
    submit(examId: number, attemptId: number, answers: Record<string, number>): Promise<ExamResult> {
      return request<ExamResult>(`/exams/${examId}/attempts/${attemptId}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      });
    },
  },

  catalog: {
    subjects(includeInactive = false): Promise<SubjectItem[]> {
      return request<SubjectItem[]>(`/catalog/subjects${qs({ include_inactive: includeInactive || undefined })}`);
    },
    filters(scope: FilterScope | "all" = "exams", includeInactive = false): Promise<FilterDefinition[]> {
      return request<FilterDefinition[]>(
        `/catalog/filters${qs({ scope, include_inactive: includeInactive || undefined })}`
      );
    },
    createSubject(input: { slug: string; name: string }): Promise<SubjectItem> {
      return request<SubjectItem>("/catalog/subjects", { method: "POST", body: JSON.stringify(input) });
    },
    createFilter(input: {
      key: string;
      name: string;
      field_type: string;
      options: string[];
      scope: string;
    }): Promise<FilterDefinition> {
      return request<FilterDefinition>("/catalog/filters", { method: "POST", body: JSON.stringify(input) });
    },
    toggleSubject(id: number): Promise<SubjectItem> {
      return request<SubjectItem>(`/catalog/subjects/${id}`, { method: "PATCH" });
    },
    toggleFilter(id: number): Promise<FilterDefinition> {
      return request<FilterDefinition>(`/catalog/filters/${id}`, { method: "PATCH" });
    },
  },

  users: {
    getProgress(): Promise<ProgressResponse> {
      return request<ProgressResponse>("/users/progress");
    },
    getStudyStats(days: 7 | 30 = 7): Promise<StudyStats> {
      return request<StudyStats>(`/users/study-stats${qs({ days })}`);
    },
    getSaved(): Promise<SavedItem[]> {
      return request<SavedItem[]>("/users/saved");
    },
    logStudyTime(input: {
      note_id?: number | null;
      resource_id?: number | null;
      date: string;
      seconds: number;
    }): Promise<LogStudyTimeResult> {
      return request<LogStudyTimeResult>("/study/log", { method: "POST", body: JSON.stringify(input) });
    },
  },

  resources: {
    list(params?: { resource_type?: "pdf" | "image" | "all" }): Promise<Resource[]> {
      return request<Resource[]>(`/resources${qs(params)}`);
    },
    get(id: number): Promise<Resource> {
      return request<Resource>(`/resources/${id}`);
    },
    upload(input: { title: string; subject?: string | null; file: File }): Promise<Resource> {
      const formData = new FormData();
      formData.append("title", input.title);
      if (input.subject) formData.append("subject", input.subject);
      formData.append("file", input.file);
      return request<Resource>("/resources", { method: "POST", body: formData });
    },
    /** Downloads the raw file (authenticated). Use this when you need the bytes directly (e.g. handing an ArrayBuffer to pdf.js). */
    async getFileBlob(id: number): Promise<Blob> {
      try {
        return await requestBlob(`/resources/${id}/file`);
      } catch {
        // Fallback: same bytes wrapped in JSON (base64), in case the binary
        // response is swallowed by a proxy/browser extension.
        const { mime_type, data } = await request<{ mime_type: string; data: string }>(`/resources/${id}/content`);
        const binary = atob(data);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return new Blob([bytes], { type: mime_type });
      }
    },
    /** Downloads the file (authenticated) and returns a blob: URL you can hand to <img>/pdf.js.
     * Caller is responsible for calling URL.revokeObjectURL(...) when done with it. */
    async getFileUrl(id: number): Promise<string> {
      const blob = await requestBlob(`/resources/${id}/file`);
      return URL.createObjectURL(blob);
    },
    update(id: number, data: { title?: string; subject?: string | null }): Promise<Resource> {
      return request<Resource>(`/resources/${id}`, { method: "PATCH", body: JSON.stringify(data) });
    },
    updateProgress(id: number, data: { last_page?: number; total_pages?: number }): Promise<Resource> {
      return request<Resource>(`/resources/${id}/progress`, { method: "PATCH", body: JSON.stringify(data) });
    },
    remove(id: number): Promise<void> {
      return request<void>(`/resources/${id}`, { method: "DELETE" });
    },
  },
};
