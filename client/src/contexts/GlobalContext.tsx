'use client';

import { ReactNode } from 'react';
import { PopupProvider } from '@/contexts/PopupContext';

export const GlobalProviders = ({ children }: { children: ReactNode }) => {
    return (
        <PopupProvider>
            {children}
        </PopupProvider>
    );
};
