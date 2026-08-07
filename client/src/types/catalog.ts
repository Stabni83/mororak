export type FilterFieldType = "select" | "multi_select" | "number" | "text" | "boolean";
export type FilterScope = "exams" | "notes" | "questions" | "all";

export interface SubjectItem {
  id: number;
  slug: string;
  name: string;
  position: number;
  is_active: boolean;
}

export interface FilterDefinition {
  id: number;
  key: string;
  name: string;
  field_type: FilterFieldType;
  options: string[];
  scope: FilterScope;
  position: number;
  is_active: boolean;
}
