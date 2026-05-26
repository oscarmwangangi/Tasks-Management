"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React, { createContext, useContext, useState, useEffect } from "react"
import { Menu, X,PanelLeftOpen, PanelLeftClose } from "lucide-react" // Import icons
import { LogOut } from "lucide-react"

/* ========================================
   CONTEXT & HOOKS
======================================== */
type SidebarContextType = {
  open: boolean
  setOpen: (open: boolean) => void
  isMobile: boolean
}

const SidebarContext = createContext<SidebarContextType | null>(null)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) throw new Error("useSidebar must be used inside SidebarProvider")
  return context
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Handle screen resizing for responsiveness
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setOpen(false)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (

    <SidebarContext.Provider value={{ open, setOpen, isMobile }}>
      <div className="flex min-h-screen w-full">
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

/* ========================================
   SIDEBAR ROOT
======================================== */
export function Sidebar({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { open, isMobile, setOpen } = useSidebar()

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && open && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen bg-[#020617] border-r border-slate-800/60 text-slate-300 
      transition-all duration-300 ease-in-out
          ${open ? "w-64 translate-x-0" : "w-64 -translate-x-full md:w-20 md:translate-x-0"}


          ${className}
        `}
      >
        <div className="flex h-full flex-col">
          {children}
        </div>
      </aside>
      
      {/* Spacer for desktop to push content */}
      {!isMobile && (
        <div className={`transition-all duration-300 ${open ? "w-64" : "w-20"}`} />
      )}
    </>
  )
}

/* ========================================
   TRIGGER BUTTON (Hamburger)
======================================== */
export function SidebarTrigger() {
  const { open, setOpen } = useSidebar()

  return (
    <button
      onClick={() => setOpen(!open)}
      className="text-text-muted hover:bg-white/5 hover:text-taupe-100"
  aria-label="Toggle Sidebar"
    >
      {open ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
    </button>
  )
}

/* ========================================
   SUB-COMPONENTS
======================================== */
export function SidebarHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-4 border-b border-gray-800 text-lg font-bold truncate">{children}</div>
}

export function SidebarContent({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 overflow-y-auto py-4 space-y-1">{children}</div>
}

export function SidebarGroup({
  children,
  to,
  icon: Icon,
  rightContent,
}: {
  children: React.ReactNode;
  to: string;
  icon?: React.ElementType;
  rightContent?: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === to;
  const { open } = useSidebar();

  return (
    <Link
      href={to}
      title={!open ? String(children) : ""}
          className={`
            flex items-start transition-all duration-300 ease-in-out
        
        ${isActive
          ? "bg-(--color-accent) text-white"
          : "text-text-muted hover:bg-white/5 hover:text-taupe-100"
        }

        ${open
          ? "px-3 py-2 mx-2 gap-3 rounded-lg"
          : "px-4 py-2 mx-0 rounded-none"
        }
      `}
    >
      {/* Left Side */}
      <div className="flex items-center gap-3 flex-1">
        {Icon && (
          <Icon
            size={18}
            className={`shrink-0 transition-transform  duration-300 ${
              !open ? "scale-110" : ""
            }`}
          />
        )}

        <span
          className={`
            whitespace-nowrap overflow-hidden  transition-all  duration-300
            ${open ? "w-auto opacity-100" : "w-0 opacity-0"}
          `}
        >
          {children}
        </span>
      </div>

      {/* Right Side */}
      {open && rightContent}
    </Link>
  );
}

export function SidebarFooter({ 
  children, 
  onLogout 
}: { 
  children?: React.ReactNode; 
  onLogout?: () => void 
}) {
  const { open } = useSidebar()
  
  return (
    <div className={`
      p-4 border-t border-gray-800 mt-auto transition-all duration-300
      ${open ? "px-4" : "px-0 flex justify-center"}
    `}>
      {children ? children : (
        <button
          onClick={onLogout}
          title={!open ? "Logout" : ""}
          className={`
            flex items-center w-full transition-all duration-200
            text-gray-400 hover:text-red-400
            ${open ? "gap-3 justify-start px-2 py-2" : "justify-center py-2"}
          `}
        >
          <LogOut size={22} className="shrink-0" />
          <span className={`
            whitespace-nowrap overflow-hidden transition-all duration-300
            ${open ? "w-auto opacity-100" : "w-0 opacity-0"}
          `}>
            Logout
          </span>
        </button>
      )}
    </div>
  )
}