import api from "../../../shared/api/api";
import type {
  CreateRevisionGroupPayload,
  CreateRevisionItemPayload,
  ReviseItemPayload,
  RevisionGroup,
  RevisionItem,
  UpdateRevisionItemPayload,
} from "../types/revision.types";

export const revisionsApi = {
  // ── Groups ────────────────────────────────────────────────
  getGroups: async (): Promise<RevisionGroup[]> => {
    const { data } = await api.get<RevisionGroup[]>("/revisions/groups");
    return data;
  },

  createGroup: async (
    payload: CreateRevisionGroupPayload
  ): Promise<RevisionGroup> => {
    const { data } = await api.post<RevisionGroup>(
      "/revisions/groups",
      payload
    );
    return data;
  },

  deleteGroup: async (groupId: string): Promise<void> => {
    await api.delete(`/revisions/groups/${groupId}`);
  },

  // ── Items ─────────────────────────────────────────────────
  getItems: async (params?: {
    group_id?: string;
    due_only?: boolean;
  }): Promise<RevisionItem[]> => {
    const { data } = await api.get<RevisionItem[]>("/revisions/items", {
      params,
    });
    return data;
  },

  createItem: async (
    payload: CreateRevisionItemPayload
  ): Promise<RevisionItem> => {
    const { data } = await api.post<RevisionItem>("/revisions/items", payload);
    return data;
  },

  updateItem: async (
    itemId: string,
    payload: UpdateRevisionItemPayload
  ): Promise<RevisionItem> => {
    const { data } = await api.patch<RevisionItem>(
      `/revisions/items/${itemId}`,
      payload
    );
    return data;
  },

  reviseItem: async (
    itemId: string,
    payload?: ReviseItemPayload
  ): Promise<RevisionItem> => {
    const { data } = await api.patch<RevisionItem>(
      `/revisions/items/${itemId}/revise`,
      payload || {}
    );
    return data;
  },

  deleteItem: async (itemId: string): Promise<void> => {
    await api.delete(`/revisions/items/${itemId}`);
  },
};

