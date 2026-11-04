import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { CalendarClock, Folder, LayoutGrid, Plus, Trash2 } from "lucide-react";
import { useUIStore } from "../../app/stores/useUIStore";
import { useRevisionStore } from "../../features/revisions/stores/useRevisionStore";
import { getRevisionStatus } from "../utils/dateUtils";

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const {
    groups,
    items,
    selectedGroupId,
    setSelectedGroupId,
    deleteGroup,
  } = useRevisionStore();
  const { openGroupModal } = useUIStore();

  const dueCount = items.filter(
    (item) => getRevisionStatus(item.next_revision_at).isDue
  ).length;

  const handleSelectGroup = (groupId: string | "all") => {
    setSelectedGroupId(groupId);
    navigate("/");
  };

  return (
    <aside className="w-60 shrink-0 border-r border-zinc-900 bg-[#070709] flex flex-col justify-between min-h-screen px-3.5 py-5 select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2.5 mb-7">
          <span className="font-mono text-lg font-bold tracking-tight text-zinc-100">
            recall<span className="text-amber-500">.</span>
          </span>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1">
          <NavLink
            to="/"
            end
            onClick={() => setSelectedGroupId("all")}
            className={({ isActive }) =>
              `flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition ${
                isActive && selectedGroupId === "all"
                  ? "bg-zinc-900 text-zinc-100"
                  : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
              }`
            }
          >
            <span className="flex items-center gap-2.5">
              <LayoutGrid className="h-4 w-4 text-zinc-400" />
              Lists / All Problems
            </span>
            <span className="text-[11px] text-zinc-500">{items.length}</span>
          </NavLink>

          <NavLink
            to="/daily-revision"
            className={({ isActive }) =>
              `flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition ${
                isActive
                  ? "bg-zinc-900 text-zinc-100"
                  : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
              }`
            }
          >
            <span className="flex items-center gap-2.5">
              <CalendarClock className="h-4 w-4 text-zinc-400" />
              Daily Revision
            </span>
            {dueCount > 0 && (
              <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 text-[10px] font-semibold text-amber-400">
                {dueCount}
              </span>
            )}
          </NavLink>
        </nav>

        {/* Groups Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between px-2.5 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Groups
            </span>
            <button
              type="button"
              onClick={openGroupModal}
              className="rounded p-0.5 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200 transition"
              title="Create new group"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-0.5 max-h-72 overflow-y-auto">
            {groups.length === 0 ? (
              <p className="px-2.5 py-2 text-[11px] text-zinc-600">
                No groups yet
              </p>
            ) : (
              groups.map((group) => {
                const isSelected = selectedGroupId === group.id;
                return (
                  <div
                    key={group.id}
                    className={`group flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition cursor-pointer ${
                      isSelected
                        ? "bg-zinc-900 text-zinc-100 font-medium"
                        : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
                    }`}
                    onClick={() => handleSelectGroup(group.id)}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Folder className="h-3.5 w-3.5 shrink-0 text-amber-500/80" />
                      <span className="truncate">{group.name}</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteGroup(group.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-rose-400 transition"
                      title="Delete group"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-900 pt-3 px-2">
        <p className="text-[11px] text-zinc-600">Spaced Repetition MVP</p>
      </div>
    </aside>
  );
};

