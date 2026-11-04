import React, { useEffect } from "react";
import { ArrowUpDown, FolderPlus, Plus, Search } from "lucide-react";
import { useUIStore } from "../../../app/stores/useUIStore";
import { DescriptionModal } from "../components/DescriptionModal";
import { GroupModal } from "../components/GroupModal";
import { ProblemTable } from "../components/ProblemTable";
import {
  selectFilteredItems,
  useRevisionStore,
} from "../stores/useRevisionStore";
import type { SortField } from "../types/revision.types";

export const RevisionsPage: React.FC = () => {
  const state = useRevisionStore();
  const {
    groups,
    selectedGroupId,
    searchQuery,
    sortBy,
    isLoading,
    setSelectedGroupId,
    setSearchQuery,
    setSortBy,
    toggleSortOrder,
    fetchInitialData,
  } = state;

  const { openInlineCreator, openGroupModal } = useUIStore();

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const filteredItems = selectFilteredItems(state);
  const activeGroupName =
    selectedGroupId === "all"
      ? "All Problems"
      : groups.find((g) => g.id === selectedGroupId)?.name || "Group";

  return (
    <div className="flex-1 min-h-screen bg-[#0a0a0c] text-zinc-100 px-8 py-7">
      <div className="mx-auto max-w-6xl">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500 font-mono">recall</span>
            <span className="text-zinc-600">/</span>
            <span className="font-semibold text-zinc-100">
              {activeGroupName}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={openGroupModal}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white transition"
            >
              <FolderPlus className="h-3.5 w-3.5" />
              New Group
            </button>

            <button
              type="button"
              onClick={openInlineCreator}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-zinc-100 hover:bg-zinc-800 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              New Problem
            </button>
          </div>
        </div>

        {/* Search, Group Dropdown & Sort Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {/* Text Filter (matches problem_url, title, description) */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search links (e.g. leetcode) or titles..."
              className="w-full rounded-lg border border-zinc-800/90 bg-zinc-900/50 pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none"
            />
          </div>

          {/* Group Filter Dropdown */}
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

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortField)}
            className="rounded-lg border border-zinc-800/90 bg-zinc-900/50 px-3 py-1.5 text-xs text-zinc-300 focus:border-zinc-700 focus:outline-none"
          >
            <option value="created_at">Sort: Date Added</option>
            <option value="next_revision_at">Sort: Next Revision</option>
            <option value="revision_count">Sort: Revision Count</option>
          </select>

          <button
            type="button"
            onClick={toggleSortOrder}
            className="rounded-lg border border-zinc-800/90 bg-zinc-900/50 p-1.5 text-zinc-400 hover:text-zinc-200"
            title="Toggle sort direction"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Problems Table */}
        <ProblemTable items={filteredItems} isLoading={isLoading} />
      </div>

      {/* Modals */}
      <DescriptionModal />
      <GroupModal />
    </div>
  );
};

