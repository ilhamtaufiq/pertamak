import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ChipProps {
    children: ReactNode;
    color?: 'default' | 'primary' | 'secondary' | 'warning' | 'danger';
    size?: 'sm' | 'md';
    variant?: 'solid' | 'flat';
    onClose?: () => void;
    className?: string;
}

export function Chip({
    children,
    color = 'default',
    size = 'md',
    variant = 'flat',
    onClose,
    className = ''
}: ChipProps) {
    const colors = {
        default: variant === 'flat'
            ? 'bg-default-100 text-default-700'
            : 'bg-default-500 text-white',
        primary: variant === 'flat'
            ? 'bg-primary/10 text-primary'
            : 'bg-primary text-white',
        secondary: variant === 'flat'
            ? 'bg-secondary/10 text-secondary'
            : 'bg-secondary text-white',
        warning: variant === 'flat'
            ? 'bg-warning/10 text-warning'
            : 'bg-warning text-white',
        danger: variant === 'flat'
            ? 'bg-danger/10 text-danger'
            : 'bg-danger text-white',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
    };

    return (
        <span className={`inline-flex items-center gap-1 rounded-full font-medium ${colors[color]} ${sizes[size]} ${className}`}>
            {children}
            {onClose && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
                >
                    <X className="w-3 h-3" />
                </button>
            )}
        </span>
    );
}
