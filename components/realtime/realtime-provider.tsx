"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface RealtimeContextType {
  alerts: any[]
  isConnected: boolean
  lastUpdate: Date | null
}

const RealtimeContext = createContext<RealtimeContextType>({
  alerts: [],
  isConnected: false,
  lastUpdate: null,
})

export const useRealtime = () => useContext(RealtimeContext)

interface RealtimeProviderProps {
  children: ReactNode
}

export default function RealtimeProvider({ children }: RealtimeProviderProps) {
  const [alerts, setAlerts] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    // Simulate real-time connection
    setIsConnected(true)

    // Poll for real-time alerts every 30 seconds
    const fetchAlerts = async () => {
      try {
        const response = await fetch("/api/realtime/alerts")
        const data = await response.json()
        setAlerts(data.alerts || [])
        setLastUpdate(new Date())
      } catch (error) {
        console.error("Failed to fetch real-time alerts:", error)
        setIsConnected(false)
      }
    }

    // Initial fetch
    fetchAlerts()

    // Set up polling interval
    const interval = setInterval(fetchAlerts, 30000) // 30 seconds

    // Cleanup
    return () => {
      clearInterval(interval)
      setIsConnected(false)
    }
  }, [])

  return <RealtimeContext.Provider value={{ alerts, isConnected, lastUpdate }}>{children}</RealtimeContext.Provider>
}
