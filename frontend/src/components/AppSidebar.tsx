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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"



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
        },
        {
          title: "Dashboard",
          url: "/desks/home/dashboard",
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
    {
      title: "Briefings",
      url: "/desks/briefings",
      icon: Send,
    },
    {
      title: "Bookmarks",
      url: "/desks/bookmarks",
      icon: Bookmark,
      items: [
        {
          title: "Conflict News",
          url: "/desks/bookmarks/conflict-news",
          icon: Swords,
        },
      ],
    }
  ],
  projects: [
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
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" variant="floating" {...props} className="bg-white dark:bg-black md:bg-transparent pt-16">
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
        }))}
      />
      {/* <NavProjects projects={data.projects} /> */}
      <SidebarContent>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
