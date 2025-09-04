import { z } from 'zod';

/**
 * Frontend Environment Variable Schema
 * Simplified version for Next.js frontend with NEXT_PUBLIC_ prefixes
 */

export const frontendEnvSchema = z.object({
  // API Configuration
  NEXT_PUBLIC_API_URL: z.string().url(),
  
  // Aptos Network Configuration
  NEXT_PUBLIC_APTOS_NETWORK: z.enum(['mainnet', 'testnet', 'devnet']).default('testnet'),
  
  // Contract Addresses
  NEXT_PUBLIC_USDC_CONTRACT: z.string().min(1, 'USDC contract address is required'),
  NEXT_PUBLIC_SMOOTHSEND_CONTRACT: z.string().min(1, 'SmoothSend contract address is required'),
  NEXT_PUBLIC_RELAYER_ADDRESS: z.string().min(1, 'Relayer address is required'),
  
  // Optional Test Configuration
  NEXT_PUBLIC_TESTNET_SENDER_ADDRESS: z.string().optional(),
  
  // Supabase Configuration (optional)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  
  // Debug Configuration
  NEXT_PUBLIC_SHOW_DEBUG: z.string().default('false').transform(val => val === 'true'),
});

export type FrontendEnv = z.infer<typeof frontendEnvSchema>;

/**
 * Validates and parses frontend environment variables
 * This function should be called at application startup
 */
export function validateFrontendEnv(): FrontendEnv {
  try {
    const parsed = frontendEnvSchema.parse(process.env);
    console.log('✅ Frontend environment variables validated successfully');
    return parsed;
  } catch (error) {
    console.error('❌ Frontend environment validation failed:');
    if (error instanceof z.ZodError) {
      error.issues.forEach(issue => {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
      });
    }
    throw new Error('Invalid environment configuration');
  }
}

/**
 * Environment variable documentation for frontend developers
 */
export const FRONTEND_ENV_DOCS = {
  required: [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_USDC_CONTRACT',
    'NEXT_PUBLIC_SMOOTHSEND_CONTRACT', 
    'NEXT_PUBLIC_RELAYER_ADDRESS'
  ],
  optional: [
    'NEXT_PUBLIC_APTOS_NETWORK',
    'NEXT_PUBLIC_TESTNET_SENDER_ADDRESS',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SHOW_DEBUG'
  ]
} as const;
