/**
 * TypeScript type for a user-uploaded resource (PDF/image), mirroring
 * backend/schemas/resource.py:ResourceResponse.
 */

export type ResourceType = "pdf" | "image";

export interface Resource {
  id: number;
  title: string;
  subject?: string | null;
  resource_type: ResourceType;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  last_page?: number | null;
  total_pages?: number | null;
  created_at?: string;
  last_viewed_at?: string | null;
}
