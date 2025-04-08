'use client';
import { usePopup } from '@/contexts/PopupContext';
import './Popup.css';
import { IoClose } from 'react-icons/io5';
import Draggable from 'react-draggable';
import { useRef } from 'react';

export const Popup = () => {
    const { 
        isOpen, 
        closePopup, 
        content,
        title
    } = usePopup();
    const nodeRef = useRef<HTMLDivElement>(null);

    if (!isOpen || !content) return null;

    return (
        <div className="popup-overlay" onClick={closePopup}>
            <Draggable handle=".popup-header" nodeRef={nodeRef as React.MutableRefObject<HTMLElement>}>
                <div
                    ref={nodeRef}
                    className="popup-content-container"
                    onClick={(e) => e.stopPropagation()} // Chặn đóng nếu click vào nội dung
                    style={{
                        position: 'absolute',
                    }}
                >
                    <div className="popup-header">
                        <h2 className="popup-title">
                            {title || 'Popup Title'}
                        </h2>

                        <button
                            className="popup-close-button"
                            onClick={closePopup}
                            aria-label="Close popup"
                        >
                            <IoClose size={24} />
                        </button>
                    </div>

                    <div className="popup-body">
                        {content}
                    </div>
                </div>
            </Draggable>
        </div>
    );
};
