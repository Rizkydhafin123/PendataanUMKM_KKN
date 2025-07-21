"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { hasNeon } from "@/lib/db"
import { Eye, EyeOff, RefreshCw } from "lucide-react"

export function DebugPanel() {
  const [showDebug, setShowDebug] = useState(false)
  const [envVars, setEnvVars] = useState({
    databaseUrl: process.env.DATABASE_URL || "❌ Tidak ada",
  })

  const refreshEnv = () => {
    setEnvVars({
      databaseUrl: process.env.DATABASE_URL || "❌ Tidak ada",
    })
  }

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4">
        <Button variant="outline" size="sm" onClick={() => setShowDebug(true)} className="bg-card shadow-lg rounded-lg">
          <Eye className="h-4 w-4 mr-2" />
          Debug
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-80">
      <Card className="bg-card shadow-xl border-2 border-border rounded-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-foreground">Debug Panel</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={refreshEnv} className="rounded-lg">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowDebug(false)} className="rounded-lg">
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-foreground">Database Status:</span>
              <Badge variant={hasNeon ? "default" : "destructive"} className="rounded-md">
                {hasNeon ? "✅ Connected" : "❌ Offline"}
              </Badge>
            </div>
          </div>

          <div>
            <div className="text-xs font-medium mb-1 text-foreground">Environment Variables:</div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">DATABASE_URL:</span>
                <Badge
                  variant={envVars.databaseUrl.includes("neon.tech") ? "default" : "destructive"}
                  className="rounded-md"
                >
                  {envVars.databaseUrl.includes("neon.tech") ? "✅ Set" : "❌ Missing"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-muted p-2 rounded-lg">
            <div>
              <strong>URL:</strong> {envVars.databaseUrl}
            </div>
          </div>

          {!hasNeon && (
            <div className="text-xs text-destructive bg-destructive/10 p-2 rounded-lg">
              <strong>Setup Required:</strong>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Add env vars in Netlify</li>
                <li>Redeploy site</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
