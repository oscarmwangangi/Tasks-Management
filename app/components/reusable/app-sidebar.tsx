"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "../../shared/ui/sidebar"
import { Settings, LayoutDashboard,ListTodo } from "lucide-react";
import { useRouter } from "next/navigation";
export function AppSidebar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.replace("/auth/login")
  }
  return (
    <Sidebar>
      <SidebarHeader>
        Task Manager
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup to="/dashboard" icon={LayoutDashboard}>

          Dashboard
        </SidebarGroup>

         <SidebarGroup to="/tasks" icon={ListTodo}>
          Tasks
        </SidebarGroup>

        <SidebarGroup to="/teams" icon={ListTodo}>
          Teams
        </SidebarGroup>

        <SidebarGroup to="/projects" icon={ListTodo}>
          Projects
        </SidebarGroup>


        <SidebarGroup to="/settings" icon={Settings}>
          Settings
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter onLogout={handleLogout} />
    </Sidebar>
  )
}