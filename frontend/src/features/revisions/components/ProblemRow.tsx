import React from "react";
import { ExternalLink, FileText, Trash2 } from "lucide-react";
import { useUIStore } from "../../../app/stores/useUIStore";
import {
  formatIntervalLabel,
  formatShortDate,
  getRevisionStatus,
  inferIntervalDays,
} from "../../../shared/utils/dateUtils";
import { useRevisionStore } from "../stores/useRevisionStore";
import type { RevisionItem } from "../types/revision.types";
import { RevisePopover } from "./RevisePopover";

interface ProblemRowProps {
  item: RevisionItem;
  index: number;
}

export const ProblemRow: React.FC<ProblemRowProps> = ({ item, index }) => {
  const { groups, deleteItem } = useRevisionStore();
  const { openDescriptionModal } = useUIStore();

  const groupName =
    groups.find((g) => g.id === item.group_id)?.name || "Unknown Group";
  const status = getRevisionStatus(item.next_revision_at);
  const intervalDays = inferIntervalDays(
    item.next_revision_at,
    item.last_revised_at,
    item.solved_at
  );

  return (
    <tr className="group border-b border-zinc-900 hover:bg-zinc-900/40 transition">
      {/* 1. Problem Title & URL */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-600 w-5">{index + 1}</span>
          <div className="flex flex-col min-w-0">
            <a
              href={item.problem_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-zinc-200 hover:text-white truncate max-w-md"
            >
              <span className="truncate">
                {item.title || item.problem_url}
              </span>
              <ExternalLink className="h-3 w-3 shrink-0 text-zinc-500 opacity-0 group-hover:opacity-100 transition" />
            </a>
            {item.title && (
              <span className="text-[11px] text-zinc-500 truncate max-w-md">
                {item.problem_url}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* 2. Group Badge */}
      <td className="px-4 py-3.5">
        <span className="inline-flex items-center rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
          {groupName}
        </span>
      </td>

      {/* 3. Revision Count & Current Interval */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center rounded-md bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
            {item.revision_count}x revised
          </span>
          <span className="inline-flex items-center rounded-md bg-zinc-900/50 border border-zinc-800/60 px-1.5 py-0.5 text-[11px] text-zinc-500">
            {formatIntervalLabel(intervalDays)}
          </span>
        </div>
      </td>

      {/* 4. Next Revision Status */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${status.dotClass}`} />
          <div className="flex flex-col">
            <span className={`text-xs font-medium ${status.colorClass}`}>
              {status.label}
            </span>
            <span className="text-[11px] text-zinc-600">
              {formatShortDate(item.next_revision_at)}
            </span>
          </div>
        </div>
      </td>

      {/* 5. Actions (Notes Modal, Revise Popover, Delete) */}
      <td className="px-4 py-3.5 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => openDescriptionModal(item)}
            className={`p-1.5 rounded-md border transition ${
              item.description
                ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                : "border-zinc-800 bg-zinc-900/60 text-zinc-500 hover:text-zinc-300"
            }`}
            title={item.description ? "View/Edit Notes" : "Add Notes"}
          >
            <FileText className="h-3.5 w-3.5" />
          </button>

          <RevisePopover item={item} />

          <button
            type="button"
            onClick={() => deleteItem(item.id)}
            className="p-1.5 rounded-md text-zinc-600 hover:text-rose-400 hover:bg-zinc-900 transition"
            title="Delete item"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
