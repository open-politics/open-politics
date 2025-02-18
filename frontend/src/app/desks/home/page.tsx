'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Folder, Globe, MessageSquare } from "lucide-react"
import { workspaceItems } from "@/components/collection/unsorted/AppSidebar"
import Link from "next/link"

export default function DesksPage() {
  // const WorkspaceItems = workspaceItems.filter(item => item.title !== "Workspaces");

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold">Home</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative transition-all duration-200 h-full">
          <Link href="/desks/home/globe" className="h-full block">
            <Card className="transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer relative h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-xl opacity-20 rounded-full -z-10 animate-pulse [animation-duration:3s]"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Globe View
                </CardTitle>
                <CardDescription>
                  Get an overview of events around the world pulled from our OPOL data engine.
                </CardDescription>
              </CardHeader>
              <CardContent>
                The Globe
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="relative transition-all duration-200 h-full">
          <Link href="/desks/home/chat" className="h-full block">
            <Card className="transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer relative h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-500 blur-xl opacity-20 rounded-full -z-10 animate-pulse [animation-duration:3s]"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Chat Interface
                </CardTitle>
                <CardDescription>
                  AI-powered political analysis assistant. Equipped with 5 different search engines and advanced report generation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                AI-powered political analysis assistant
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Workspaces Section */}
        <div className="relative transition-all duration-200 h-full">
          <Card className="transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer relative h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="w-5 h-5" />
                Workspaces
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6">
                {workspaceItems.map((item) => (
                  <div className="relative transition-all duration-200 h-full" key={item.title}>
                    <Link href={item.url} className="h-full block">
                      <Card className="transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer relative h-full">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <item.icon className="w-5 h-5" />
                            {item.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {item.title} {/* You can replace this with a more descriptive content */}
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}