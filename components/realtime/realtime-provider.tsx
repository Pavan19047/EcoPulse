"use client"

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"

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
  const backoffRef = useRef(30000) // start at 30s
  const logOnceRef = useRef(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let stopped = false
    setIsConnected(true)

    const fetchAlerts = async () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 2000) // 2s client timeout
      try {
        const response = await fetch("/api/realtime/alerts", {
          cache: "no-store",
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        setAlerts(data.alerts || [])
        setLastUpdate(new Date())
        setIsConnected(true)
        backoffRef.current = 30000 // reset to 30s on success
      } catch (error) {
        setIsConnected(false)
        // Log once to keep console clean in dev
        if (!logOnceRef.current) {
          console.debug("Realtime disabled (alerts API unreachable).", error)
          logOnceRef.current = true
        }
        // Increase backoff up to 2 minutes
        backoffRef.current = Math.min(backoffRef.current * 2, 120000)
      } finally {
        clearTimeout(timeout)
      }
    }

    // Kick off immediately
    fetchAlerts()

    // Adaptive polling interval based on backoff
    const schedule = () => {
      if (stopped) return
      intervalRef.current = setTimeout(async () => {
        await fetchAlerts()
        schedule()
      }, backoffRef.current) as unknown as ReturnType<typeof setInterval>
    }
    schedule()

    return () => {
      stopped = true
      if (intervalRef.current) clearTimeout(intervalRef.current as unknown as number)
      setIsConnected(false)
    }
  }, [])

  return <RealtimeContext.Provider value={{ alerts, isConnected, lastUpdate }}>{children}</RealtimeContext.Provider>
}
