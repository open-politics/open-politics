"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker"
import axios from 'axios'
import ContentCard from "@/components/ContentCard"
import EntityCard from "@/components/EntityCard"
import EntitiesView from "@/components/EntitiesView"

export default function DashboardPage() {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null)
  const [search, setSearch] = useState<string>("")
  const [tabs, setTabs] = useState<string[]>(["Berlin", "USA Election", "German Snap Elections"])
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchArticles = async (query: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`/api/v1/search/contents`, {
        params: {
          search_query: query,
          limit: 20,
          skip: 0,
          search_type: 'text',
        }
      })
      setResults(response.data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred during search'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles("initial query")
  }, [])

  const filteredEntities = results?.ssareResults || []

  const addTab = (tabName: string) => {
    setTabs([...tabs, tabName])
  }

  const removeTab = (tabName: string) => {
    setTabs(tabs.filter(tab => tab !== tabName))
  }

  const editTab = (oldName: string, newName: string) => {
    setTabs(tabs.map(tab => (tab === oldName ? newName : tab)))
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
            <div className="flex items-center space-x-2">
              <CalendarDateRangePicker />
              <Button>Download</Button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search entities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded"
            />
          </div>
          <Tabs defaultValue="overview" className="space-y-4">
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* Add any additional cards or components here */}
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
                        filteredEntities.map(content => (
                          <ContentCard key={content.id} {...content} />
                        ))
                      )}
                    </CardContent>
                  </Card>
                  <Card className="col-span-3">
                    <CardHeader>
                      <CardTitle>Entities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Render entities or other content here */}
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