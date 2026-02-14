"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface ExchangeRateContextType {
  exchangeRate: number; // الرقم مباشرة (مثلاً 90000)
  rate: number; // alias للـ exchangeRate
  setExchangeRate: (newRate: number) => void;
  convertToLBP: (usd: number) => number;
  formatLBP: (amount: number) => string;
  formatUSD: (amount: number) => string;
}

const ExchangeRateContext = createContext<ExchangeRateContextType | undefined>(undefined)

export function ExchangeRateProvider({ 
  children, 
  initialRate = 89000 // قيمة افتراضية في حال لم تتوفر من السيرفر
}: { 
  children: ReactNode;
  initialRate?: number;
}) {
  const [exchangeRate, setExchangeRate] = useState<number>(initialRate)

  const convertToLBP = (usd: number) => usd * exchangeRate

  const formatLBP = (amount: number) => {
    return new Intl.NumberFormat("en-LB", {
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
      value={{ 
        exchangeRate, 
        rate: exchangeRate, // alias للـ exchangeRate
        setExchangeRate, // نسميها setExchangeRate لتشبه الـ useState
        convertToLBP, 
        formatLBP, 
        formatUSD 
      }}
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