import { EmailSignupData, supabase } from './supabase'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

interface ApiResponse<T> {
  success?: boolean
  data?: T
  error?: string
}

interface BalanceResponse {
  balance: number
  decimals: number
}

interface QuoteResponse {
  quote?: string
  error?: string
}

interface SubmissionResponse {
  success: boolean
  error?: string
}

// Gasless Transaction Interfaces
interface GaslessQuoteRequest {
  fromAddress: string
  toAddress: string
  amount: string
  coinType: string
}

interface GaslessQuoteResponse {
  success: boolean
  quote: {
    relayerFee: string
    gasUnits: string
    gasPricePerUnit: string
    totalGasFee: string
    aptPrice: string
    breakdown?: {
      gasInAPT: string
      gasInUSD: string
      markupPercentage: number
      finalFeeUSDC: string
    }
  }
  transactionData: {
    function: string
    typeArguments: string[]
    functionArguments: string[]
  }
  message: string
}

interface GaslessSubmitRequest {
  transaction: any // Raw transaction object from wallet signing
  userSignature: {
    signature: string
    publicKey: string
  }
  fromAddress: string
  toAddress: string
  amount: string
  coinType: string
  relayerFee: string
}

interface GaslessSubmitResponse {
  success: boolean
  hash?: string
  transactionId?: string
  gasFeePaidBy?: string
  userPaidAPT?: boolean
  relayerFee?: string
  message?: string
  error?: string
}

interface LimitsResponse {
  coinType: string
  minTransfer: string
  maxTransfer: string
}

interface StatsResponse {
  relayerAddress: string
  isActive: boolean
  balance: string
  totalTransactions: number
  successfulTransactions: number
  failedTransactions: number
  totalVolume: string
  averageGasCost: string
  cacheSize: number
  errorBreakdown: {
    signatureErrors: number
    timeoutErrors: number
    networkErrors: number
    other: number
  }
}

interface HealthResponse {
  status: string
  timestamp: string
  relayerBalance?: number
  networkStatus?: string
  error?: string
}



