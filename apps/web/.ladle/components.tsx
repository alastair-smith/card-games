import type { GlobalProvider } from '@ladle/react';
import '~/styles/globals.css';
import { Toaster } from '../src/components/ui/toast';

export const Provider: GlobalProvider = ({ children }) => (
  <div className='bg-[#631818] bg-felt-texture h-screen p-4'>
    <Toaster />
    {children}
  </div>
);
