"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { WalletConnection } from "./wallet-connection"
import { BalanceDisplay } from "./balance-display"
import { TransferForm } from "./transfer-form"
import { EmailSignup } from "./email-signup"
import { NetworkStatus } from "./network-status"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut, Wallet, DollarSign, Activity, Moon, Sun, Mail, ExternalLink } from "lucide-react"
import { StatsDisplay } from "./stats-display"

export function MainApp() {
  const { connected, account, disconnect } = useWallet()
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing wallet connection on mount
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen minimal-bg flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full spinner mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Loading SmoothSend...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen minimal-bg">
      {/* Header */}
      <header className="border-b border-gray-200/60 dark:border-gray-700/60 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center modern-shadow">
                <img 
                  src="/smoothsend-logo.png" 
                  alt="SmoothSend" 
                  className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">SmoothSend</h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">Gas-sponsored transfers on Aptos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-4">
              <div className="hidden sm:block">
                <NetworkStatus />
              </div>
              <Badge variant="secondary" className="text-xs font-medium">
                Testnet
              </Badge>
              <Button
                onClick={() => window.open('https://x.com/SmoothSend', '_blank')}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hidden sm:flex"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Twitter
              </Button>
              <Button
                onClick={() => window.open('https://x.com/SmoothSend', '_blank')}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 sm:hidden"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 fade-in">
        {!connected ? (
          <div className="max-w-md mx-auto">
            <Card className="glass-effect modern-shadow-lg border-0">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 modern-shadow">
                  <img 
                    src="/smoothsend-logo.png" 
                    alt="SmoothSend" 
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to SmoothSend</CardTitle>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Send USDC on Aptos with sponsored gas fees.<br />
                  No wallet setup required for testing.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <WalletConnection />
                
                {/* Testnet Helper */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                        🧪 Need a test wallet?
                      </h3>
                      <p className="text-xs text-blue-600 dark:text-blue-300 mb-3">
                        Use this pre-funded testnet address for quick testing:
                      </p>
                      <div className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-600 rounded-md p-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                          <code className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all pr-2">
                            0x5d39e7e11ebab92bcf930f3723c2498eb7accea57fce3c064ab1dba2df5ff29a
                          </code>
                          <Button
                            onClick={() => {
                              navigator.clipboard.writeText('0x5d39e7e11ebab92bcf930f3723c2498eb7accea57fce3c064ab1dba2df5ff29a')
                              // You could add a toast notification here
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 self-start sm:ml-2 flex-shrink-0"
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">
                        💡 Paste this address in the "To Address" field to test transfers
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="text-center py-8 animate-fadeInUp">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Send USDC with <span className="text-blue-600 dark:text-blue-400">Zero Gas Fees</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                Experience instant, gasless USDC transfers on Aptos testnet. 
                Your gas fees are sponsored by our relayer network.
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>Gas-Free</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span>Instant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                  <span>Secure</span>
                </div>
              </div>
            </div>

            {/* Quick Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeInUp" style={{animationDelay: '0.1s'}}>
              <Card className="modern-shadow border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <BalanceDisplay />
                </CardContent>
              </Card>
              
              <Card className="modern-shadow border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Wallet Status</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">Connected</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
                        {account?.address?.toString().slice(0, 8)}...{account?.address?.toString().slice(-6)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Action Areas - Transfer Form First */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
              {/* Transfer Form - Takes up 2 columns */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="modern-shadow-lg border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2 text-xl">
                      <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      <span className="dark:text-white">Send USDC</span>
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Transfer up to 10 USDC instantly with zero gas fees</p>
                  </CardHeader>
                  <CardContent>
                    <TransferForm />
                  </CardContent>
                </Card>

                {/* Mainnet Teaser Card */}
                <Card className="border-2 border-dashed border-blue-300 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-900/10 hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer" 
                      onClick={() => document.getElementById('waitlist-section')?.scrollIntoView({ behavior: 'smooth' })}>
                  <CardContent className="py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">🚀</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-blue-800 dark:text-blue-200 font-medium text-sm">Ready for mainnet?</p>
                        <p className="text-blue-600 dark:text-blue-400 text-xs">Join our waitlist to be first in line</p>
                      </div>
                      <div className="animate-bounce-arrow">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Side Panel */}
              <div className="space-y-6">
                {/* Connected Wallet Info */}
                <Card className="modern-shadow border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <div className="flex items-center space-x-2">
                        <Wallet className="w-5 h-5 text-purple-600" />
                        <span>Wallet</span>
                      </div>
                      <div className="w-3 h-3 bg-green-400 rounded-full status-online"></div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-gray-500 font-mono bg-gray-50 p-3 rounded-lg break-all mb-4">
                      {account?.address?.toString()}
                    </p>
                    <Button 
                      onClick={disconnect} 
                      variant="outline" 
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Disconnect
                    </Button>
                  </CardContent>
                </Card>

                {/* Stats Display */}
                <Card className="modern-shadow border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <StatsDisplay />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Mainnet Waitlist - Clean and Simple */}
            <Card className="modern-shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 animate-fadeInUp" style={{animationDelay: '0.4s'}}>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 modern-shadow">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                  🚀 Join the Mainnet Waitlist
                </CardTitle>
                <p className="text-blue-600 dark:text-blue-300 text-lg">
                  Be the first to experience SmoothSend on Aptos mainnet
                </p>
              </CardHeader>
              <CardContent>
                <EmailSignup />
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6 sm:py-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-white flex items-center justify-center">
              <img 
                src="/smoothsend-logo.png" 
                alt="SmoothSend" 
                className="w-3 h-3 sm:w-4 sm:h-4 object-contain"
              />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">SmoothSend</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
            Powered by Aptos • Built for seamless, gas-free transfers
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={() => window.open('https://x.com/SmoothSend', '_blank')}
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs sm:text-sm"
            >
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Follow us on Twitter</span>
              <span className="sm:hidden">Twitter</span>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
