"use client"

import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"
import { useEffect } from "react"
import { useTheme } from "next-themes"
import Link from "next/link"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useWorkspaceStore } from "@/zustand_stores/storeWorkspace"
import { IconRenderer } from "@/components/collection/workspaces/utilities/icons/icon-picker"

export function WorkspaceSwitcher() {
  const { isMobile } = useSidebar()
  const { theme } = useTheme()

  const {
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    fetchWorkspaces
  } = useWorkspaceStore()

  useEffect(() => {
    if (!workspaces.length && !useWorkspaceStore.getState().activeWorkspace) {
      fetchWorkspaces()
    }
  }, [workspaces.length, fetchWorkspaces])

  // Add null guard for initial render
  if (!activeWorkspace && workspaces.length > 0) {
    return <div className="h-12 animate-pulse bg-muted rounded-md" />;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg">
              <div className="flex items-center gap-2 md:gap-4 text-sm leading-tight">
                <div className={`flex aspect-square size-8 items-center justify-center rounded-lg ${theme === "dark" ? "text-white" : "text-black"}`}>
                  <ChevronsUpDown className="size-4" />
                </div>
                {activeWorkspace?.icon && (
                  <IconRenderer className="size-5 text-secondary-500" icon={activeWorkspace.icon} />
                )}
                <span className="truncate font-semibold text-right">
                  {activeWorkspace?.name || "Select Workspace"}
                </span>
                {/* <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground ml-auto">
                  <Plus className="size-4" />
                </div> */}
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 border-none rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Workspaces
            </DropdownMenuLabel>
            {workspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.uid}
                onClick={() => setActiveWorkspace(workspace.uid)}
                className="gap-2 p-2 flex items-center"
              >
                {workspace.icon && (
                  <IconRenderer className="size-4 text-secondary-500" icon={workspace.icon} />
                )}
                <span>{workspace.name}</span>
                <DropdownMenuShortcut>⌘{workspace.uid}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <Link href="/desks/home/workspaces" className="w-full flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-md bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Curate New Information Space
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default WorkspaceSwitcher