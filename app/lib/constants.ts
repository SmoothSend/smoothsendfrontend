export const APTOS_NETWORK = process.env.NEXT_PUBLIC_APTOS_NETWORK || "testnet"
export const USDC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_USDC_CONTRACT || "0x3c27315fb69ba6e4b960f1507d1cefcc9a4247869f26a8d59d6b7869d23782c::test_coins::USDC"
export const SMOOTHSEND_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_SMOOTHSEND_CONTRACT || "0x6d88ee2fde204e756874e13f5d5eddebd50725805c0a332ade87d1ef03f9148b::smoothsend"
export const RELAYER_ADDRESS = process.env.NEXT_PUBLIC_RELAYER_ADDRESS || "0x5dfe1626d0397e882d80267b614cae3ebdae56a80809f3ddb7ada9d58366060a"

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
