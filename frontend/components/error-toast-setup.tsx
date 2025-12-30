'use client'

import { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { setErrorToastHandler } from '@/lib/error-handling'

export function ErrorToastSetup() {
  const { toast } = useToast()

  useEffect(() => {
    setErrorToastHandler(({ title, description, duration }) => {
      toast({
        variant: 'destructive',
        title,
        description,
        duration
      })
    })
  }, [toast])

  return null
}
