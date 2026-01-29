"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { DEFAULT_EXCHANGE_RATE } from "~/lib/mock-data"
import type { ExchangeRate } from "~/lib/types"

interface ExchangeRateContextType {
  rate: ExchangeRate
  updateRate: (newRate: number) => void
  convertToLBP: (usd: number) => number
  formatLBP: (amount: number) => string
  formatUSD: (amount: number) => string
}

const ExchangeRateContext = createContext<ExchangeRateContextType | undefined>(undefined)

export function ExchangeRateProvider({ children }: { children: ReactNode }) {
  const [rate, setRate] = useState<ExchangeRate>({
    usdToLBP: DEFAULT_EXCHANGE_RATE,
    lastUpdated: new Date().toISOString(),
  })

  const updateRate = (newRate: number) => {
    setRate({
      usdToLBP: newRate,
      lastUpdated: new Date().toISOString(),
    })
  }

  const convertToLBP = (usd: number) => usd * rate.usdToLBP

  const formatLBP = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(amount) + " LBP"
  }

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <ExchangeRateContext.Provider
      value={{ rate, updateRate, convertToLBP, formatLBP, formatUSD }}
    >
      {children}
    </ExchangeRateContext.Provider>
  )
}

export function useExchangeRate() {
  const context = useContext(ExchangeRateContext)
  if (!context) {
    throw new Error("useExchangeRate must be used within an ExchangeRateProvider")
  }
  return context
}
