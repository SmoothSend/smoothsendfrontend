"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "./wallet-provider"
import { Transaction } from "../lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { History, ExternalLink, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react"
import { apiService } from "../lib/api-service"

export function TransactionHistory() {
  const { address } = useWallet()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    if (!address) return

    setIsLoading(true)
    setError(null)

    try {
      // Try to fetch from API first
      const txData = await apiService.getTransactionHistory(address)
      
      // If we get empty array, show some mock transactions for demo
      if (txData.transactions.length === 0) {
        // Mock some recent transactions for demo
        const mockTransactions: Transaction[] = [
          {
            hash: "0x5ec176d7f999c033bde7c11cd4b77cd8808d131dd177bc7513e9ef50758e1cc7",
            type: "send",
            amount: 5.25,
            recipient: "0x5d39e7e11ebab92bcf930f3723c2498eb7accea57fce3c064ab1dba2df5ff29a",
            sender: address,
            status: "success",
            timestamp: new Date(Date.now() - 60000).toISOString(),
            blockHeight: 12345
          },
          {
            hash: "0x14676ec03450fe245478f415c4d22af822951805e1a8e6b3d7a5896c3c072b91",
            type: "send", 
            amount: 2.75,
            recipient: "0x083f4f675b622bfa85c599047b35f9397134f48026f6e90945b1e4a8881db39b",
            sender: address,
            status: "success",
            timestamp: new Date(Date.now() - 300000).toISOString(),
            blockHeight: 12344
          }
        ]
        setTransactions(mockTransactions)
      } else {
        setTransactions(txData.transactions)
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Failed to fetch transactions:", error)
      setError(error.message || "Failed to fetch transaction history")
      
      // Show empty state instead of error for now
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }, [address])

  useEffect(() => {
    if (address) {
      fetchTransactions()

      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchTransactions, 30000)
      return () => clearInterval(interval)
    }
  }, [address, fetchTransactions])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30"
      case "pending":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30"
      case "failed":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30"
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50"
    }
  }

  return (
    <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center">
            <History className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your transaction history</p>
          </div>
        </div>

        <Button
          onClick={fetchTransactions}
          disabled={isLoading}
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {error ? (
        <div className="text-center py-8">
          <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={fetchTransactions} variant="outline">
            Retry
          </Button>
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800/50 rounded-lg flex items-center justify-center mx-auto mb-4">
            <History className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Your transaction history will appear here</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {transactions.map((tx) => (
            <div key={tx.hash} className="p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800/70 rounded-lg transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      tx.type === "send" ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    }`}
                  >
                    <span className="text-lg">{tx.type === "send" ? "↗" : "↙"}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{tx.type}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {tx.type === "send"
                        ? `To ${tx.recipient.slice(0, 6)}...${tx.recipient.slice(-4)}`
                        : `From ${tx.sender.slice(0, 6)}...${tx.sender.slice(-4)}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${tx.type === "send" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                    {tx.type === "send" ? "-" : "+"}
                    {tx.amount.toFixed(2)} USDC
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(tx.timestamp).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(tx.status)}
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(tx.status)}`}>{tx.status}</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => window.open(`https://explorer.aptoslabs.com/txn/${tx.hash}?network=testnet`, "_blank")}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
