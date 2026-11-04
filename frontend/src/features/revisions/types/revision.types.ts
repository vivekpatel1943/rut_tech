export interface RevisionGroup {
  id: string; // UUID
  name: string;
  created_at: string;
}

export interface RevisionItem {
  id: string; // UUID
  group_id: string; // UUID
  title: string | null;
  description: string | null;
  problem_url: string;
  platform: string | null;
  solved_at: string | null;
  last_revised_at: string | null;
  next_revision_at: string | null;
  revision_count: number;
  created_at: string;
}

export interface RevisionGroupWithItems extends RevisionGroup {
  items: RevisionItem[];
}

export interface CreateRevisionGroupPayload {
  name: string;
}

export interface CreateRevisionItemPayload {
  group_id: string;
  title?: string | null;
  description?: string | null;
  problem_url: string;
  next_revision_at?: string | null;
}

export interface UpdateRevisionItemPayload {
  group_id?: string;
  title?: string | null;
  description?: string | null;
  problem_url?: string;
  next_revision_at?: string | null;
}

export interface ReviseItemPayload {
  next_revision_at?: string | null;
  description?: string | null;
}

export type SortField = "next_revision_at" | "created_at" | "revision_count";
export type SortOrder = "asc" | "desc";

