import React from "react";
import { useUIStore } from "../../../app/stores/useUIStore";
import type { RevisionItem } from "../types/revision.types";
import { InlineProblemCreator } from "./InlineProblemCreator";
import { ProblemRow } from "./ProblemRow";

interface ProblemTableProps {
  items: RevisionItem[];
  isLoading: boolean;
  emptyMessage?: string;
}

export const ProblemTable: React.FC<ProblemTableProps> = ({
  items,
  isLoading,
  emptyMessage = 'No problems found. Click "+ New Problem" to add one.',
}) => {
  const { isInlineCreatorOpen } = useUIStore();

  return (
    <div className="overflow-visible rounded-xl border border-zinc-900 bg-zinc-950/60">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-900 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            <th className="px-4 py-3">Problem</th>
            <th className="px-4 py-3">Group</th>
            <th className="px-4 py-3">Revisions</th>
            <th className="px-4 py-3">Status / Next Revision</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isInlineCreatorOpen && <InlineProblemCreator />}

          {isLoading ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-10 text-center text-xs text-zinc-500"
              >
                Loading revision items...
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-10 text-center text-xs text-zinc-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            items.map((item, idx) => (
              <ProblemRow key={item.id} item={item} index={idx} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

