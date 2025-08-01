export const APTOS_NETWORK = process.env.NEXT_PUBLIC_APTOS_NETWORK || "testnet"
export const USDC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_USDC_CONTRACT || "0x3c27315fb69ba6e4b960f1507d1cefcc9a4247869f26a8d59d6b7869d23782c::test_coins::USDC"
export const SMOOTHSEND_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_SMOOTHSEND_CONTRACT || "0x742d35cc6d42b9c78ee3306b66fc6c7e7a777e5cb07cb0df50c0fca7b1a96b2e::smoothsend"
export const RELAYER_ADDRESS = process.env.NEXT_PUBLIC_RELAYER_ADDRESS || "0x742d35cc6d42b9c78ee3306b66fc6c7e7a777e5cb07cb0df50c0fca7b1a96b2e"

export const WALLET_NAMES = {
  PETRA: "Petra",
  MARTIAN: "Martian",
  PONTEM: "Pontem",
  NIGHTLY: "Nightly",
} as const

export const TRANSACTION_STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
} as const

export const API_ENDPOINTS = {
  HEALTH: "/health",
  STATS: "/stats",
  GASLESS_QUOTE: "/gasless/quote",
  GASLESS_SUBMIT: "/gasless/submit",
  // Legacy endpoints (not used in gasless flow)
  BALANCE: "/balance",
  NONCE: "/nonce",
  BUILD_TRANSACTION: "/build-transaction",
  SUBMIT_TRANSACTION: "/submit-transaction",
  TRANSACTIONS: "/transactions",
  LIMITS: "/limits",
} as const

// Transaction limits
export const LIMITS = {
  MIN_USDC_AMOUNT: 1.0,
  MAX_USDC_AMOUNT: 10000.0,
  MIN_SLIPPAGE: 1,
  MAX_SLIPPAGE: 50,
} as const

// UI Configuration
export const SHOW_DEBUG = process.env.NEXT_PUBLIC_SHOW_DEBUG === "true"
