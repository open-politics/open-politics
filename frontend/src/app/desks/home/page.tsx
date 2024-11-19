'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import CardItem from "@/components/ui/mini-card"

export default function DesksPage() {
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold">Home</h1>
      </div>

      {/* <div className="flex-1 flex justify-end gap-2 h-10">
        {["A1", "A2"].map((item, index) => (
          <CardItem
            key={index}
            title={item}
            content="This is a sample text for the card content."
          />
        ))}
      </div> */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card 
          href="home/desks/globe"
          className="transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-xl opacity-60 rounded-full -z-10 animate-pulse"></div>
          <CardHeader>
            <CardTitle>Globe View</CardTitle>
          </CardHeader>
          <CardContent>
            Geo
          </CardContent>
        </Card>
        
        <Card 
          href="home/desks/chat"
          className="transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-500 blur-xl opacity-60 rounded-full -z-10 animate-pulse"></div>
          <CardHeader>
            <CardTitle>Chat Interface</CardTitle>
          </CardHeader>
          <CardContent>
            AI-powered political analysis assistant
          </CardContent>
        </Card>
        
        <Card 
          href="home/desks/bookmarks"
          className="transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-yellow-500 blur-xl opacity-60 rounded-full -z-10 animate-pulse"></div>
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