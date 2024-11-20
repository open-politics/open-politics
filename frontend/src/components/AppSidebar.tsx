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
  Send,
  Swords,
  Orbit,
  ShieldAlert,
} from "lucide-react"

import { NavMain } from "@/components/ui/nav-main"
import { NavProjects } from "@/components/ui/nav-projects"
import { Separator } from "@/components/ui/separator"
import { NavUser } from "@/components/ui/nav-user"
import { TeamSwitcher } from "@/components/ui/team-switcher"
import useAuth from "@/hooks/useAuth"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import HistoryList from "./history-list"

import { Chat } from "./chat"

// This is sample data.
const data = {
  teams: [
    {
      name: "Political Research",
      logo: Orbit,
      plan: "International news",
    },
    {
      name: "Deutsche Nachrichten", 
      logo: Orbit,
      plan: "German news only",
    }
  ],
  navMain: [
    {
      title: "Home",
      url: "/desks/home/",
      icon: Home,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/desks/home",
        }
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
        }
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
        }
      ],
    },
  ],
  projects: [
    {
      name: "Briefings",
      url: "/desks/briefings",
      icon: Send,
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
    }
  ],
  user: {
    name: "User",
    email: "user@example.com"
  }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  return (
    <Sidebar collapsible="icon" variant="floating" {...props} className="pt-16">
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <NavMain
        items={data.navMain.map(item => ({
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
        <NavProjects projects={data.projects} />
      )}
      <SidebarContent>
         <HistoryList userId={user?.id} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
