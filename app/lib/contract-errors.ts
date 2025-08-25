// Enhanced error handling for SmoothSend v2 contract
export const CONTRACT_ERRORS = {
  E_COIN_NOT_SUPPORTED: {
    code: 1,
    message: "This coin type is not supported. Only USDC and USDT are allowed.",
    userMessage: "Unsupported token"
  },
  E_RELAYER_NOT_WHITELISTED: {
    code: 2,
    message: "The relayer is not authorized to process transactions.",
    userMessage: "Service temporarily unavailable"
  },
  E_INSUFFICIENT_BALANCE: {
    code: 3,
    message: "Insufficient balance to complete the transaction including fees.",
    userMessage: "Insufficient balance"
  },
  E_NOT_ADMIN: {
    code: 4,
    message: "Only the contract admin can perform this action.",
    userMessage: "Unauthorized action"
  },
  E_AMOUNT_ZERO: {
    code: 5,
    message: "Transfer amount cannot be zero.",
    userMessage: "Amount must be greater than zero"
  },
  E_SELF_TRANSFER: {
    code: 6,
    message: "Cannot transfer tokens to yourself or the relayer.",
    userMessage: "Invalid recipient address"
  },
  E_OVERFLOW: {
    code: 7,
    message: "The transaction amount would cause a numerical overflow.",
    userMessage: "Amount too large"
  },
  E_RELAYER_FEE_ZERO: {
    code: 8,
    message: "Relayer fee cannot be zero.",
    userMessage: "Invalid fee calculation"
  },
  E_INVALID_ADDRESS: {
    code: 9,
    message: "The provided address is invalid.",
    userMessage: "Invalid address format"
  }
} as const;

// Helper function to get user-friendly error message
export function getErrorMessage(errorCode: number): string {
  const error = Object.values(CONTRACT_ERRORS).find(e => e.code === errorCode);
  return error?.userMessage || "An unexpected error occurred";
}

// Helper function to check if an error is a known contract error
export function isContractError(error: any): boolean {
  if (typeof error === 'string' && error.includes('Move abort')) {
    return true;
  }
  if (error?.message && typeof error.message === 'string') {
    return error.message.includes('Move abort') || error.message.includes('execution_failure');
  }
  return false;
}

// Extract error code from Move abort message
export function extractErrorCode(error: any): number | null {
  const errorStr = typeof error === 'string' ? error : error?.message || '';
  
  // Look for patterns like "Move abort in 0x...: 5" or "abort_code: 5"
  const patterns = [
    /Move abort.*?(\d+)$/,
    /abort_code[:\s]+(\d+)/,
    /error_code[:\s]+(\d+)/,
    /code[:\s]+(\d+)/
  ];
  
  for (const pattern of patterns) {
    const match = errorStr.match(pattern);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }
  
  return null;
}

// Main error handler for contract errors
export function handleContractError(error: any): string {
  if (!isContractError(error)) {
    return "Transaction failed. Please try again.";
  }
  
  const errorCode = extractErrorCode(error);
  if (errorCode !== null) {
    return getErrorMessage(errorCode);
  }
  
  return "Contract execution failed. Please check your input and try again.";
}

// Validation helpers for v2 security features
export const ValidationHelpers = {
  isZeroAmount: (amount: string): boolean => {
    return !amount || amount === "0" || parseFloat(amount) === 0;
  },
  
  isSelfTransfer: (fromAddress: string, toAddress: string, relayerAddress?: string): boolean => {
    if (fromAddress === toAddress) return true;
    if (relayerAddress && (fromAddress === relayerAddress || toAddress === relayerAddress)) return true;
    return false;
  },
  
  isOverflowRisk: (amount: string, fee: string): boolean => {
    try {
      const amountBig = BigInt(amount || "0");
      const feeBig = BigInt(fee || "0");
      const total = amountBig + feeBig;
      const maxU64 = BigInt("18446744073709551615");
      return total > maxU64;
    } catch {
      return true; // If we can't parse, assume it's risky
    }
  },
  
  validateAddress: (address: string): boolean => {
    // Basic Aptos address validation
    if (!address || typeof address !== 'string') return false;
    if (!address.startsWith('0x')) return false;
    if (address.length < 3 || address.length > 66) return false;
    return /^0x[a-fA-F0-9]+$/.test(address);
  }
};
