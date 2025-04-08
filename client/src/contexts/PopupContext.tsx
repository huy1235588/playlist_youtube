'use client';

import { Popup } from '@/components/ui/popup/Popup';
import React, { createContext, useContext, useState, ReactNode } from 'react';

type PopupContextType = {
    isOpen: boolean;
    openPopup: (content: ReactNode, title: string) => void;
    closePopup: () => void;
    content: ReactNode | null;
    title?: string;
};

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const PopupProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState<ReactNode | null>(null);
    const [title, setTitle] = useState<string>('');

    const openPopup = (content: ReactNode, title?: string) => {
        if (title) {
            setTitle(title);
        }
        setContent(content);
        setIsOpen(true);
    };

    const closePopup = () => {
        setIsOpen(false);
        setContent(null);
        setTitle('');
    };

    return (
        <PopupContext.Provider value={{
            isOpen,
            openPopup,
            closePopup,
            content,
            title,
        }}>
            {children}
            <Popup />
        </PopupContext.Provider>
    );
};

export const usePopup = () => {
    const context = useContext(PopupContext);

    // Kiểm tra xem context có tồn tại không
    if (!context) {
        throw new Error('usePopup must be used within a PopupProvider');
    }

    // Trả về context
    return context;
};
