import React, { useEffect, useState } from "react";
import { Calendar, CheckCircle2 } from "lucide-react";
import {
  REVISION_INTERVAL_PRESETS,
  getDateInputAfterDays,
  getIsoAfterDays,
  inferIntervalDays,
} from "../../../shared/utils/dateUtils";
import { useRevisionStore } from "../stores/useRevisionStore";
import type { RevisionItem } from "../types/revision.types";

interface RevisePopoverProps {
  item: RevisionItem;
}

export const RevisePopover: React.FC<RevisePopoverProps> = ({ item }) => {
  const { reviseItem } = useRevisionStore();
  const [isOpen, setIsOpen] = useState(false);

  const inferredDays = inferIntervalDays(
    item.next_revision_at,
    item.last_revised_at,
    item.solved_at
  );

  const [selectedDays, setSelectedDays] = useState<number | "custom">(
    REVISION_INTERVAL_PRESETS.some((p) => p.days === inferredDays)
      ? inferredDays
      : "custom"
  );
  const [customDate, setCustomDate] = useState(
    getDateInputAfterDays(inferredDays)
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const days = inferIntervalDays(
        item.next_revision_at,
        item.last_revised_at,
        item.solved_at
      );
      const isPreset = REVISION_INTERVAL_PRESETS.some((p) => p.days === days);
      setSelectedDays(isPreset ? days : "custom");
      setCustomDate(getDateInputAfterDays(days));
    }
  }, [isOpen, item.next_revision_at, item.last_revised_at, item.solved_at]);

  const handleSelectPreset = (days: number) => {
    setSelectedDays(days);
    setCustomDate(getDateInputAfterDays(days));
  };

  const handleConfirmRevision = async () => {
    try {
      setIsLoading(true);
      const isoDate =
        selectedDays !== "custom"
          ? getIsoAfterDays(selectedDays)
          : customDate
          ? new Date(`${customDate}T09:00:00Z`).toISOString()
          : null;

      await reviseItem(item.id, { next_revision_at: isoDate });
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-300 hover:border-zinc-700 hover:text-white transition"
        title="Mark as revised & schedule next revision"
      >
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
        Revise
      </button>

      {isOpen && (
        <div className="absolute right-0 z-30 mt-1.5 w-68 rounded-lg border border-zinc-800 bg-zinc-950 p-3.5 shadow-xl text-left">
          <p className="text-xs font-medium text-zinc-200 mb-2 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
            Next Revision Interval
          </p>

          {/* Interval Preset Pills: 1d, 2d, 7d, 10d, 30d */}
          <div className="grid grid-cols-5 gap-1 mb-3">
            {REVISION_INTERVAL_PRESETS.map((preset) => {
              const isActive = selectedDays === preset.days;
              return (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => handleSelectPreset(preset.days)}
                  className={`rounded-md py-1 text-[11px] font-medium border transition ${
                    isActive
                      ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                      : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                  }`}
                  title={preset.label}
                >
                  {preset.shortLabel}
                </button>
              );
            })}
          </div>

          {/* Custom Date Input */}
          <label className="block text-[11px] text-zinc-500 mb-1">
            Or pick a specific date:
          </label>
          <input
            type="date"
            value={customDate}
            onChange={(e) => {
              setSelectedDays("custom");
              setCustomDate(e.target.value);
            }}
            className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-100 focus:border-zinc-600 focus:outline-none"
          />

          <div className="mt-3 flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmRevision}
              disabled={isLoading}
              className="rounded bg-emerald-500 px-2.5 py-1 text-xs font-medium text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
            >
              {isLoading ? "..." : "Confirm"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
