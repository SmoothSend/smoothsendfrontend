"use client"

import { Card } from "@/components/ui/card"
import { Send, CheckCircle, Loader2 } from "lucide-react"

interface TransactionProgressProps {
  currentStep: number
  steps?: string[]
}

export function TransactionProgress({ currentStep, steps: customSteps }: TransactionProgressProps) {
  const defaultSteps = [
    "Building transaction",
    "Getting gas quote",
    "Requesting wallet signature",
    "Submitting gasless transaction",
    "Confirming on blockchain",
  ]
  const steps = customSteps || defaultSteps

  return (
    <Card className="p-8 bg-white/5 backdrop-blur-xl border-white/10 rounded-3xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Send className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Processing Transaction</h3>
        <p className="text-slate-300">Please wait while we process your transfer</p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index < currentStep ? "bg-green-500" : index === currentStep ? "bg-blue-500" : "bg-slate-600"
              }`}
            >
              {index < currentStep ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : index === currentStep ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <span className="text-white text-sm">{index + 1}</span>
              )}
            </div>
            <div className="flex-1">
              <p className={`font-medium ${index <= currentStep ? "text-white" : "text-slate-400"}`}>{step}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
