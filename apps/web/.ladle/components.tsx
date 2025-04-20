import type { GlobalProvider } from '@ladle/react'
import '@/styles/globals.css'
import React from 'react'
import { Toaster } from "../src/app/_components/ui/toast";

export const Provider: GlobalProvider = ({ children, globalState }) => (
  <div className='bg-[#631818] bg-felt-texture h-screen p-4'>
    <Toaster />
    {children}
  </div>
)
