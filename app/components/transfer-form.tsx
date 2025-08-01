"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useWallet } from "./wallet-provider"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Send, User, DollarSign, Settings, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "../lib/api-service"
import { TransactionProgress } from "./transaction-progress"

export function TransferForm() {
  const { address } = useWallet()
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [slippage, setSlippage] = useState(10)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [balance, setBalance] = useState<number>(0)
  const [currentQuote, setCurrentQuote] = useState<any>(null)
  const { toast } = useToast()

  const MAX_TRANSFER_LIMIT = 10 // 10 USDC maximum transfer limit
  
  const isValidAddress = recipient.length === 66 && recipient.startsWith("0x")
  const amountNum = parseFloat(amount) || 0
  const isValidAmount = amountNum > 0 && amountNum <= Math.min(balance, MAX_TRANSFER_LIMIT)

  // Fetch balance on component mount
  useEffect(() => {
    const fetchBalance = async () => {
      if (!address) return
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/relayer/balance/${address}`)
        if (response.ok) {
          const balanceData = await response.json()
          if (balanceData.success) {
            setBalance(balanceData.balance)
          }
        }
      } catch (error) {
        // Use demo balance for testnet
        setBalance(2868.82)
      }
    }
    
    fetchBalance()
  }, [address])

  // For testnet production - get user signature
  const getUserSignatureForTestnet = async (userAddress: string) => {
    // In testnet production, users can provide their private key for testing
    // In mainnet, this would integrate with actual wallet extensions
    
    // Get testnet private key from environment variables
    const testPrivateKey = process.env.NEXT_PUBLIC_TESTNET_SENDER_PRIVATE_KEY
    
    if (!testPrivateKey) {
      throw new Error('Testnet sender private key not configured in environment variables')
    }
    
    // The backend expects a signature object but will handle the actual signing
    // for testnet production deployment
    return {
      signature: testPrivateKey, // Backend will use this for testnet signing
      publicKey: "" // Empty string for testnet mode
    }
  }  // Get live quote when amount/recipient changes
  useEffect(() => {
    const getQuote = async () => {
      if (!address || !recipient || !amount || !isValidAddress || !isValidAmount) {
        setCurrentQuote(null)
        return
      }

      try {
        const amountNum = parseFloat(amount)
        const coinType = process.env.NEXT_PUBLIC_USDC_CONTRACT || "0x3c27315fb69ba6e4b960f1507d1cefcc9a4247869f26a8d59d6b7869d23782c::test_coins::USDC"
        
        // Use testnet account for all operations
        const testAccountAddress = process.env.NEXT_PUBLIC_TESTNET_SENDER_ADDRESS
        
        if (!testAccountAddress) {
          console.error("Testnet sender address not configured")
          return
        }
        
        const quote = await apiService.getGaslessQuote({
          fromAddress: testAccountAddress, // Always use testnet account from env
          toAddress: recipient,
          amount: (amountNum * 1_000_000).toString(),
          coinType
        })

        setCurrentQuote(quote)
      } catch (error) {
        setCurrentQuote(null)
      }
    }

    const timeoutId = setTimeout(getQuote, 500) // Debounce
    return () => clearTimeout(timeoutId)
  }, [address, recipient, amount, isValidAddress, isValidAmount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipient || !amount || !address) return

    setIsSubmitting(true)
    setCurrentStep(0)
    setShowSuccess(false)

    try {
      // Step 1: Validate inputs
      const amountNum = parseFloat(amount)
      if (amountNum <= 0) {
        throw new Error("Amount must be greater than 0")
      }
      if (amountNum > MAX_TRANSFER_LIMIT) {
        throw new Error(`Amount cannot exceed ${MAX_TRANSFER_LIMIT} USDC per transaction`)
      }
      if (amountNum > balance) {
        throw new Error("Insufficient balance")
      }

      setCurrentStep(1)

      // Step 2: Get quote for gasless transaction (user pays USDC fees)
      const coinType = process.env.NEXT_PUBLIC_USDC_CONTRACT || "0x3c27315fb69ba6e4b960f1507d1cefcc9a4247869f26a8d59d6b7869d23782c::test_coins::USDC"
      
      const quote = await apiService.getGaslessQuote({
        fromAddress: address,
        toAddress: recipient,
        amount: (amountNum * 1_000_000).toString(),
        coinType
      })

      setCurrentQuote(quote)
      setCurrentStep(2)

      // Step 3: Get testnet account signature
      setCurrentStep(3)

      // Get testnet account signature (users don't need wallets)
      const testnetSignature = await getUserSignatureForTestnet(address)

      // Get testnet sender address from environment
      const testnetSenderAddress = process.env.NEXT_PUBLIC_TESTNET_SENDER_ADDRESS
      if (!testnetSenderAddress) {
        throw new Error('Testnet sender address not configured in environment variables')
      }

      // Step 4: Submit gasless transaction with testnet signature
      setCurrentStep(4)
      const result = await apiService.submitGaslessTransaction({
        transaction: quote.transactionData, // Use transaction data from quote
        userSignature: testnetSignature, // Testnet account signature
        fromAddress: testnetSenderAddress, // Use testnet account address from env
        toAddress: recipient,
        amount: (amountNum * 1_000_000).toString(),
        coinType,
        relayerFee: quote.quote.relayerFee
      })

      if (result.success && result.hash) {
        setCurrentStep(5) // Final confirmation step
        setTransactionHash(result.hash)
        setShowSuccess(true)
        
        toast({
          title: "Gasless Transaction Successful! 🎉",
          description: `Sent ${amount} USDC! You paid a small USDC fee (${(parseFloat(quote.quote.relayerFee) / 1_000_000).toFixed(6)} USDC) instead of APT gas.`,
        })
        
        // Reset form
        setRecipient("")
        setAmount("")
      } else {
        throw new Error(result.error || "Transaction failed")
      }

    } catch (error: any) {
      console.error("Transaction error:", error)
      toast({
        title: "Transaction Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setCurrentStep(0)
    }
  }

  const handleMaxClick = async () => {
    if (!address) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/relayer/balance/${address}`)
      if (response.ok) {
        const balanceData = await response.json()
        if (balanceData.success) {
          setBalance(balanceData.balance)
          // Set amount to minimum of balance and max transfer limit
          const maxAmount = Math.min(balanceData.balance, MAX_TRANSFER_LIMIT)
          setAmount(maxAmount.toString())
        }
      } else {
        throw new Error("Failed to fetch balance")
      }
    } catch (error) {
      // Use demo values for testnet
      setBalance(2868.82)
      setAmount(MAX_TRANSFER_LIMIT.toString())
    }
  }

  const steps = [
    "Getting quote with USDC fees",
    "Submitting gasless transaction",
    "Processing on Aptos network"
  ]

  if (showSuccess) {
    return (
      <Card className="p-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-xl border-green-500/20 rounded-3xl text-center">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Gasless Transaction Successful! 🎉</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Your USDC has been sent! You paid a small USDC fee instead of APT gas.</p>
        {transactionHash && (
          <Button
            onClick={() =>
              window.open(`https://explorer.aptoslabs.com/txn/${transactionHash}?network=testnet`, "_blank")
            }
            variant="outline"
            className="mb-4"
          >
            View on Explorer
          </Button>
        )}
        <Button onClick={() => setShowSuccess(false)} className="bg-green-500 hover:bg-green-600 text-white rounded-xl">
          Send Another
        </Button>
      </Card>
    )
  }

  if (isSubmitting) {
    return <TransactionProgress currentStep={currentStep} steps={steps} />
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="recipient" className="text-gray-900 dark:text-gray-200 flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Recipient Address</span>
          </Label>
          <Input
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 rounded-lg h-12"
            required
          />
          {!recipient && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md p-3 mt-2">
              <p className="text-xs text-blue-600 dark:text-blue-300 mb-2">
                💡 <strong>Need a test address?</strong> Try this one:
              </p>
              <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-600 rounded-md p-2">
                <code className="text-xs font-mono text-gray-700 dark:text-gray-300 flex-1 mr-2">
                  0x5d39e7e11ebab92bcf930f3723c2498eb7accea57fce3c064ab1dba2df5ff29a
                </code>
                <Button
                  type="button"
                  onClick={() => {
                    setRecipient('0x5d39e7e11ebab92bcf930f3723c2498eb7accea57fce3c064ab1dba2df5ff29a')
                    navigator.clipboard.writeText('0x5d39e7e11ebab92bcf930f3723c2498eb7accea57fce3c064ab1dba2df5ff29a')
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs"
                >
                  Use This
                </Button>
              </div>
            </div>
          )}
          {recipient && !isValidAddress && (
            <p className="text-red-500 dark:text-red-400 text-sm flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>Invalid address format</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount" className="text-gray-900 dark:text-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>Amount (USDC)</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Max: {Math.min(balance, MAX_TRANSFER_LIMIT).toFixed(6)} USDC
            </div>
          </Label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 rounded-lg h-12 pr-16"
              min="0.000001"
              max={MAX_TRANSFER_LIMIT}
              step="0.000001"
              required
            />
            <Button
              type="button"
              onClick={handleMaxClick}
              className="absolute right-2 top-2 h-8 px-3 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              MAX
            </Button>
          </div>
          {amount && amountNum > 0 && (
            <div className="text-xs space-y-1">
              {amountNum > MAX_TRANSFER_LIMIT && (
                <p className="text-red-500 dark:text-red-400 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Maximum transfer limit is {MAX_TRANSFER_LIMIT} USDC</span>
                </p>
              )}
              {amountNum > balance && (
                <p className="text-red-500 dark:text-red-400 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Insufficient balance (Available: {balance.toFixed(6)} USDC)</span>
                </p>
              )}
              {amountNum > 0 && amountNum <= Math.min(balance, MAX_TRANSFER_LIMIT) && (
                <p className="text-green-500 dark:text-green-400 flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Valid amount</span>
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">APT Gas Fee</span>
            <span className="text-green-500 dark:text-green-400 font-medium">FREE (Relayer pays)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Relayer Fee</span>
            <span className="text-orange-500 dark:text-orange-400">
              {currentQuote ? `${currentQuote.quote.relayerFee} USDC` : "~0.01 USDC (10% markup)"}
            </span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
            <span className="text-gray-900 dark:text-gray-100 font-medium">You Pay</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              {amount || "0"} USDC + {currentQuote ? currentQuote.quote.relayerFee : "fee"}
            </span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={!isValidAddress || !isValidAmount || isSubmitting}
          className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium py-3 rounded-lg h-12 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Gaslessly
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
