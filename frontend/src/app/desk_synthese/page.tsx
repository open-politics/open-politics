"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function MovedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">🚀 This Site Has Moved!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            This page has moved to /desks/home and requires authentication.
          </p>
          <p className="text-sm text-muted-foreground">
            If you&apos;re seeing this, you either have an invite or discovered our easter egg!
            Please use the following credentials to access the prototype.
          </p>
          <div className="rounded-md bg-muted p-4">
            <p className="font-mono text-sm">
              Email: opp_access@open-politics.org<br />
              Password: sesame
            </p>
          </div>
          <Button 
            className="w-full"
            onClick={() => window.location.href = "/desks/home"}
          >
            Go to New Location
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
