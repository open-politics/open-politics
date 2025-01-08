'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import CardItem from "@/components/ui/mini-card"

export default function DesksPage() {
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold">Home</h1>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative border border-1 border-gray-600 rounded-lg transition-all duration-200 hover:border-transparent">
          <a href="/desks/home/globe">
            <Card className="transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-xl opacity-20 rounded-full -z-10 animate-pulse [animation-duration:3s]"></div>
              <CardHeader>
                <CardTitle>Globe View</CardTitle>
                <CardDescription> 
                  Get an overview of events around the world pulled from our OPOL data engine.
                </CardDescription>
              </CardHeader>
              <CardContent>
                The Globe
              </CardContent>
            </Card>
          </a>
        </div>
        
        <div className="relative border border-1 border-gray-600 rounded-lg transition-all duration-200 hover:border-transparent">
          <a href="/desks/home/chat">
            <Card className="transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-500 blur-xl opacity-20 rounded-full -z-10 animate-pulse [animation-duration:3s]"></div>
              <CardHeader>
                <CardTitle>Chat Interface</CardTitle>
                <CardDescription> 
                  AI-powered political analysis assistant. Equipped with 5 different search engines and advanced report generation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                AI-powered political analysis assistant
              </CardContent>
            </Card>
          </a>
        </div>
      </div>
    </div>
  )
}