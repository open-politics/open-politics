'use client'

import { SidebarProvider } from "@/components/ui/sidebar"
import { DocsSidebar } from "@/components/collection/DocsSidebar"

export default function LiveDocsLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <DocsSidebar />
            {children}
        </SidebarProvider>
    )
}