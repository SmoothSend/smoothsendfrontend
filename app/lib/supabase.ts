// Supabase client setup
// Note: Install @supabase/supabase-js when dependency conflicts are resolved

export interface EmailSignupData {
  email: string
  twitter?: string
  created_at?: string
}

// Real Supabase implementation using fetch API (since package installation is blocked)
class SupabaseClient {
  private supabaseUrl: string
  private supabaseKey: string

  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    this.supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }
  }

  async from(table: string) {
    return {
      insert: async (data: EmailSignupData[]) => {
        try {
          const response = await fetch(`${this.supabaseUrl}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.supabaseKey}`,
              'apikey': this.supabaseKey,
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(data[0]) // Insert single record
          })

          if (!response.ok) {
            const errorText = await response.text()
            console.error('Supabase error response:', errorText)
            throw new Error(`Supabase error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()

          return {
            data: [result],
            error: null
          }
        } catch (error) {
          return {
            data: null,
            error: { message: error instanceof Error ? error.message : 'Unknown error' }
          }
        }
      }
    }
  }
}

export const supabase = new SupabaseClient()

// When @supabase/supabase-js is installed, you can replace above with:
/*
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
*/
