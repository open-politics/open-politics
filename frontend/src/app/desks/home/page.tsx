'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function DesksPage() {
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold">Home</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Globe View</CardTitle>
          </CardHeader>
          <CardContent>
            Quick access to geographic data visualization
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Chat Interface</CardTitle>
          </CardHeader>
          <CardContent>
            AI-powered political analysis assistant
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Bookmarked Articles</CardTitle>
          </CardHeader>
          <CardContent>
            Your saved articles and analyses
          </CardContent>
        </Card>
      </div>
    </div>
  )
}