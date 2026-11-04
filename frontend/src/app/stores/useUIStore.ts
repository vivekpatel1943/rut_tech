import { create } from "zustand";
import type { RevisionItem } from "../../features/revisions/types/revision.types";

interface UIState {
  isInlineCreatorOpen: boolean;
  isGroupModalOpen: boolean;
  activeDescriptionItem: RevisionItem | null;
  draftDescription: string;
  isDraftDescriptionModalOpen: boolean;

  openInlineCreator: () => void;
  closeInlineCreator: () => void;
  openGroupModal: () => void;
  closeGroupModal: () => void;

  // Opens modal to view/edit description of an existing saved item
  openDescriptionModal: (item: RevisionItem) => void;
  closeDescriptionModal: () => void;

  // Opens modal to write description while creating a new inline item
  openDraftDescriptionModal: () => void;
  closeDraftDescriptionModal: () => void;
  setDraftDescription: (text: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isInlineCreatorOpen: false,
  isGroupModalOpen: false,
  activeDescriptionItem: null,
  draftDescription: "",
  isDraftDescriptionModalOpen: false,

  openInlineCreator: () => set({ isInlineCreatorOpen: true }),
  closeInlineCreator: () =>
    set({ isInlineCreatorOpen: false, draftDescription: "" }),

  openGroupModal: () => set({ isGroupModalOpen: true }),
  closeGroupModal: () => set({ isGroupModalOpen: false }),

  openDescriptionModal: (item) => set({ activeDescriptionItem: item }),
  closeDescriptionModal: () => set({ activeDescriptionItem: null }),

  openDraftDescriptionModal: () => set({ isDraftDescriptionModalOpen: true }),
  closeDraftDescriptionModal: () => set({ isDraftDescriptionModalOpen: false }),
  setDraftDescription: (text) => set({ draftDescription: text }),
}));

