import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useUIStore } from "../../../app/stores/useUIStore";
import { useRevisionStore } from "../stores/useRevisionStore";

export const DescriptionModal: React.FC = () => {
  const {
    activeDescriptionItem,
    closeDescriptionModal,
    isDraftDescriptionModalOpen,
    closeDraftDescriptionModal,
    draftDescription,
    setDraftDescription,
  } = useUIStore();

  const { updateItem } = useRevisionStore();
  const [text, setText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isOpen = Boolean(activeDescriptionItem) || isDraftDescriptionModalOpen;

  useEffect(() => {
    if (activeDescriptionItem) {
      setText(activeDescriptionItem.description || "");
    } else if (isDraftDescriptionModalOpen) {
      setText(draftDescription);
    }
  }, [activeDescriptionItem, isDraftDescriptionModalOpen, draftDescription]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (activeDescriptionItem) closeDescriptionModal();
    if (isDraftDescriptionModalOpen) closeDraftDescriptionModal();
  };

  const handleSave = async () => {
    if (isDraftDescriptionModalOpen) {
      setDraftDescription(text);
      closeDraftDescriptionModal();
      return;
    }

    if (activeDescriptionItem) {
      try {
        setIsSaving(true);
        await updateItem(activeDescriptionItem.id, {
          description: text.trim() || null,
        });
        closeDescriptionModal();
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">
              {activeDescriptionItem
                ? activeDescriptionItem.title || "Problem Notes"
                : "Add Notes for New Problem"}
            </h3>
            <p className="text-xs text-zinc-500">
              Write personal hints, time complexity, or approach notes
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <textarea
          rows={7}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your notes, hints, or key takeaways here..."
          className="mt-4 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
          autoFocus
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-md bg-zinc-100 px-3.5 py-1.5 text-xs font-medium text-zinc-950 hover:bg-white disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Notes"}
          </button>
        </div>
      </div>
    </div>
  );
};

