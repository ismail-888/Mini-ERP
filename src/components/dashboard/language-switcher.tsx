"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Languages } from "lucide-react"

export function LanguageSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
  
  const segments = pathname.split("/")
  const currentLocale = segments[1] ?? "en"

  const handleLocaleChange = (newLocale: string) => {
    const newSegments = [...segments]
    newSegments[1] = newLocale
    router.push(newSegments.join("/"))
  }

  return (
    <Select value={currentLocale} onValueChange={handleLocaleChange}>
      <SelectTrigger className="h-9 w-fit bg-sidebar border-sidebar-border gap-2 shadow-none focus:ring-1 focus:ring-primary">
        <Languages className="h-4 w-4 text-muted-foreground" />
        <SelectValue placeholder="Lang" />
      </SelectTrigger>
      <SelectContent align="end" className="bg-sidebar border-sidebar-border">
        <SelectItem value="en" className="cursor-pointer">En</SelectItem>
        <SelectItem value="ar" className="cursor-pointer">Ar</SelectItem>
      </SelectContent>
    </Select>
  )
}