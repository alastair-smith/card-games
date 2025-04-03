import type { GlobalProvider } from '@ladle/react'
import '@/styles/globals.css'
import React from 'react'

export const Provider: GlobalProvider = ({ children, globalState }) => (
  <>{children}</>
)