"use client"

import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Clock } from "lucide-react"
import { useRealtime } from "./realtime-provider"

export default function RealtimeStatus() {
  const { isConnected, lastUpdate, alerts } = useRealtime()

  const unreadAlerts = alerts.filter((alert) => !alert.isRead).length

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        {isConnected ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
        <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
          {isConnected ? "Live" : "Offline"}
        </Badge>
      </div>

      {unreadAlerts > 0 && (
        <Badge variant="destructive" className="text-xs">
          {unreadAlerts} Alert{unreadAlerts !== 1 ? "s" : ""}
        </Badge>
      )}

      {lastUpdate && (
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>Updated {lastUpdate.toLocaleTimeString()}</span>
        </div>
      )}
    </div>
  )
}
