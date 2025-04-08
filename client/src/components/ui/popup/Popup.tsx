'use client';
import { usePopup } from '@/contexts/PopupContext';
import './Popup.css';
import { IoClose } from 'react-icons/io5';

export const Popup = () => {
    const { isOpen, closePopup, content } = usePopup();

    if (!isOpen || !content) return null;

    return (
        <div className="popup-overlay" onClick={closePopup}>
            <div
                className="popup-content"
                onClick={(e) => e.stopPropagation()} // Chặn đóng nếu click vào nội dung
            >
                <button
                    className="popup-close-button"
                    onClick={closePopup}
                    aria-label="Close popup"
                >
                    <IoClose size={24} />
                </button>
                {content}
            </div>
        </div>
    );
};
