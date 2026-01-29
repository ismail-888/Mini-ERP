"use client"

import React from "react"

import { useState, useCallback } from "react"
import { FileSpreadsheet, Upload, X, CheckCircle2, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"

interface ImportExcelModalProps {
  open: boolean
  onClose: () => void
}

type ImportState = "idle" | "uploading" | "success" | "error"

export function ImportExcelModal({ open, onClose }: ImportExcelModalProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [importState, setImportState] = useState<ImportState>("idle")

  const resetState = () => {
    setFile(null)
    setImportState("idle")
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (
      droppedFile &&
      (droppedFile.name.endsWith(".xlsx") || droppedFile.name.endsWith(".xls"))
    ) {
      setFile(droppedFile)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (
      selectedFile &&
      (selectedFile.name.endsWith(".xlsx") || selectedFile.name.endsWith(".xls"))
    ) {
      setFile(selectedFile)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setImportState("uploading")
    // Simulate import process
    await new Promise((resolve) => setTimeout(resolve, 2000))
    // Randomly succeed or fail for demo
    setImportState(Math.random() > 0.3 ? "success" : "error")
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import from Excel
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file (.xlsx or .xls) to import products in bulk.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {importState === "idle" && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground",
                file && "border-solid border-primary bg-primary/5"
              )}
            >
              {file ? (
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">Drop your Excel file here</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    or click to browse (.xlsx, .xls)
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </>
              )}
            </div>
          )}

          {importState === "uploading" && (
            <div className="flex flex-col items-center py-8">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <p className="font-medium">Importing products...</p>
              <p className="mt-1 text-sm text-muted-foreground">
                This may take a moment
              </p>
            </div>
          )}

          {importState === "success" && (
            <div className="flex flex-col items-center py-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <p className="font-medium">Import Successful!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                24 products have been imported
              </p>
            </div>
          )}

          {importState === "error" && (
            <div className="flex flex-col items-center py-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <p className="font-medium">Import Failed</p>
              <p className="mt-1 text-center text-sm text-muted-foreground">
                There was an error processing your file. Please check the format and
                try again.
              </p>
            </div>
          )}
        </div>

        {/* Template Download */}
        {importState === "idle" && (
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">
              Need a template?{" "}
              <button
                type="button"
                className="font-medium text-primary hover:underline"
              >
                Download Excel template
              </button>
            </p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {(importState === "idle" || importState === "error") && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              {importState === "error" ? (
                <Button onClick={resetState}>Try Again</Button>
              ) : (
                <Button onClick={handleImport} disabled={!file}>
                  Import Products
                </Button>
              )}
            </>
          )}
          {importState === "success" && (
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
