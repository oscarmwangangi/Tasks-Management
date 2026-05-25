"use client";

import { useMemo, useState } from "react";
import { Settings, Bell, Shield, LogOut } from "lucide-react";
import { handleServerLogout } from "@/app/actions/logout";

type ToggleOption = {
  id: string;
  label: string;
  description: string;
};

const notificationOptions: ToggleOption[] = [
  {
    id: "emailUpdates",
    label: "Email updates",
    description: "Get email notifications for important changes.",
  },
  {
    id: "taskReminders",
    label: "Task reminders",
    description: "Receive reminders for upcoming due dates.",
  },
  {
    id: "teamMentions",
    label: "Team mentions",
    description: "Notify me when someone mentions me in a task.",
  },
];

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => {
    // local-only defaults for now
    return notificationOptions.reduce((acc, opt, i) => {
      acc[opt.id] = i === 0; // email updates on by default
      return acc;
    }, {} as Record<string, boolean>);
  });

const emailAndName = useMemo(() => {
    // Session isn’t wired into this page yet. Keep a safe placeholder.
    // If you later pass session as prop (like DashboardClient does), wire it here.
    return {
      email: "—",
      name: "—",
    };
  }, []);

  // Avoid unused warnings in case session is later wired.
  void emailAndName;


  const [logoutPending, setLogoutPending] = useState(false);

  const handleToggle = (id: string) => {
    setPrefs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLogout = async () => {
    try {
      setLogoutPending(true);
      localStorage.removeItem("user");
      await handleServerLogout();
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      setLogoutPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6 overflow-hidden relative">
      <div className="fixed top-0 right-0 h-125 w-125 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/5 bg-white/3">
            <Settings className="h-5 w-5 text-emerald-400" />
          </span>
          Settings
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Profile, notifications, and security preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile */}
        <section className="lg:col-span-1 rounded-3xl border border-white/5 bg-white/3 p-5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
              <span className="text-sm font-bold text-emerald-300">{(emailAndName.name || "").slice(0, 1).toUpperCase() || "U"}</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{emailAndName.name}</div>
              <div className="text-xs text-slate-400 mt-0.5">{emailAndName.email}</div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/5 bg-black/10 p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-300" />
              <div className="text-sm font-semibold text-slate-200">Account</div>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              You can update notification preferences below. Password change UI is present in the Security section.
            </div>
          </div>
        </section>

        {/* Center: Notifications */}
        <section className="lg:col-span-2 rounded-3xl border border-white/5 bg-white/3 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-emerald-400" />
              <h2 className="text-sm font-semibold tracking-wide text-slate-200">
                Notifications
              </h2>
            </div>
            <div className="text-xs text-slate-500">
              Saved locally (demo)
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {notificationOptions.map((opt) => {
              const checked = Boolean(prefs[opt.id]);
              return (
                <div
                  key={opt.id}
                  className="rounded-2xl border border-white/5 bg-white/2 p-4 flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="text-sm font-semibold text-white">{opt.label}</div>
                    <div className="text-xs text-slate-400 mt-1">{opt.description}</div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    onClick={() => handleToggle(opt.id)}
                    className={
                      "h-9 w-16 rounded-full border transition-all flex items-center px-1 " +
                      (checked
                        ? "bg-emerald-500/20 border-emerald-500/40 justify-end"
                        : "bg-black/10 border-white/10 justify-start")
                    }
                  >
                    <span
                      className={
                        "h-7 w-7 rounded-full border transition-all " +
                        (checked
                          ? "bg-emerald-400 border-emerald-500/50"
                          : "bg-white/5 border-white/10")
                      }
                    />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Security */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-400" />
                <h2 className="text-sm font-semibold tracking-wide text-slate-200">
                  Security
                </h2>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/5 bg-white/2 p-4">
                <div className="text-sm font-semibold text-white">Change password</div>
                <div className="text-xs text-slate-400 mt-1">
                  Placeholder UI. Hook this up to a backend action when available.
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                      Current password
                    </label>
                    <input
                      type="password"
                      disabled
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 py-2 px-3 text-sm text-white/90 outline-none disabled:opacity-50"
                      value=""
                      onChange={() => {}}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                      New password
                    </label>
                    <input
                      type="password"
                      disabled
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 py-2 px-3 text-sm text-white/90 outline-none disabled:opacity-50"
                      value=""
                      onChange={() => {}}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                      Confirm password
                    </label>
                    <input
                      type="password"
                      disabled
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 py-2 px-3 text-sm text-white/90 outline-none disabled:opacity-50"
                      value=""
                      onChange={() => {}}
                    />
                  </div>

                  <button
                    type="button"
                    disabled
                    className="w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 disabled:opacity-50"
                    onClick={() => {}}
                  >
                    Save password
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
                <div className="text-sm font-semibold text-rose-200 flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Danger zone
                </div>
                <div className="text-xs text-rose-200/70 mt-1">
                  Logging out will end your session.
                </div>

                <button
                  type="button"
                  className="mt-4 w-full rounded-2xl bg-rose-600/20 border border-rose-500/30 px-4 py-2 text-sm font-semibold text-rose-200 hover:bg-rose-600/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={handleLogout}
                  disabled={logoutPending}
                >
                  {logoutPending ? "Logging out..." : "Log out"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

