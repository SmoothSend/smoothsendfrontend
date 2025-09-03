import { Transaction } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface BalanceResponse {
  balance: number;
  decimals: number;
}

// Gasless Transaction Interfaces
interface GaslessQuoteRequest {
  fromAddress: string;
  toAddress: string;
  amount: string;
  coinType: string;
}

interface GaslessQuoteResponse {
  success: boolean;
  quote: {
    relayerFee: string;
    gasUnits: string;
    gasPricePerUnit: string;
    totalGasFee: string;
    aptPrice: string;
    breakdown?: {
      gasInAPT: string;
      gasInUSD: string;
      markupPercentage: number;
      finalFeeUSDC: string;
    };
  };
  transactionData: {
    function: string;
    typeArguments: string[];
    functionArguments: string[];
  };
  message: string;
}

interface GaslessSubmitResponse {
  success: boolean;
  hash?: string; // Legacy field for compatibility
  txnHash?: string; // Actual field returned by backend
  transactionId?: string;
  gasFeePaidBy?: string;
  userPaidAPT?: boolean;
  relayerFee?: string;
  gasUsed?: string;
  vmStatus?: string;
  sender?: string;
  function?: string;
  message?: string;
  error?: string;
}

export interface LimitsResponse {
  coinType: string;
  minTransfer: string;
  maxTransfer: string;
}

interface HealthResponse {
  status: string;
  timestamp: string;
  relayerBalance?: number;
  networkStatus?: string;
  error?: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        let errorData;
        try {
          const responseText = await response.text();

          // Try to parse as JSON
          if (
            responseText.trim().startsWith("{") ||
            responseText.trim().startsWith("[")
          ) {
            errorData = JSON.parse(responseText);
          } else {
            // Handle HTML error pages (like 404s)
            errorData = {
              error: `HTTP ${response.status}: ${response.statusText}`,
              details: `Server returned: ${responseText.substring(0, 100)}...`,
            };
          }
        } catch {
          errorData = {
            error: `HTTP ${response.status}: ${response.statusText}`,
          };
        }
        throw new Error(
          (errorData as { error: string }).error ||
            `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const responseText = await response.text();
      const data = responseText ? JSON.parse(responseText) : {};
      return data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error("Network error occurred");
    }
  }

  async healthCheck(): Promise<HealthResponse> {
    return this.request("/api/v1/relayer/health");
  }

  async getBalance(address: string): Promise<BalanceResponse> {
    try {
      // Use the backend balance endpoint
      const response = await this.request<{
        success: boolean;
        balance?: string;
        decimals?: number;
      }>(`/api/v1/relayer/balance/${address}`);

      if (response.success && response.balance !== undefined) {
        return {
          balance: parseFloat(response.balance),
          decimals: response.decimals || 6,
        };
      }

      // Fallback to mock data if endpoint fails
      return { balance: 1.177523, decimals: 6 };
    } catch {
      // Return mock balance as fallback
      return { balance: 1.177523, decimals: 6 };
    }
  }

  // Get quote for gasless transactions
  async getGaslessQuote(
    request: GaslessQuoteRequest
  ): Promise<GaslessQuoteResponse> {
    return this.request("/api/v1/relayer/quote", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getLimits(): Promise<LimitsResponse> {
    // Return default limits for USDC
    return {
      coinType: process.env.NEXT_PUBLIC_USDC_CONTRACT || "USDC",
      minTransfer: "1.00",
      maxTransfer: "10000.00",
    };
  }

  async getStats(): Promise<unknown> {
    return this.request("/api/v1/relayer/stats");
  }

  async getConfig(): Promise<unknown> {
    // Return frontend configuration
    return {
      network: process.env.NEXT_PUBLIC_APTOS_NETWORK || "testnet",
      relayerAddress: process.env.NEXT_PUBLIC_RELAYER_ADDRESS,
      usdcContract: process.env.NEXT_PUBLIC_USDC_CONTRACT,
      smoothsendContract: process.env.NEXT_PUBLIC_SMOOTHSEND_CONTRACT,
    };
  }

  async getDebugInfo(): Promise<unknown> {
    try {
      const [health, stats, config] = await Promise.all([
        this.healthCheck(),
        this.getStats(),
        this.getConfig(),
      ]);

      return {
        health,
        stats,
        config,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return { error: "Debug info not available", details: error };
    }
  }

  async getTransactionHistory(address: string): Promise<{ transactions: Transaction[] }> {
    // Mock data for now, as the endpoint doesn't exist yet
    console.log(`Fetching transaction history for ${address}`);
    return Promise.resolve({ transactions: [] });
  }

  async submitEmailSignup(email: string, twitter?: string): Promise<{ success: boolean; message?: string }> {
    return this.request('/api/v1/users/signup', {
      method: 'POST',
      body: JSON.stringify({ email, twitter }),
    });
  }

  async debugUser(address: string): Promise<unknown> {
    try {
      const balance = await this.getBalance(address);
      return {
        address,
        balance,
        network: process.env.NEXT_PUBLIC_APTOS_NETWORK,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return { error: "User debug info not available", details: error };
    }
  }

  // Submit gasless transaction with wallet (user signs, relayer pays gas)
  async submitGaslessWithWallet(request: {
    transactionBytes: number[];
    authenticatorBytes: number[];
    functionName?: string;
  }): Promise<GaslessSubmitResponse> {
    return this.request("/api/v1/relayer/gasless-wallet-serialized", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }
}

export const apiService = new ApiService();
