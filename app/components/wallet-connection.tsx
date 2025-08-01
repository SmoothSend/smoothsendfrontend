"use client"

import { useWallet } from "./wallet-provider"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Smartphone, Shield, Zap } from "lucide-react"

export function WalletConnection() {
  const { connect, isConnecting } = useWallet()

  const handleConnect = async () => {
    await connect("testnet")
  }

  return (
    <Card className="w-full max-w-md p-8 bg-white/5 backdrop-blur-xl border-white/10 rounded-3xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
        <p className="text-slate-300">Connect to start using SmoothSend testnet</p>
      </div>

      <div className="space-y-3 mb-8">
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full p-4 h-auto rounded-2xl border bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all duration-200"
          variant="ghost"
        >
          <div className="flex items-center justify-center space-x-4 w-full">
            <div className="text-2xl">🚀</div>
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center space-x-2">
                <span className="font-semibold">Connect to Testnet</span>
              </div>
              <p className="text-sm opacity-70">Pre-funded testnet account</p>
            </div>
            {isConnecting && (
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-white/5 rounded-xl">
          <Shield className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-xs text-slate-300">Secure</p>
        </div>
        <div className="p-3 bg-white/5 rounded-xl">
          <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <p className="text-xs text-slate-300">Gasless</p>
        </div>
        <div className="p-3 bg-white/5 rounded-xl">
          <Smartphone className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-xs text-slate-300">Testnet</p>
        </div>
      </div>
    </Card>
  )
}
