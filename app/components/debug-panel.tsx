"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Bug, Server } from "lucide-react"
import { apiService } from "../lib/api-service"

interface TestResult {
  name: string;
  status: "success" | "failed";
  data?: unknown;
  error?: string;
}

export function DebugPanel() {
  const [debugInfo, setDebugInfo] = useState<{ timestamp: string; tests: TestResult[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runDiagnostics = async () => {
    setIsLoading(true)
    setError(null)
    setDebugInfo(null)

    const results: { timestamp: string; tests: TestResult[] } = {
      timestamp: new Date().toISOString(),
      tests: [],
    }

    // Test 1: Health Check
    try {
      const health = await apiService.healthCheck()
      results.tests.push({
        name: "Health Check",
        status: "success",
        data: health,
      })
    } catch (err: unknown) {
      const error = err as Error;
      results.tests.push({
        name: "Health Check",
        status: "failed",
        error: error.message,
      })
    }

    // Test 2: Debug Endpoint
    try {
      const debug = await apiService.getDebugInfo()
      results.tests.push({
        name: "Debug Info",
        status: "success",
        data: debug,
      })
    } catch (err: unknown) {
      const error = err as Error;
      results.tests.push({
        name: "Debug Info",
        status: "failed",
        error: error.message,
      })
    }

    // Test 3: Stats
    try {
      const stats = await apiService.getStats()
      results.tests.push({
        name: "Relayer Stats",
        status: "success",
        data: stats,
      })
    } catch (err: unknown) {
      const error = err as Error;
      results.tests.push({
        name: "Relayer Stats",
        status: "failed",
        error: error.message,
      })
    }

    // Test 4: Config
    try {
      const config = await apiService.getConfig()
      results.tests.push({
        name: "Protocol Config",
        status: "success",
        data: config,
      })
    } catch (err: unknown) {
      const error = err as Error;
      results.tests.push({
        name: "Protocol Config",
        status: "failed",
        error: error.message,
      })
    }

    setDebugInfo(results)
    setIsLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500/20 text-green-400"
      case "failed":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-yellow-500/20 text-yellow-400"
    }
  }

  return (
    <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10 rounded-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
            <Bug className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Debug Panel</h3>
            <p className="text-sm text-slate-400">Diagnose relayer issues</p>
          </div>
        </div>

        <Button
          onClick={runDiagnostics}
          disabled={isLoading}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
        >
          {isLoading ? "Running..." : "Run Diagnostics"}
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      )}

      {debugInfo && (
        <div className="space-y-4">
          <div className="text-sm text-slate-400 mb-4">
            Diagnostics run at: {new Date(debugInfo.timestamp).toLocaleString()}
          </div>

          {debugInfo.tests.map((test, index) => (
            <div key={index} className="p-4 bg-white/5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-white">{test.name}</h4>
                <Badge className={getStatusColor(test.status)}>{test.status}</Badge>
              </div>

              {test.error && (
                <div className="mb-3 p-3 bg-red-500/10 rounded-xl">
                  <p className="text-red-300 text-sm">{test.error}</p>
                </div>
              )}

              {!!test.data && (
                <div className="bg-slate-800/50 rounded-xl p-3">
                  <pre className="text-xs text-slate-300 overflow-x-auto">{JSON.stringify(test.data, null, 2)}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-500/10 rounded-2xl">
        <h4 className="font-medium text-white mb-2 flex items-center gap-2">
          <Server className="w-4 h-4" />
          Common Issues
        </h4>
        <ul className="text-sm text-slate-300 space-y-1">
          <li>• Check if relayer server is running on localhost:3001</li>
          <li>• Verify environment variables are set correctly</li>
          <li>• Ensure contract is deployed and accessible</li>
          <li>• Check relayer account has sufficient APT balance</li>
          <li>• Verify USDC contract address is correct</li>
        </ul>
      </div>
    </Card>
  )
}
