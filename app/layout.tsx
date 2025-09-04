import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AptosWalletProvider } from "./components/aptos-wallet-provider"

// Validate environment variables at startup
import { validateFrontendEnv } from "@/lib/env-schema"

// Validate environment variables when the module loads
try {
  validateFrontendEnv();
  // Environment is validated successfully
  if (typeof window === 'undefined') {
    // Server-side: environment is validated
    console.log('Environment validated for SSR');
  }
} catch (error) {
  // In production, this will cause the build to fail
  // In development, we log the error but continue
  if (process.env.NODE_ENV === 'production') {
    throw error;
  } else {
    console.warn('Environment validation failed in development mode:', error);
  }
}

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Smoothsend - Gasless USDC Transfers on Aptos",
  description: "Send USDC on Aptos blockchain without gas fees. Simple, fast, and secure.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AptosWalletProvider>
            {children}
          </AptosWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
