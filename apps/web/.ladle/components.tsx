import type { GlobalProvider } from '@ladle/react';
import '~/styles/globals.css';
import { Toaster } from '../src/components/ui/toast';

export const Provider: GlobalProvider = ({ children }) => (
  <div className='bg-felt-texture min-h-screen p-4 prose'>
    <Toaster />
    {children}
  </div>
);
