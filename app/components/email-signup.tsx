"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Twitter, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "../lib/api-service"

interface SignupData {
  email: string
  twitter?: string
  walletAddress?: string
}

export function EmailSignup() {
  const [email, setEmail] = useState("")
  const [twitter, setTwitter] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      })
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Submit to API service
      const result = await apiService.submitEmailSignup(email.trim(), twitter.trim() || undefined)

      if (result.success) {
        setIsSubmitted(true)
        toast({
          title: "Success! 🎉",
          description: "You've been added to our mainnet waitlist",
        })

        // Clear form
        setEmail("")
        setTwitter("")
      } else {
        throw new Error("Signup failed")
      }

    } catch (error) {
      console.error("Signup error:", error)
      toast({
        title: "Error",
        description: "Failed to sign up. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                You're on the list! 🚀
              </h3>
              <p className="text-green-600 dark:text-green-300 mt-1">
                We'll notify you when SmoothSend mainnet launches
              </p>
            </div>
            <Button 
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/20"
            >
              Sign up another email
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-lg text-blue-800 dark:text-blue-200">
              Join the Mainnet Waitlist
            </CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-300">
              Be the first to know when SmoothSend launches on mainnet
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label 
              htmlFor="email" 
              className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1"
            >
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label 
              htmlFor="twitter" 
              className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1"
            >
              <Twitter className="w-4 h-4" />
              Twitter Handle
              <span className="text-gray-400 text-xs">(optional)</span>
            </Label>
            <Input
              id="twitter"
              type="text"
              placeholder="@yourusername"
              value={twitter}
              onChange={(e) => {
                let value = e.target.value
                // Auto-add @ if not present
                if (value && !value.startsWith('@')) {
                  value = '@' + value
                }
                setTwitter(value)
              }}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium py-2.5"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Joining waitlist...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Join Waitlist
              </>
            )}
          </Button>
        </form>

        <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-gray-200 dark:border-gray-700">
          We'll only email you about SmoothSend mainnet updates. No spam! 📧
        </div>
      </CardContent>
    </Card>
  )
}
