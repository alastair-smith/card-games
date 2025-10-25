import type { GlobalProvider } from '@ladle/react';
import '~/styles/globals.css';
import { Toaster } from '../src/components/ui/toast';

export const Provider: GlobalProvider = ({ children }) => (
  <div className='bg-main-background background-noise prose text-dark-text'>
    <Toaster />
    {children}
  </div>
);
