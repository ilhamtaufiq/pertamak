import type { ReactNode } from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
    src?: string;
    alt?: string;
    size?: 'sm' | 'md' | 'lg';
    fallback?: ReactNode;
    className?: string;
}

export function Avatar({ src, alt, size = 'md', fallback, className = '' }: AvatarProps) {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-14 h-14',
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    return (
        <div className={`relative rounded-full overflow-hidden bg-default-200 flex items-center justify-center ${sizes[size]} ${className}`}>
            {src ? (
                <img src={src} alt={alt || ''} className="w-full h-full object-cover" />
            ) : (
                fallback || <User className={`text-default-500 ${iconSizes[size]}`} />
            )}
        </div>
    );
}
