"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "../../shared/ui/sidebar"
import { Settings, LayoutDashboard,ListTodo, Users,  FolderKanban, } from "lucide-react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dropdown } from "./dropdown"
import { handleServerLogout } from "@/app/actions/logout";
export function AppSidebar() {
  const router = useRouter();



const handleLogout = async () => {
    try {
      localStorage.removeItem("user");
      await handleServerLogout();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };
  return (
    <Sidebar>
      <SidebarHeader>
        Task Manager
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup to="/dashboard" icon={LayoutDashboard}>

          Dashboard
        </SidebarGroup>

         <SidebarGroup to="/tasks" icon={ListTodo}   rightContent={<Dropdown
              OpenIcon={ChevronDown}
              CloseIcon={ChevronRight}
           />}>
          Tasks
           
        </SidebarGroup>

        <SidebarGroup to="/teams" icon={Users}>
          Teams
        </SidebarGroup>
      

        <SidebarGroup to="/projects" icon={FolderKanban}>
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