import React, { useEffect, useState } from "react";
import { Check, FileText, X } from "lucide-react";
import { useUIStore } from "../../../app/stores/useUIStore";
import {
  REVISION_INTERVAL_PRESETS,
  getDateInputAfterDays,
  getIsoAfterDays,
} from "../../../shared/utils/dateUtils";
import { createItemSchema } from "../schemas/revision.schema";
import { useRevisionStore } from "../stores/useRevisionStore";

export const InlineProblemCreator: React.FC = () => {
  const { groups, selectedGroupId, createItem } = useRevisionStore();
  const {
    closeInlineCreator,
    draftDescription,
    openDraftDescriptionModal,
  } = useUIStore();

  const defaultGroupId =
    selectedGroupId !== "all" ? selectedGroupId : groups[0]?.id || "";

  const [groupId, setGroupId] = useState<string>(defaultGroupId);
  const [title, setTitle] = useState("");
  const [problemUrl, setProblemUrl] = useState("");
  const [intervalOption, setIntervalOption] = useState<string>("7");
  const [customDate, setCustomDate] = useState<string>(
    getDateInputAfterDays(7)
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!groupId && groups.length > 0) {
      setGroupId(
        selectedGroupId !== "all" ? selectedGroupId : groups[0].id
      );
    }
  }, [groups, selectedGroupId, groupId]);

  const computeNextRevisionIso = (): string | null => {
    if (intervalOption === "custom") {
      return customDate
        ? new Date(`${customDate}T09:00:00Z`).toISOString()
        : null;
    }
    const days = Number(intervalOption) || 7;
    return getIsoAfterDays(days);
  };

  const handleSave = async () => {
    setError(null);
    const nextRevisionIso = computeNextRevisionIso();

    const parsed = createItemSchema.safeParse({
      group_id: groupId,
      title: title.trim() || null,
      problem_url: problemUrl.trim(),
      description: draftDescription.trim() || null,
      next_revision_at: nextRevisionIso,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid input");
      return;
    }

    try {
      setIsSubmitting(true);
      await createItem(parsed.data);
      closeInlineCreator();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to add problem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      closeInlineCreator();
    }
  };

  return (
    <tr className="bg-zinc-900/80 border-b border-zinc-800/80">
      <td colSpan={5} className="px-4 py-3">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Group Selector */}
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
            >
              <option value="" disabled>
                Select Group...
              </option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            {/* Problem Title Input */}
            <input
              type="text"
              placeholder="Problem title (optional)..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 w-48 focus:outline-none focus:border-zinc-600"
              autoFocus
            />

            {/* Problem URL Input */}
            <input
              type="url"
              placeholder="Paste problem URL (https://leetcode.com/problems/...) and press Enter"
              value={problemUrl}
              onChange={(e) => setProblemUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 min-w-[220px] bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />

            {/* Revision Interval Selector */}
            <select
              value={intervalOption}
              onChange={(e) => setIntervalOption(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
              title="Revision interval"
            >
              {REVISION_INTERVAL_PRESETS.map((preset) => (
                <option key={preset.days} value={String(preset.days)}>
                  {preset.label}
                </option>
              ))}
              <option value="custom">Custom Date...</option>
            </select>

            {intervalOption === "custom" && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-md px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
              />
            )}

            {/* Open Modal to Add Description */}
            <button
              type="button"
              onClick={openDraftDescriptionModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs transition ${
                draftDescription
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                  : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200"
              }`}
              title="Add or edit description notes"
            >
              <FileText className="w-3.5 h-3.5" />
              {draftDescription ? "Notes Added" : "+ Notes"}
            </button>

            {/* Save & Cancel */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="flex items-center gap-1 bg-zinc-100 hover:bg-white text-zinc-950 font-medium px-3 py-1.5 rounded-md text-xs transition disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              Save
            </button>
            <button
              type="button"
              onClick={closeInlineCreator}
              className="p-1.5 rounded-md border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200"
              title="Cancel (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}
        </div>
      </td>
    </tr>
  );
};

