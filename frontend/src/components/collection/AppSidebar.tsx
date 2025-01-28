"use client"

import * as React from "react"
import Link from "next/link"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Home,
  PieChart,
  Settings2,
  SquareTerminal,
  Globe,
  Bookmark,
  Clipboard,
  LayoutDashboard,
  Send,
  Swords,
  Orbit,
  ShieldAlert,
} from "lucide-react"

import { NavMain } from "@/components/ui/nav-main"
import { NavProjects } from "@/components/ui/nav-projects"
import { Separator } from "@/components/ui/separator"
import { NavUser } from "@/components/ui/nav-user"
import WorkspaceSwitcher from "@/components/ui/team-switcher"
import useAuth from "@/hooks/useAuth"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import HistoryList from "@/components/ui/SearchHistory"
import { useWorkspaceDataStore } from "@/store/useWorkspaceDataStore"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading } = useAuth()
  const {
    workspaces,
    activeWorkspace,
    fetchWorkspaces,
    createWorkspace,
    deleteWorkspace
  } = useWorkspaceDataStore()

  React.useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

  // Sample navigation data
  const navMain = React.useMemo(() => [
    {
      title: "Home",
      url: "/desks/home/",
      icon: Home,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/desks/home",
        },
      ],
    },
    {
      title: "Synthese",
      url: "/desks/globe",
      icon: Globe,
      isActive: true,
      items: [
        {
          title: "Globe",
          url: "/desks/home/globe",
        },
      ],
    },
    {
      title: "Chat",
      url: "/desks/home/chat",
      icon: Bot,
      isActive: true,
      items: [
        {
          title: "Chat",
          url: "/desks/home/chat",
        },
      ],
    },
  ], [])

  const projects = React.useMemo(() => [
    {
      name: "workspaces",
      url: "/desks/home/workspaces",
      icon: LayoutDashboard,
    },
    {
      name: "Classification Schemes",
      url: "/desks/home/workspaces/classification_schemes",
      icon: ShieldAlert,
    },
    {
      name: "Bookmarks",
      url: "/desks/bookmarks",
      icon: Bookmark,
    },
    {
      name: "Open Globe",
      url: "/desks/home/globe",
      icon: Globe,
    },
    {
      name: "Dashboard",
      url: "/desks/home/dashboard",
      icon: Frame,
    },
  ], [])

  return (
    <Sidebar collapsible="icon" variant="floating" {...props} className="pt-16">
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <NavMain
          items={navMain.map(item => ({
            ...item,
            element: (
              <Link href={item.url} key={item.title} className="nav-item">
                {item.title}
              </Link>
            ),
            content: item.url === "/desks/home/chat" && item.isActive ? (
              <HistoryList userId={user?.id} />
            ) : null,
          }))}
        />
      {user?.is_superuser && (
        <NavProjects projects={projects} />
      )}
      <SidebarContent>
         <HistoryList userId={user?.id} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: user?.full_name || "User", email: user?.email || "user@example.com" }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export default AppSidebar
