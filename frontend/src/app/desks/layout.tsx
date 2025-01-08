'use client'

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/collection/AppSidebar"
import useAuth from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import LottiePlaceholder from "@/components/ui/lottie-placeholder"

export default function DesksLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login')
    }
  }, [isLoading, isLoggedIn, router])

  if (isLoading) {
    return <LottiePlaceholder />
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      <SidebarProvider>
        <AppSidebar className="fixed md:relative h-full md:h-auto" />
        <SidebarInset className="flex-1 flex flex-col pt-16">
          <header className="flex h-12 shrink-0 items-center gap-2 px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:-ml-4 " />
              <Breadcrumb className="pr-6 md:pr-2">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/desks">Desks</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Globe</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            {user?.is_superuser && (
              <div className="flex-1 flex justify-end gap-2 h-10">
                {["A1", "A2"].map((item, index) => (
                  <div
                    key={index}
                    className="w-full md:w-48 flex flex-col items-start gap-0.5 rounded-lg p-1 text-left text-sm transition-all hover:bg-accent overflow-hidden"
                  >
                    <div className="text-xs font-medium truncate w-full">Sample Subject</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      This is a sample text for the card content.
                    </div>
                  </div>
                ))}
              </div>
            )}
          </header>
          <main>
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}