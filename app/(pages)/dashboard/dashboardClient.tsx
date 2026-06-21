"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Layers,
  CheckSquare,
  Copy,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Session } from "next-auth";
import {
  createUserByAdmin,
  generateInviteLink,
  listSectionUsers,
  listSectionTeams,
  listSectionTasks,
  deleteUserByAdmin,
} from "@/app/actions/adminActions";
import { useDashboardHooks } from "@/app/hooks/dashboardHooks";
import AnalyticsDashboard from "@/app/components/reusable/AnalyticsDashboard";

interface User {
  id: string;
  firstName: string;
  secondName: string;
  email: string;
  role: string;
  created_at: Date;
}

export default function DashboardClient({ session }: { session: Session }) {
  
  const isAdmin = session.user.role === "admin" || session.user.role === "super_admin";

  if (isAdmin) {
    return <AdminPanel session={session} />;
  }

  return <UserWorkspace session={session} />;
  
}

function AdminPanel({ session }: { session: Session }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTeams: 0,
    openTasks: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPagination, setUsersPagination] = useState<any>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    secondName: "",
    email: "",
    role: "user",
  });
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState(false);

  const [inviteLinkUrl, setInviteLinkUrl] = useState("");
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
    const { table, loading,  priority, polarData, doughnutChartData, chartOptions, doughnutOptions } = useDashboardHooks(10);

  useEffect(() => {
    loadAdminData();
  }, [usersPage]);

  async function loadAdminData() {
    try {
      setUsersLoading(true);
      const [usersRes, teamsRes, tasksRes] = await Promise.all([
        listSectionUsers(usersPage, 10),
        listSectionTeams(),
        listSectionTasks(),
      ]);

      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data.users);
        setUsersPagination(usersRes.data.pagination);
      }

      if (teamsRes.success) {
        setStats((prev) => ({ ...prev, activeTeams: teamsRes.data?.count || 0 }));
      }

      if (tasksRes.success) {
        setStats((prev) => ({ ...prev, openTasks: tasksRes.data?.count || 0 }));
      }

      setStats((prev) => ({
        ...prev,
        totalUsers: usersRes.data?.pagination?.totalItems || 0,
      }));
    } catch (error) {
      console.error("Load admin data error:", error);
    } finally {
      setUsersLoading(false);
    }
  }

  async function handleCreateUser() {
    setCreateError("");
    setCreateSuccess(false);
    setGeneratedPassword("");

    if (!formData.firstName || !formData.secondName || !formData.email) {
      setCreateError("All fields are required");
      return;
    }

    setCreateLoading(true);
    try {
      const result = await createUserByAdmin({
        firstName: formData.firstName,
        secondName: formData.secondName,
        email: formData.email,
        role: formData.role as "user" | "admin",
      });

      if (result.success && result.data) {
        setGeneratedPassword(result.data.generatedPassword);
        setCreateSuccess(true);
        setFormData({ firstName: "", secondName: "", email: "", role: "user" });

        setTimeout(() => {
          loadAdminData();
          setCreateSuccess(false);
        }, 2000);
      } else {
        setCreateError(result.message);
      }
    } catch (error) {
      setCreateError("Failed to create user");
      console.error(error);
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleGenerateInvite() {
    try {
      const result = await generateInviteLink("user");
      if (result.success && result.data) {
        setInviteLinkUrl(result.data.inviteUrl);
      }
    } catch (error) {
      console.error("Generate invite error:", error);
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const result = await deleteUserByAdmin(userId);
      if (result.success) {
        loadAdminData();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Delete user error:", error);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6 overflow-hidden relative">
      <div className="fixed top-0 right-0 h-28 w-28 sm:h-40 sm:w-40 rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-slate-400 text-sm mt-1">Manage users, teams, and section settings</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-3xl border border-white/5 bg-white/3 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Section Users</p>
              <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Users className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-white/3 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Active Section Teams</p>
              <p className="text-3xl font-bold mt-2">{stats.activeTeams}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Layers className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-white/3 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Open Section Tasks</p>
              <p className="text-3xl font-bold mt-2">{stats.openTasks}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <CheckSquare className="h-6 w-6 text-amber-400" />
            </div>
          </div>
          
        </div>

      </div>
        <AnalyticsDashboard
  stats={stats}
  priority={priority}
  polarData={polarData}
  doughnutChartData={doughnutChartData}
  chartOptions={chartOptions}
  doughnutOptions={doughnutOptions}
  loading={loading}
/>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="rounded-3xl border border-white/5 bg-white/3 p-5">
            <h2 className="text-lg font-bold mb-4">Register New Team Member</h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-emerald-500/40"
              />
              <input
                type="text"
                placeholder="Second Name"
                value={formData.secondName}
                onChange={(e) => setFormData({ ...formData, secondName: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-emerald-500/40"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-emerald-500/40"
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-emerald-500/40"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {createError && (
              <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {createError}
              </div>
            )}

            {createSuccess && generatedPassword && (
              <div className="mt-3 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-200 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4" />
                  User created successfully!
                </div>
                <div className="space-y-2 text-xs">
                  <p>
                    <strong>Password:</strong>{" "}
                    <code className="bg-black/20 px-2 py-1 rounded">{generatedPassword}</code>
                  </p>
                  <p className="text-green-100">Email sent to {formData.email}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleCreateUser}
              disabled={createLoading}
              className="w-full mt-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/25 transition-all disabled:opacity-50"
            >
              {createLoading ? (
                <>
                  <Loader2 className="inline h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </button>

            <button
              onClick={handleGenerateInvite}
              className="w-full mt-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Generate Shareable Invite Link
            </button>

            {inviteLinkUrl && (
              <div className="mt-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-200 text-xs">
                <p className="mb-2">Invite Link:</p>
                <div className="flex items-center gap-2 bg-black/20 rounded px-2 py-1.5 break-all">
                  <code className="flex-1 text-blue-100">{inviteLinkUrl}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(inviteLinkUrl);
                      setInviteLinkCopied(true);
                      setTimeout(() => setInviteLinkCopied(false), 2000);
                    }}
                    className="shrink-0 p-1 hover:bg-white/10 rounded"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
                {inviteLinkCopied && <p className="mt-1 text-blue-100">Copied!</p>}
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="rounded-3xl border border-white/5 bg-white/3 p-5">
            <h2 className="text-lg font-bold mb-4">Section Users Directory</h2>

            {usersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-slate-400 text-sm py-8">No users in this section yet</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-white/10">
                      <tr>
                        <th className="text-left py-3 px-4 text-slate-400">Name</th>
                        <th className="text-left py-3 px-4 text-slate-400">Email</th>
                        <th className="text-left py-3 px-4 text-slate-400">Role</th>
                        <th className="text-left py-3 px-4 text-slate-400">Created</th>
                        <th className="text-left py-3 px-4 text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/2">
                          <td className="py-3 px-4">
                            {user.firstName} {user.secondName}
                          </td>
                          <td className="py-3 px-4 text-slate-300">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              user.role === "admin"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-blue-500/20 text-blue-300"
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-xs">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-xs px-2 py-1 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {usersPagination && (
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span>Page {usersPagination.currentPage} of {usersPagination.totalPages}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                        disabled={!usersPagination.hasPrevPage}
                        className="px-3 py-1 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => setUsersPage((p) => p + 1)}
                        disabled={!usersPagination.hasNextPage}
                        className="px-3 py-1 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserWorkspace({ session }: { session: Session }) {
  const { table, loading, stats, priority, polarData, doughnutChartData, chartOptions, doughnutOptions } = useDashboardHooks(10);

  if (loading || !table) {
    return (
      <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  const assignedTasks = table.tasks || [];

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6 overflow-hidden relative">
      <div className="fixed top-0 right-0 h-28 w-28 sm:h-40 sm:w-40 rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Analytics and task management overview</p>
      </div>

      {/* Analytics Dashboard */}
      <div className="mb-8">
        <AnalyticsDashboard
          stats={stats}
          priority={priority}
          polarData={polarData}
          doughnutChartData={doughnutChartData}
          chartOptions={chartOptions}
          doughnutOptions={doughnutOptions}
          loading={loading}
        />
      </div>

      {/* Assigned Tasks Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="rounded-3xl border border-white/5 bg-white/3 p-5">
            <h2 className="text-lg font-bold mb-4">My Assigned Tasks</h2>

            {assignedTasks.length === 0 ? (
              <p className="text-slate-400 text-sm py-8">No tasks assigned yet</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {assignedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-2xl border border-white/5 bg-white/2 p-4 hover:bg-white/3 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-white">{task.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                        task.priority === "high"
                          ? "bg-rose-500/20 text-rose-300"
                          : task.priority === "medium"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-blue-500/20 text-blue-300"
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-slate-300 mb-3 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className={`px-2 py-1 rounded-full ${
                        task.status === "done"
                          ? "bg-green-500/20 text-green-300"
                          : "bg-slate-500/20 text-slate-300"
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-1">
          <div className="rounded-3xl border border-white/5 bg-white/3 p-5">
            <h2 className="text-lg font-bold mb-4">My Active Teams</h2>
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/5 bg-white/2 p-3">
                <p className="text-sm text-slate-400 mb-2">Teams feature coming soon</p>
                <p className="text-xs text-slate-500">
                  Your team memberships and assignments will appear here
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}