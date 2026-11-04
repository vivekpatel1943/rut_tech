export interface IntervalPreset {
  label: string;
  shortLabel: string;
  days: number;
}

export const REVISION_INTERVAL_PRESETS: IntervalPreset[] = [
  { label: "Daily (1 day)", shortLabel: "1d", days: 1 },
  { label: "Every 2 Days", shortLabel: "2d", days: 2 },
  { label: "Weekly (7 days)", shortLabel: "7d", days: 7 },
  { label: "Every 10 Days", shortLabel: "10d", days: 10 },
  { label: "Monthly (30 days)", shortLabel: "30d", days: 30 },
];

export function getDateInputAfterDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export function getIsoAfterDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function getDefaultNextWeekInputDate(): string {
  return getDateInputAfterDays(7);
}

/**
 * Infers the item's revision interval (in days) from existing DB timestamps
 * without requiring any extra database column.
 */
export function inferIntervalDays(
  nextRevisionAt: string | null,
  lastRevisedAt: string | null,
  solvedAt: string | null
): number {
  const baseDateStr = lastRevisedAt || solvedAt;
  if (!nextRevisionAt || !baseDateStr) return 7;

  const nextMs = new Date(nextRevisionAt).getTime();
  const baseMs = new Date(baseDateStr).getTime();
  const diffDays = Math.round((nextMs - baseMs) / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 7;
}

export function formatIntervalLabel(days: number): string {
  if (days === 1) return "Daily";
  if (days === 7) return "Weekly";
  if (days === 30) return "Monthly";
  return `Every ${days}d`;
}

export function getRevisionStatus(nextRevisionAt: string | null): {
  label: string;
  isDue: boolean;
  colorClass: string;
  dotClass: string;
} {
  if (!nextRevisionAt) {
    return {
      label: "Not scheduled",
      isDue: false,
      colorClass: "text-zinc-500",
      dotClass: "bg-zinc-600",
    };
  }

  const now = new Date();
  const target = new Date(nextRevisionAt);
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `Overdue by ${Math.abs(diffDays)}d`,
      isDue: true,
      colorClass: "text-rose-400",
      dotClass: "bg-rose-500",
    };
  }
  if (diffDays === 0) {
    return {
      label: "Due Today",
      isDue: true,
      colorClass: "text-amber-400",
      dotClass: "bg-amber-400",
    };
  }
  return {
    label: `In ${diffDays} day${diffDays === 1 ? "" : "s"}`,
    isDue: false,
    colorClass: "text-zinc-400",
    dotClass: "bg-emerald-500",
  };
}

export function formatShortDate(isoDate: string | null): string {
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
