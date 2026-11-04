import { create } from "zustand";
import { revisionsApi } from "../api/revisions.api";
import type {
  CreateRevisionGroupPayload,
  CreateRevisionItemPayload,
  ReviseItemPayload,
  RevisionGroup,
  RevisionItem,
  SortField,
  SortOrder,
  UpdateRevisionItemPayload,
} from "../types/revision.types";

export interface RevisionState {
  groups: RevisionGroup[];
  items: RevisionItem[];
  selectedGroupId: string | "all";
  searchQuery: string;
  sortBy: SortField;
  sortOrder: SortOrder;
  isLoading: boolean;
  error: string | null;

  // Filter & Sort Setters
  setSelectedGroupId: (groupId: string | "all") => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (field: SortField) => void;
  toggleSortOrder: () => void;

  // Async API Actions
  fetchInitialData: () => Promise<void>;
  fetchItems: (groupId?: string | "all") => Promise<void>;
  createGroup: (payload: CreateRevisionGroupPayload) => Promise<RevisionGroup>;
  deleteGroup: (groupId: string) => Promise<void>;
  createItem: (payload: CreateRevisionItemPayload) => Promise<RevisionItem>;
  updateItem: (
    itemId: string,
    payload: UpdateRevisionItemPayload
  ) => Promise<RevisionItem>;
  reviseItem: (
    itemId: string,
    payload?: ReviseItemPayload
  ) => Promise<RevisionItem>;
  deleteItem: (itemId: string) => Promise<void>;
}

export const useRevisionStore = create<RevisionState>((set, get) => ({
  groups: [],
  items: [],
  selectedGroupId: "all",
  searchQuery: "",
  sortBy: "created_at",
  sortOrder: "desc",
  isLoading: false,
  error: null,

  setSelectedGroupId: (groupId) => {
    set({ selectedGroupId: groupId });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSortBy: (field) => set({ sortBy: field }),

  toggleSortOrder: () =>
    set((state) => ({
      sortOrder: state.sortOrder === "asc" ? "desc" : "asc",
    })),

  fetchInitialData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [groups, items] = await Promise.all([
        revisionsApi.getGroups(),
        revisionsApi.getItems(),
      ]);
      set({ groups, items, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to load revisions data",
        isLoading: false,
      });
    }
  },

  fetchItems: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const targetGroup = groupId ?? get().selectedGroupId;
      const params =
        targetGroup !== "all" ? { group_id: targetGroup } : undefined;
      const items = await revisionsApi.getItems(params);
      set({ items, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to fetch items",
        isLoading: false,
      });
    }
  },

  createGroup: async (payload) => {
    const newGroup = await revisionsApi.createGroup(payload);
    set((state) => ({
      groups: [newGroup, ...state.groups],
      selectedGroupId: newGroup.id,
    }));
    return newGroup;
  },

  deleteGroup: async (groupId) => {
    await revisionsApi.deleteGroup(groupId);
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== groupId),
      items: state.items.filter((i) => i.group_id !== groupId),
      selectedGroupId:
        state.selectedGroupId === groupId ? "all" : state.selectedGroupId,
    }));
  },

  createItem: async (payload) => {
    const newItem = await revisionsApi.createItem(payload);
    set((state) => ({ items: [newItem, ...state.items] }));
    return newItem;
  },

  updateItem: async (itemId, payload) => {
    const updated = await revisionsApi.updateItem(itemId, payload);
    set((state) => ({
      items: state.items.map((item) => (item.id === itemId ? updated : item)),
    }));
    return updated;
  },

  reviseItem: async (itemId, payload) => {
    const updated = await revisionsApi.reviseItem(itemId, payload);
    set((state) => ({
      items: state.items.map((item) => (item.id === itemId ? updated : item)),
    }));
    return updated;
  },

  deleteItem: async (itemId) => {
    await revisionsApi.deleteItem(itemId);
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    }));
  },
}));

/**
 * Helper selector to filter items by selectedGroupId and searchQuery
 * (matches problem_url, title, and description so searching "leetcode" finds all LeetCode URLs)
 */
export function selectFilteredItems(state: RevisionState): RevisionItem[] {
  const query = state.searchQuery.trim().toLowerCase();

  return state.items
    .filter((item) => {
      const matchesGroup =
        state.selectedGroupId === "all" ||
        item.group_id === state.selectedGroupId;

      if (!matchesGroup) return false;
      if (!query) return true;

      const urlMatch = item.problem_url.toLowerCase().includes(query);
      const titleMatch = (item.title || "").toLowerCase().includes(query);
      const descMatch = (item.description || "").toLowerCase().includes(query);

      return urlMatch || titleMatch || descMatch;
    })
    .sort((a, b) => {
      const dir = state.sortOrder === "asc" ? 1 : -1;
      if (state.sortBy === "revision_count") {
        return (a.revision_count - b.revision_count) * dir;
      }
      const valA = a[state.sortBy] ? new Date(a[state.sortBy]!).getTime() : 0;
      const valB = b[state.sortBy] ? new Date(b[state.sortBy]!).getTime() : 0;
      return (valA - valB) * dir;
    });
}

