/**
 * TypeScript type for the authenticated User, mirroring backend/schemas/user.py.
 */

export interface User { id: number; name: string; email: string; is_admin: boolean; created_at?: string; }
