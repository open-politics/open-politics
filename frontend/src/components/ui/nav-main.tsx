"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isButton?: boolean
    color?: string
    isActive?: boolean
    items?: {
      title: string
      url: string
      onClick?: () => void
      icon?: LucideIcon
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={item.title}
                  style={{
                    color: item.color ? `hsl(var(${item.color}))` : undefined,
                  }}
                >
                  {item.icon && (
                    <item.icon
                      style={{
                        color: item.color ? `hsl(var(${item.color}))` : undefined,
                      }}
                    />
                  )}
                  <span>{item.title}</span>
                  {item.items && item.items.length > 0 && (
                    <ChevronRight className="ml-auto transition-transform border-none duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  )}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton 
                        asChild
                        size="sm"
                        className="pl-8"
                      >
                        {item.isButton ? (
                          <Button asChild onClick={subItem.onClick}>
                            {subItem.icon && <subItem.icon className="size-4" />}
                            <span>{subItem.title}</span>
                          </Button>
                        ) : (
                          <a href={subItem.url}>
                            {subItem.icon && <subItem.icon className="size-4" />}
                            <span>{subItem.title}</span>
                          </a>
                        )}
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export default NavMain;