import React, { useEffect } from "react";
import { Search } from "lucide-react";
import { getRevisionStatus } from "../../../shared/utils/dateUtils";
import { DescriptionModal } from "../components/DescriptionModal";
import { GroupModal } from "../components/GroupModal";
import { ProblemTable } from "../components/ProblemTable";
import {
  selectFilteredItems,
  useRevisionStore,
} from "../stores/useRevisionStore";

export const DailyRevisionPage: React.FC = () => {
  const state = useRevisionStore();
  const {
    groups,
    selectedGroupId,
    searchQuery,
    isLoading,
    setSelectedGroupId,
    setSearchQuery,
    fetchInitialData,
  } = state;

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const dueItems = selectFilteredItems(state).filter(
    (item) => getRevisionStatus(item.next_revision_at).isDue
  );

  return (
    <div className="flex-1 min-h-screen bg-[#0a0a0c] text-zinc-100 px-8 py-7">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500 font-mono">recall</span>
            <span className="text-zinc-600">/</span>
            <span className="font-semibold text-zinc-100">Daily Revision</span>
          </div>
          <span className="text-xs text-zinc-400">
            {dueItems.length} item{dueItems.length === 1 ? "" : "s"} due for
            revision
          </span>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search due items or links (e.g. leetcode)..."
              className="w-full rounded-lg border border-zinc-800/90 bg-zinc-900/50 pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none"
            />
          </div>

          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="rounded-lg border border-zinc-800/90 bg-zinc-900/50 px-3 py-1.5 text-xs text-zinc-300 focus:border-zinc-700 focus:outline-none"
          >
            <option value="all">Filter: All Groups</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                Group: {group.name}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <ProblemTable
          items={dueItems}
          isLoading={isLoading}
          emptyMessage="You're all caught up! No items are due for revision right now."
        />
      </div>

      <DescriptionModal />
      <GroupModal />
    </div>
  );
};

