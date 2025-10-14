import type { GlobalProvider } from '@ladle/react';
import '~/styles/globals.css';
import { Toaster } from '../src/components/ui/toast';

export const Provider: GlobalProvider = ({ children }) => (
  <div className='bg-dark-green background-noise min-h-screen p-4 prose text-dark-text'>
    <Toaster />
    {children}
  </div>
);
