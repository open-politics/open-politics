"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker"
import ContentCard from "@/components/collection/unsorted/ContentCard"
import { useSearch } from "@/hooks/search/search-providers"


export default function DashboardPage() {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [tabs, setTabs] = useState<string[]>(["Berlin", "USA Election", "German Snap Elections"])
  const [activeTab, setActiveTab] = useState<string>("Berlin")

  const { search, results, loading, error } = useSearch({
    provider: 'searxng',
    maxResults: 20,
    searchDepth: 'advanced',
    includeDomains: [],
    excludeDomains: []
  })

  useEffect(() => {
    if (tabs[0]) {
      search(tabs[0])
    }
  }, [])

  // Get filtered entities from results
  const filteredEntities = results?.results || []

  // Tab management functions
  const addTab = (tabName: string) => {
    setTabs([...tabs, tabName])
  }

  const removeTab = (tabName: string) => {
    setTabs(tabs.filter(tab => tab !== tabName))
  }

  const editTab = (oldName: string, newName: string) => {
    setTabs(tabs.map(tab => (tab === oldName ? newName : tab)))
  }

  // Handle search input with debounce
  const handleSearch = (value: string) => {
    setSearchQuery(value)
    search(value)
  }

  return (
    <>
      <div className="md:hidden">
        {/* Mobile view placeholder */}
      </div>
      <div className="hidden flex-col md:flex">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <div   className="flex items-center space-x-2">
              <CalendarDateRangePicker />
              <Button>Download</Button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search entities..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="border p-2 rounded"
            />
          </div>
          <Tabs defaultValue="Berlin" className="space-y-4">
            <TabsList>
              {tabs.map(tab => (
                <TabsTrigger key={tab} value={tab.toLowerCase()}>{tab}</TabsTrigger>
              ))}
              <Button onClick={() => addTab(prompt("Enter new tab name:", "New Tab") || "New Tab")}>Add Tab</Button>
            </TabsList>
            {tabs.map(tab => (
              <TabsContent key={tab} value={tab.toLowerCase()} className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">{tab} Content</h3>
                  <div className="flex space-x-2">
                    <Button onClick={() => editTab(tab, prompt("New name:", tab) || tab)}>Edit</Button>
                    <Button onClick={() => removeTab(tab)}>Delete</Button>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-4">
                    <CardHeader>
                      <CardTitle>Recent Articles</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                      {loading ? (
                        <div>Loading articles...</div>
                      ) : error ? (
                        <div>Error loading articles: {error.message}</div>
                      ) : (
                        filteredEntities.map((content: any) => (
                          <ContentCard 
                            key={content.url} 
                            title={content.title}
                            url={content.url}
                            content={content.content}
                          />
                        ))
                      )}
                    </CardContent>
                  </Card>
                  <Card className="col-span-3">
                    <CardHeader>
                      <CardTitle>Entities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Display images or other metadata from search results */}
                      {results?.images && results.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {results.images.slice(0, 4).map((image, index) => (
                            <img 
                              key={index}
                              src={typeof image === 'string' ? image : image.url}
                              alt={typeof image === 'string' ? '' : image.description}
                              className="w-full h-32 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </>
  )
}