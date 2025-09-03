"use client"

import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Smartphone, Shield, Zap } from "lucide-react"
import { useState } from "react"

export function WalletConnection() {
  const { connect, wallets } = useWallet()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async (walletName: string) => {
    setIsConnecting(true)
    try {
      await connect(walletName)
    } catch (error) {
      console.error("Failed to connect:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const availableWallets = wallets?.filter(wallet => wallet.readyState === "Installed") || []

  return (
    <Card className="w-full max-w-md p-8 bg-white/5 backdrop-blur-xl border-white/10 rounded-3xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
        <p className="text-slate-300">Connect to start using SmoothSend</p>
      </div>

      <div className="space-y-3 mb-8">
        {availableWallets.length > 0 ? (
          availableWallets.map((wallet) => (
            <Button
              key={wallet.name}
              onClick={() => handleConnect(wallet.name)}
              disabled={isConnecting}
              className="w-full p-4 h-auto rounded-2xl border bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all duration-200"
              variant="ghost"
            >
              <div className="flex items-center justify-center space-x-4 w-full">
                <img src={wallet.icon} alt={wallet.name} className="w-8 h-8" />
                <div className="flex-1 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="font-semibold">{wallet.name}</span>
                  </div>
                  <p className="text-sm opacity-70">Connect with {wallet.name}</p>
                </div>
                {isConnecting && (
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
            </Button>
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-slate-300 mb-4">No wallets detected. Please install a wallet:</p>
            <div className="space-y-2">
              <Button
                onClick={() => window.open('https://petra.app/', '_blank')}
                className="w-full p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                variant="ghost"
              >
                Install Petra Wallet
              </Button>
              <Button
                onClick={() => window.open('https://martianwallet.xyz/', '_blank')}
                className="w-full p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                variant="ghost"
              >
                Install Martian Wallet
              </Button>
            </div>
          </div>
        )}
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
