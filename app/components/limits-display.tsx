"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { apiService, LimitsResponse } from "../lib/api-service"
import { useToast } from "@/hooks/use-toast"

export function LimitsDisplay() {
  const [limits, setLimits] = useState<LimitsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchLimits = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const limitsData = await apiService.getLimits()
      setLimits(limitsData)
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Failed to fetch limits:", error)
      setError(error.message || "Failed to fetch limits")
      toast({
        title: "Limits Error",
        description: "Failed to fetch transaction limits",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchLimits()
  }, [fetchLimits])

  if (error) {
    return (
      <Card className="p-6 bg-red-500/10 backdrop-blur-xl border-red-500/20 rounded-3xl">
        <div className="flex items-center justify-between">
          <p className="text-red-300">Failed to load limits</p>
          <Button onClick={fetchLimits} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10 rounded-3xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Transaction Limits</h3>
        <Button
          onClick={fetchLimits}
          disabled={isLoading}
          variant="ghost"
          size="sm"
          className="text-slate-300 hover:text-white hover:bg-white/10 rounded-xl"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-white/5 rounded-2xl animate-pulse">
              <div className="w-8 h-8 bg-slate-700 rounded-lg mb-2"></div>
              <div className="w-16 h-4 bg-slate-700 rounded mb-1"></div>
              <div className="w-12 h-3 bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : limits ? (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white/5 rounded-2xl text-center">
            <TrendingDown className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-slate-400 mb-1">Min Transfer</p>
            <p className="text-lg font-semibold text-white">
              {(Number(limits.minTransfer) / 1000000).toFixed(2)} USDC
            </p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl text-center">
            <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-slate-400 mb-1">Max Transfer</p>
            <p className="text-lg font-semibold text-white">
              {(Number(limits.maxTransfer) / 1000000).toLocaleString()} USDC
            </p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl text-center">
            <DollarSign className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-slate-400 mb-1">Coin Type</p>
            <p className="text-xs font-mono text-slate-300 break-all">{limits.coinType?.split('::').pop()}</p>
          </div>
        </div>
      ) : null}
    </Card>
  )
}
