"use client";
import { useEffect, useMemo, useState } from "react";
import { Task } from "@prisma/client";
import { getDashboardCards } from "@/app/services/dashboardCards";
import { doughnutData } from "@/app/services/doughnutData";
import { tableData } from "@/app/services/tableData";

export function useDashboardHooks(customPageSize:number) {
  const [stats, setStats] = useState<any>(null);
  const [priority, setPriority] = useState<any>(null);
  const [table, setTable] = useState<{
    tasks: Task[];
    pagination: any;
  } | null>(null);

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    const size = customPageSize || 5;
    try {
      setLoading(true);
      const [statsData, priorityData, taskData] = await Promise.all([
        getDashboardCards(),
        doughnutData(),
        tableData(page, size),
      ]);

      setStats(statsData);
      setPriority(priorityData);
      setTable(taskData);
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, [page]);

  // Polar Area Chart Data
  const polarData = useMemo(
    () => ({
      labels: ["Backlog", "Todo", "In Progress", "Active", "Done", "Review"],
      datasets: [
        {
          data: [
            stats?.backlogTasks || 0,
            stats?.todoTasks || 0,
            stats?.inProgressTasks || 0,
            stats?.activeTasks || 0,
            stats?.doneTasks || 0,
            stats?.reviewTasks || 0,
          ],
          backgroundColor: [
            "#3B82F6",
            "#8B5CF6",
            "#06B6D4",
            "#10B981",
            "#E2E8F0",
            "#14B8A6",
          ],
          borderWidth: 0,
        },
      ],
    }),
    [stats]
  );

  // Doughnut Chart Data
  const doughnutChartData = useMemo(
    () => ({
      labels: ["High", "Medium", "Low"],
      datasets: [
        {
          data: [
            Number(priority?.highStatus ?? 0),
            Number(priority?.mediumStatus ?? 0),
            Number(priority?.lowStatus ?? 0),
          ],
          backgroundColor: ["#10B981", "#3B82F6", "#8B5CF6"],
          borderWidth: 0,
          hoverOffset: 10,
        },
      ],
    }),
    [priority]
  );

  // Common Chart Options
  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: {
            color: "#CBD5E1",
            padding: 18,
            usePointStyle: true,
            font: { size: 12 },
          },
        },
      },
      scales: {
        r: {
          ticks: { display: false },
          grid: { color: "rgba(255,255,255,0.06)" },
          angleLines: { color: "rgba(255,255,255,0.06)" },
        },
      },
    }),
    []
  );

  const doughnutOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: "75%",
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: {
            color: "#CBD5E1",
            usePointStyle: true,
            padding: 20,
          },
        },
      },
    }),
    []
  );

  return {
    stats,
    priority,
    table,
    page,
    setPage,
    loading,
    polarData,
    doughnutChartData,
    chartOptions,
    doughnutOptions,
    refresh: loadDashboard, // Helper to manually refresh data
  };
}