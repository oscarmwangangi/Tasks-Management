"use client";

import { useDashboardHooks } from "@/app/hooks/dashboardHooks";
import { formatDateRange } from "@/app/actions/formatDateRange";
import { DashboardTask } from "@/app/services/tableData";
import { useMemo } from "react";



function toDate(value: unknown): Date | null {
  if (!value) return null;
  const raw = value instanceof Date ? value : (value as string | number);
  const d = raw instanceof Date ? raw : new Date(raw);


  return Number.isNaN(d.getTime()) ? null : d;
}


function formatShortDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function CalenderPage() {
  const { table, loading } = useDashboardHooks(100);

  const tasks = (table?.tasks ?? []).filter((t) => {
    const start = toDate((t as any).start_date);
    const end = toDate((t as any).end_date ?? (t as any).due_date);
    return Boolean(start && end);
  }) as DashboardTask[];

  const { minDate, maxDate, rows } = useMemo(() => {
    if (!tasks.length) return { minDate: null as Date | null, maxDate: null as Date | null, rows: [] as any[] };

    const starts = tasks.map((t) => toDate((t as any).start_date)).filter(Boolean) as Date[];
    const ends = tasks.map((t) => toDate((t as any).end_date ?? (t as any).due_date)).filter(Boolean) as Date[];

    const min = new Date(Math.min(...starts.map((d) => d.getTime())));
    const max = new Date(Math.max(...ends.map((d) => d.getTime())));

    const totalMs = Math.max(1, max.getTime() - min.getTime());

    const ganttRows = tasks
      .map((task) => {
        const start = toDate((task as any).start_date);
        const end = toDate((task as any).end_date ?? (task as any).due_date);
        if (!start || !end) return null;

        const leftPct = ((start.getTime() - min.getTime()) / totalMs) * 100;
        const widthPct = ((end.getTime() - start.getTime()) / totalMs) * 100;

        // Ensure tiny ranges still show up
    const safeWidth = Math.max(2, widthPct);


        return {
          id: task.id,
          title: task.title ?? "Untitled",
          status: (task as any).status,
          start,
          end,
          leftPct,
          widthPct: safeWidth,
        };
      })
      .filter(Boolean);

    // stable ordering: earliest start first
    ganttRows.sort((a: any, b: any) => a.start.getTime() - b.start.getTime());

    return { minDate: min, maxDate: max, rows: ganttRows };
  }, [tasks]);

  const hasRange = Boolean(minDate && maxDate);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6 overflow-hidden relative">
      <div className="fixed top-0 right-0 h-125 w-125 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Calendar</h1>
        <p className="text-slate-400 text-sm mt-1">Gantt view (start → end). Each bar is labeled with the task and date range.</p>
      </div>

      {loading && !table ? (
        <div className="rounded-3xl border border-white/5 bg-white/3 p-6">Loading...</div>
      ) : !tasks.length ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/2 p-6 text-center text-sm text-slate-500">
          No tasks with start/end dates found.
        </div>
      ) : (
        <div className="rounded-3xl border border-white/5 bg-white/3 p-4 md:p-6">
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="text-sm text-slate-300">
              Date range:&nbsp;
              {hasRange && minDate && maxDate
                ? `${formatShortDate(minDate)} - ${formatShortDate(maxDate)}`
                : "—"}
            </div>
            <div className="text-xs text-slate-500">
              Showing {tasks.length} task{tasks.length === 1 ? "" : "s"}
            </div>
          </div>

          {/* Gantt header */}
          <div className="relative w-full overflow-hidden rounded-2xl border border-white/5 bg-slate-900/30">
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
              <div className="w-full sm:w-56 text-xs font-semibold text-slate-300">Tasks</div>
              <div className="flex-1 text-xs font-semibold text-slate-300">Timeline</div>
            </div>

            {/* Grid for timeline area */}
            <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
              {/* Axis */}
              <div className="px-4 py-2 border-b border-white/5 text-[11px] text-slate-500 flex items-center gap-3">
                <div className="w-full sm:w-56">{hasRange && minDate ? formatShortDate(minDate) : ""}</div>
                <div className="flex-1 relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-white/5" />
                  <div className="flex justify-between">
                    <span>{hasRange && minDate ? formatShortDate(minDate) : ""}</span>
                    <span>{hasRange && maxDate ? formatShortDate(maxDate) : ""}</span>
                  </div>
                </div>
              </div>

              <div className="px-2">
                {rows.map((row: any) => {
                  const safeLeft = Math.min(100, Math.max(0, row.leftPct));
                  const safeWidth = Math.min(100 - safeLeft, row.widthPct);

                  return (
                    <div
                      key={row.id}
                      className="relative px-2 py-3"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr",
                      }}
                    >
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "24px 1px" }}
                      />

                      <div className="relative grid grid-cols-1 sm:grid-cols-[14rem_1fr] gap-3 items-center">
                        {/* Task label */}
                        <div className="sm:pr-2">
                          <div className="text-sm font-medium text-white line-clamp-1">{row.title}</div>
                          <div className="text-[11px] text-slate-400">{formatDateRange(row.start, row.end)}</div>
                        </div>

                        {/* Bar */}
                        <div className="relative h-7">
                          <div
                            className="absolute top-1/2 -translate-y-1/2 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40"
                            style={{ left: `${safeLeft}%`, width: `${Math.max(2, safeWidth)}%` }}
                            title={`${row.title}: ${formatDateRange(row.start, row.end)}`}
                          >
                            {/* label inside bar */}
                            <div className="-mt-1 flex items-center h-7 px-2">
                              <div className="text-[9px] font-semibold text-emerald-400 whitespace-nowrap overflow-hidden text-ellipsis max-w-48">
                                {formatShortDate(row.start)} → {formatShortDate(row.end)}
                              </div>
                            </div>
                          </div>

                          {/* left/right edge markers */}
                          <div className="absolute top-0 left-0 h-full w-px bg-white/0" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

