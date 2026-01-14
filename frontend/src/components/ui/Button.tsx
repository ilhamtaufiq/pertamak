import { forwardRef, type ButtonHTMLAttributes, type ForwardRefExoticComponent } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    isDisabled?: boolean;
    isIconOnly?: boolean;
}

export const Button: ForwardRefExoticComponent<ButtonProps> = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', isLoading, isDisabled, isIconOnly, className = '', children, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

        const variants = {
            primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary',
            secondary: 'bg-default-100 text-default-700 hover:bg-default-200 focus:ring-default-300',
            ghost: 'bg-transparent hover:bg-default-100 text-default-700 focus:ring-default-300',
            danger: 'bg-danger text-white hover:bg-danger/90 focus:ring-danger',
        };

        const sizes = {
            sm: isIconOnly ? 'p-2' : 'px-3 py-1.5 text-sm',
            md: isIconOnly ? 'p-2.5' : 'px-4 py-2 text-sm',
            lg: isIconOnly ? 'p-3' : 'px-6 py-3 text-base',
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                disabled={isDisabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
