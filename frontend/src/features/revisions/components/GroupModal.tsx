import React, { useState } from "react";
import { X } from "lucide-react";
import { useUIStore } from "../../../app/stores/useUIStore";
import { createGroupSchema } from "../schemas/revision.schema";
import { useRevisionStore } from "../stores/useRevisionStore";

export const GroupModal: React.FC = () => {
  const { isGroupModalOpen, closeGroupModal } = useUIStore();
  const { createGroup } = useRevisionStore();

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isGroupModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = createGroupSchema.safeParse({ name });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid group name");
      return;
    }

    try {
      setIsSubmitting(true);
      await createGroup(parsed.data);
      setName("");
      closeGroupModal();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create group");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <h3 className="text-sm font-semibold text-zinc-100">
            Create Revision Group
          </h3>
          <button
            type="button"
            onClick={closeGroupModal}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4">
          <label className="block text-xs text-zinc-400 mb-1.5">
            Group Name
          </label>
          <input
            type="text"
            placeholder="e.g. DSA Practice, Final Exams..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
            autoFocus
          />
          {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={closeGroupModal}
            className="rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-zinc-100 px-3.5 py-1.5 text-xs font-medium text-zinc-950 hover:bg-white disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Group"}
          </button>
        </div>
      </form>
    </div>
  );
};