class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...options,
      })

      if (!response.ok) {
        let errorData
        try {
          const responseText = await response.text()
          
          // Try to parse as JSON
          if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
            errorData = JSON.parse(responseText)
          } else {
            // Handle HTML error pages (like 404s)
            errorData = { 
              error: `HTTP ${response.status}: ${response.statusText}`,
              details: `Server returned: ${responseText.substring(0, 100)}...`
            }
          }
        } catch (parseError) {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const responseText = await response.text()
      const data = responseText ? JSON.parse(responseText) : {}
      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Network error occurred")
    }
  }

  async healthCheck(): Promise<HealthResponse> {
    return this.request("/api/v1/relayer/health")
  }

  async getBalance(address: string): Promise<BalanceResponse> {
    try {
      // Use the backend balance endpoint
      const response: any = await this.request(`/api/v1/relayer/balance/${address}`)
      
      if (response.success && response.balance !== undefined) {
        return { 
          balance: parseFloat(response.balance), 
          decimals: response.decimals || 6 
        }
      }
      
      // Fallback to mock data if endpoint fails
      return { balance: 1.177523, decimals: 6 }
    } catch (error) {
      // Return mock balance as fallback
      return { balance: 1.177523, decimals: 6 }
    }
  }

  // Get quote for gasless transaction (user pays USDC fees)
  async getQuote(amount: string): Promise<QuoteResponse> {
    try {
      const response: any = await this.request(`/api/v1/relayer/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      })
      
      if (response.success) {
        return { quote: response.quote }
      }
      
      throw new Error(response.error || 'Quote failed')
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Quote request failed' }
    }
  }

  // Get quote for gasless transactions
  async getGaslessQuote(request: GaslessQuoteRequest): Promise<GaslessQuoteResponse> {
    return this.request("/api/v1/relayer/gasless/quote", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  // Submit gasless transaction (user pays USDC fees) 
  async submitGaslessTransaction(request: GaslessSubmitRequest): Promise<GaslessSubmitResponse> {
    return this.request("/api/v1/relayer/gasless/submit", {
      method: "POST", 
      body: JSON.stringify(request),
    })
  }

  // Helper method to get transaction with wallet signing
  async executeGaslessTransfer(
    senderAddress: string,
    recipientAddress: string,
    amount: string,
    signTransaction: (transaction: any) => Promise<{ signature: string; publicKey: string }>
  ): Promise<GaslessSubmitResponse> {
    const coinType = process.env.NEXT_PUBLIC_USDC_CONTRACT || "0x3c27315fb69ba6e4b960f1507d1cefcc9a4247869f26a8d59d6b7869d23782c::test_coins::USDC"

    // Step 1: Get quote
    const quote = await this.getGaslessQuote({
      fromAddress: senderAddress,
      toAddress: recipientAddress,
      amount,
      coinType,
    })

    // Step 2: Create transaction payload  
    const transactionPayload = {
      fromAddress: senderAddress,
      toAddress: recipientAddress,
      amount,
      coinType,
      relayerFee: quote.quote.relayerFee,
    }

    // Step 3: Sign transaction (this will be handled by wallet)
    const signature = await signTransaction(transactionPayload)

    // Step 4: Submit to relayer (this method is for reference only)
    return this.submitGaslessTransaction({
      transaction: transactionPayload, // This would be the signed transaction object in practice
      userSignature: signature,
      fromAddress: senderAddress,
      toAddress: recipientAddress,
      amount,
      coinType,
      relayerFee: quote.quote.relayerFee,
    })
  }



  async getLimits(): Promise<LimitsResponse> {
    // Return default limits for USDC
    return {
      coinType: process.env.NEXT_PUBLIC_USDC_CONTRACT || "USDC",
      minTransfer: "1.00",
      maxTransfer: "10000.00"
    }
  }

  async getStats(): Promise<any> {
    return this.request("/api/v1/relayer/stats")
  }

  async getConfig(): Promise<any> {
    // Return frontend configuration
    return {
      network: process.env.NEXT_PUBLIC_APTOS_NETWORK || "testnet",
      relayerAddress: process.env.NEXT_PUBLIC_RELAYER_ADDRESS,
      usdcContract: process.env.NEXT_PUBLIC_USDC_CONTRACT,
      smoothsendContract: process.env.NEXT_PUBLIC_SMOOTHSEND_CONTRACT,
    }
  }

  async getDebugInfo(): Promise<any> {
    try {
      const [health, stats, config] = await Promise.all([
        this.healthCheck(),
        this.getStats(),
        this.getConfig(),
      ])

      return {
        health,
        stats,
        config,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return { error: "Debug info not available", details: error }
    }
  }

  async debugUser(address: string): Promise<any> {
    try {
      const balance = await this.getBalance(address)
      return {
        address,
        balance,
        network: process.env.NEXT_PUBLIC_APTOS_NETWORK,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return { error: "User debug info not available", details: error }
    }
  }

  // Mock transaction history - would need to be implemented in relayer
  async getTransactionHistory(address: string): Promise<{ transactions: any[] }> {
    // This would need a new endpoint in your relayer to track user transactions
    // For now, return empty array
    return { transactions: [] }
  }

  // Email signup for mainnet waitlist
  async submitEmailSignup(email: string, twitter?: string): Promise<SubmissionResponse> {
    try {
      // Prepare the signup data
      const signupData = {
        email: email.trim(),
        twitter: twitter?.trim() || undefined,
        created_at: new Date().toISOString()
      }

      // Insert into Supabase via REST API
      const table = await supabase.from('waitlist')
      const { data: result, error } = await table.insert([signupData])

      if (error) {
        return { 
          success: false, 
          error: `Database error: ${error.message}` 
        }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Signup failed' 
      }
    }
  }
}

export const apiService = new ApiService()
