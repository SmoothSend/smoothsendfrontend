"use client"

import React from 'react'
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react'
import { Network } from '@aptos-labs/ts-sdk'

export function AptosWalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{
        network: Network.TESTNET,
      }}
      onError={(error) => {
        console.error("Wallet connection error:", error)
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  )
}
