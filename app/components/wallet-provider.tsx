"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

interface WalletContextType {
  isConnected: boolean
  address: string | null
  walletName: string | null
  connect: (walletType: string) => Promise<void>
  disconnect: () => void
  isConnecting: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

interface WalletProviderProps {
  children: ReactNode;
}

// A generic interface for a wallet object that might exist on the window
interface WindowWallet {
  connect: () => Promise<{ address: string }>;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const connect = async (walletType: string) => {
    setIsConnecting(true);

    try {
      // For testnet mode, we use the hardcoded testnet account
      if (walletType === "testnet") {
        const testnetAddress = process.env.NEXT_PUBLIC_TESTNET_SENDER_ADDRESS;

        if (!testnetAddress) {
          throw new Error("Testnet address not configured");
        }

        setAddress(testnetAddress);
        setWalletName("Testnet Account");
        setIsConnected(true);

        // Store connection state
        localStorage.setItem("wallet_connected", "true");
        localStorage.setItem("wallet_address", testnetAddress);
        localStorage.setItem("wallet_type", "testnet");

        toast({
          title: "Connected to Testnet",
          description: "Successfully connected with pre-funded testnet account",
        });
        return;
      }

      // Legacy wallet connection code (for production use)
      const walletObj = (window as unknown as {
        [key: string]: WindowWallet | undefined;
      })[walletType.toLowerCase()];

      if (!walletObj) {
        toast({
          title: "Wallet Not Found",
          description: `${walletType} wallet is not installed. Please install it first.`,
          variant: "destructive",
        });
        return;
      }

      // Connect to wallet
      const response = await walletObj.connect();

      if (response.address) {
        setAddress(response.address);
        setWalletName(walletType);
        setIsConnected(true);

        // Store connection state
        localStorage.setItem("wallet_connected", "true");
        localStorage.setItem("wallet_address", response.address);
        localStorage.setItem("wallet_type", walletType);

        toast({
          title: "Wallet Connected",
          description: `Successfully connected to ${walletType}`,
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Failed to connect wallet:", error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false)
    setAddress(null)
    setWalletName(null)

    // Clear storage
    localStorage.removeItem("wallet_connected")
    localStorage.removeItem("wallet_address")
    localStorage.removeItem("wallet_type")

    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  useEffect(() => {
    // Check for existing connection
    const connected = localStorage.getItem("wallet_connected")
    const savedAddress = localStorage.getItem("wallet_address")
    const savedWalletType = localStorage.getItem("wallet_type")

    if (connected && savedAddress && savedWalletType) {
      setIsConnected(true)
      setAddress(savedAddress)
      setWalletName(savedWalletType)
    }
  }, [])

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        walletName,
        connect,
        disconnect,
        isConnecting,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
