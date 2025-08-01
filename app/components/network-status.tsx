"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Server, Globe } from "lucide-react"

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [relayerStatus, setRelayerStatus] = useState<"online" | "offline" | "checking">("checking")

  useEffect(() => {
    const checkRelayerHealth = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/relayer/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (response.ok) {
          const healthData = await response.json()
          setRelayerStatus(healthData.status === "healthy" ? "online" : "offline")
        } else {
          setRelayerStatus("offline")
        }
      } catch (error) {
        setRelayerStatus("offline")
      }
    }

    // Check immediately
    checkRelayerHealth()

    // Check every 30 seconds
    const interval = setInterval(checkRelayerHealth, 30000)

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      clearInterval(interval)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <div className="flex items-center space-x-3">
      <Badge 
        variant={isOnline ? "default" : "destructive"} 
        className="flex items-center space-x-1 text-xs"
      >
        {isOnline ? <Globe className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        <span>{isOnline ? "Online" : "Offline"}</span>
      </Badge>

      <Badge
        variant={relayerStatus === "online" ? "default" : relayerStatus === "offline" ? "destructive" : "secondary"}
        className="flex items-center space-x-1 text-xs"
      >
        <div
          className={`w-2 h-2 rounded-full ${
            relayerStatus === "online" 
              ? "bg-green-400 status-online" 
              : relayerStatus === "offline" 
                ? "bg-red-400 status-offline" 
                : "bg-yellow-400"
          }`}
        />
        <Server className="w-3 h-3" />
        <span>
          {relayerStatus === "checking" 
            ? "Checking..." 
            : relayerStatus === "online" 
              ? "Relayer Ready" 
              : "Relayer Down"
          }
        </span>
      </Badge>
    </div>
  )
}
