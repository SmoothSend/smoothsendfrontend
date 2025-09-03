"use client"
import { MainApp } from "./components/main-app"
import { ErrorBoundary } from "./components/error-boundary"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  return (
    <ErrorBoundary>
      <MainApp />
      <Toaster />
    </ErrorBoundary>
  )
}
