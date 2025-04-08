'use client';

import { Popup } from '@/components/ui/popup/Popup';
import React, { createContext, useContext, useState, ReactNode } from 'react';

type PopupContextType = {
    isOpen: boolean;
    openPopup: (content: ReactNode) => void;
    closePopup: () => void;
    content: ReactNode | null;
};

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const PopupProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState<ReactNode | null>(null);

    const openPopup = (content: ReactNode) => {
        setContent(content);
        setIsOpen(true);
    };

    const closePopup = () => {
        setIsOpen(false);
        setContent(null);
    };

    return (
        <PopupContext.Provider value={{ isOpen, openPopup, closePopup, content }}>
            {children}
            <Popup />
        </PopupContext.Provider>
    );
};

export const usePopup = () => {
    const context = useContext(PopupContext);
    if (!context) {
        throw new Error('usePopup must be used within a PopupProvider');
    }
    return context;
};
