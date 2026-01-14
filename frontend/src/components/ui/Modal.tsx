import { type ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Modal({ isOpen, onClose, children, size = 'md' }: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
        full: 'max-w-[95vw]'
    };

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            dialog.showModal();
            document.body.style.overflow = 'hidden';
        } else {
            dialog.close();
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === dialogRef.current) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <dialog
            ref={dialogRef}
            className={`fixed inset-0 z-50 w-full ${sizeClasses[size]} m-auto p-0 bg-transparent backdrop:bg-black/50 backdrop:backdrop-blur-sm`}
            onClick={handleBackdropClick}
        >
            <div className="bg-card text-card-foreground rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-border">
                {children}
            </div>
        </dialog>
    );
}

interface ModalHeaderProps {
    children: ReactNode;
    onClose?: () => void;
    className?: string;
}

export function ModalHeader({ children, onClose, className = '' }: ModalHeaderProps) {
    return (
        <div className={`flex items-center justify-between px-6 py-4 border-b border-border ${className}`}>
            <h2 className="text-lg font-semibold text-card-foreground">{children}</h2>
            {onClose && (
                <Button variant="ghost" isIconOnly size="sm" onClick={onClose}>
                    <X className="w-5 h-5" />
                </Button>
            )}
        </div>
    );
}

interface ModalBodyProps {
    children: ReactNode;
    className?: string;
}

export function ModalBody({ children, className = '' }: ModalBodyProps) {
    return (
        <div className={`px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto ${className}`}>
            {children}
        </div>
    );
}

interface ModalFooterProps {
    children: ReactNode;
    className?: string;
}

export function ModalFooter({ children, className = '' }: ModalFooterProps) {
    return (
        <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30 ${className}`}>
            {children}
        </div>
    );
}
