"use client";

import {
  FolderKanban,
  MoreHorizontal,
  Plus,
  Star,
} from "lucide-react";

import { useDashboardHooks } from "@/app/hooks/dashboardHooks";
import { StatsCard } from "@/app/shared/ui/statsCard";
import DashboardSkeleton from "@/app/features/dashboardSkeleton";
import { PriorityBadge } from "@/app/shared/ui/priorityBadge";
import { StatusBadge } from "@/app/shared/ui/statusBadge";
import { useMemo, useState } from "react";
import { Column , ReusableTable} from "@/app/components/reusable/ReusableTable";
import { formatDateRange } from "@/app/actions/formatDateRange";
import { DashboardTask } from "@/app/services/tableData";
import { deleteTask } from "@/app/services/tableData";
import { UpdateTaskModal } from "@/app/components/reusable/UpdateTaskModal";


interface Task {
  id: string;
  title: string;
  priority: string;
  status: string;
  description: string | null;
  team?: {name: string}  | null ;
  creator?: {  firstName: string; secondName:string } | null;
  start_date?: Date | null;
  end_date?: Date | null;
  due_date?:  Date | null;
}
export default function ProjectsPage() {

    const taskColumns: Column<Task>[] = [
      { header: "Task", render: (task) => task.title ? (
          <span className="font-medium">{task.title}</span>
            ) : (
            <span className="text-slate-600 italic text-sm">No title</span>
          )
        },
  
      { header: "Priority", render: (task) => <PriorityBadge value={task.priority} /> },
      { header: "Status", render: (task) => <StatusBadge value={task.status} /> },
      { 
        header: "Description", 
        render: (task) => task.description ? (
          <div className="max-w-75 truncate text-slate-300">{task.description}</div>
        ) : (
          <div className="text-slate-600 italic text-sm">No Description</div>
        )
      },
      {
          header: "Team",
          render: (task) => task.team?.name ? (
            <span className="text-slate-300 text-sm">{task.team.name}</span>
          ) : (
            <div className="text-slate-600 italic text-sm">No team assigned</div>
          )
      },
      {
        header:"Created by",
        render:(task) => task.creator ? (
          <span className="text-slate-300 text-sm">{task.creator.firstName} {task.creator?.secondName}</span>
        ) : (
          <span  className="text-slate-600 italic text-sm">Null</span>
        )

      },
      {
        header: "Timeline",
        render: (task) => task.start_date && task.end_date ? (
          <span className="text-slate-400 text-sm">{formatDateRange(task.start_date, task.end_date)}</span>
        ) : (
          <span className="text-slate-600 italic text-sm">No date set</span>
        )
      },
      {
    header: "Actions",
    render: (item) => {
      const task = item as DashboardTask; 
      return (
        <div className="flex items-center gap-3">
          <button
            onClick={() => openUpdateModal(task)} // Tracks this task's ID for updating
            className="text-xs px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10"
          >
            Edit
          </button>
          <button
            onClick={() => openDeleteModal(task)} // Tracks this task's ID for deleting
            className="text-xs px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-300 hover:bg-rose-500/20"
          >
            Delete
          </button>
        </div>
      );
    }
  }
    ];

  const { stats, loading , table, setPage,         selectedTask,
    isUpdateModalOpen,
    setIsUpdateModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    openUpdateModal,
    openDeleteModal, refresh} = useDashboardHooks(10);
  const [isAddOpen, setIsAddOpen] = useState(false);



  if (loading && !stats) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6 overflow-hidden relative">
      <div className="fixed top-0 right-0 h-125 w-125 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/3">
            <FolderKanban className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Projects</h1>
            <p className="text-slate-400 text-sm">
              Overview of your project progress and pipeline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="rounded-xl border border-white/5 bg-white/3 p-3 text-slate-300 hover:bg-white/5 transition-all"
            type="button"
            onClick={() => setIsAddOpen(true)}
            aria-label="Add project"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button className="rounded-xl border border-white/5 bg-white/3 p-3 text-slate-300 hover:bg-white/5 transition-all">
            <Star className="h-4 w-4" />
          </button>
          <button className="rounded-xl border border-white/5 bg-white/3 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/5 transition-all">
            Share
          </button>
        </div>
      </div>


      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
        <StatsCard title="Backlog" value={stats?.backlogTasks ?? 0} />
        <StatsCard title="Todo" value={stats?.todoTasks ?? 0} />
        <StatsCard title="In Progress" value={stats?.inProgressTasks ?? 0} />
        <StatsCard title="Done" value={stats?.doneTasks ?? 0} />
      </div>

  

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-3xl border border-white/5 bg-white/3 p-5">

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wide text-slate-200">
              Active Projects
            </h2>
            <button className="text-slate-500 hover:text-slate-300 transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-white/5 bg-white/2 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Website Redesign</p>
                <span className="text-xs rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-1 font-semibold">
                  Active
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Ship improvements and polish UI components.
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/2 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Mobile App</p>
                <span className="text-xs rounded-full bg-blue-500/10 text-blue-400 px-2 py-1 font-semibold">
                  In Progress
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Implement onboarding flow and session refresh.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-white/3 p-5 xl:col-span-2">
          <h2 className="text-sm font-semibold tracking-wide text-slate-200">
            Project Pipeline
          </h2>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/5 bg-white/2 p-4">
              <p className="text-xs text-slate-400">Review</p>
              <p className="mt-1 text-2xl font-bold">{stats?.reviewTasks ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/2 p-4">
              <p className="text-xs text-slate-400">Active</p>
              <p className="mt-1 text-2xl font-bold">{stats?.activeTasks ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/2 p-4">
              <p className="text-xs text-slate-400">Todo</p>
              <p className="mt-1 text-2xl font-bold">{stats?.todoTasks ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/2 p-4">
              <p className="text-xs text-slate-400">Completed</p>
              <p className="mt-1 text-2xl font-bold">{stats?.doneTasks ?? 0}</p>
            </div>
          </div>

        </div>
      </div>
        <ReusableTable 
          title="Recent Tasks"
          data={table?.tasks}
          columns={taskColumns}
          pagination={table?.pagination}
          onPageChange={setPage}

                  
        
        />
    {isUpdateModalOpen && selectedTask && (
      <UpdateTaskModal 
        task={selectedTask}
        onClose={() => setIsUpdateModalOpen(false)}
        refresh={refresh}
      />
    )}

    {/* 2. Delete Confirmation Modal Context */}
    {isDeleteModalOpen && selectedTask && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6" role="dialog" aria-modal="true">
          <h2 className="text-lg font-bold text-rose-400">Delete Task</h2>
          <p className="text-sm text-slate-400 mt-2">
            Are you sure you want to permanently delete <strong>"{selectedTask.title}"</strong>?
          </p>
          
          <div className="flex justify-end gap-3 mt-6">
            <button className="px-4 py-2 text-sm bg-white/5 rounded-xl" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
            <button 
              className="px-4 py-2 text-sm bg-rose-600 text-white font-semibold rounded-xl" 
              onClick={async () => {
                await deleteTask(selectedTask.id); // Uses tracked ID to run the SQL delete query
                setIsDeleteModalOpen(false);
                refresh(); // Instantly removes row from UI and updates analytics graphs
              }}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

