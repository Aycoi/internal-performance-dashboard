"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DataRefreshProps {
  onRefresh: () => Promise<void>
  className?: string
}

export function DataRefresh({ onRefresh, className }: DataRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh()
      toast({
        title: "Data refreshed",
        description: "The dashboard has been updated with the latest data.",
      })
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Could not refresh data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Button variant="outline" size="sm" className={className} onClick={handleRefresh} disabled={isRefreshing}>
      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
      {isRefreshing ? "Refreshing..." : "Refresh Data"}
    </Button>
  )
}
