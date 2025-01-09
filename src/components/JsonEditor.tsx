'use client'

import React, { useState, useEffect } from 'react'
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { AlertCircle, Check } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function JsonEditor({ value, onChange, placeholder, className }: JsonEditorProps) {
  const [internalValue, setInternalValue] = useState(value)
  const [isValid, setIsValid] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    setInternalValue(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)
    validateJson(newValue)
  }

  const validateJson = (jsonString: string) => {
    try {
      if (jsonString.trim() === '') {
        setIsValid(true)
        setErrorMessage('')
        return
      }
      JSON.parse(jsonString)
      setIsValid(true)
      setErrorMessage('')
    } catch (error) {
      setIsValid(false)
      setErrorMessage((error as Error).message)
    }
  }

  const handleBlur = () => {
    if (isValid) {
      onChange(internalValue)
    }
  }

  const formatJson = () => {
    try {
      const formatted = JSON.stringify(JSON.parse(internalValue), null, 2)
      setInternalValue(formatted)
      onChange(formatted)
      setIsValid(true)
      setErrorMessage('')
    } catch (error) {
      setIsValid(false)
      setErrorMessage((error as Error).message)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {isValid ? (
            <Check className="text-green-500" size={20} />
          ) : (
            <AlertCircle className="text-red-500" size={20} />
          )}
          <span className={isValid ? "text-green-500" : "text-red-500"}>
            {isValid ? "JSON válido" : "JSON inválido"}
          </span>
        </div>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={formatJson}
          disabled={!isValid}
        >
          Formatear JSON
        </Button>
      </div>
      <Textarea
        value={internalValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn(
          "font-mono text-sm",
          "min-h-[200px] w-full rounded-md border-2 border-input bg-background px-3 py-2 ring-offset-background",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "resize-none overflow-auto whitespace-pre",
          isValid ? "border-green-500" : "border-red-500",
          className
        )}
      />
      {!isValid && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

