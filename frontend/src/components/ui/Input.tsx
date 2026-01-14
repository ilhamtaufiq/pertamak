import { type InputHTMLAttributes, type TextareaHTMLAttributes, type ForwardRefExoticComponent, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: ForwardRefExoticComponent<InputProps> = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="space-y-1.5">
                {label && (
                    <label className="block text-sm font-medium text-foreground">
                        {label}
                        {props.required && <span className="text-danger ml-1">*</span>}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground disabled:bg-muted disabled:cursor-not-allowed ${error ? 'border-danger' : ''} ${className}`}
                    {...props}
                />
                {error && <p className="text-xs text-danger">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="space-y-1.5">
                {label && (
                    <label className="block text-sm font-medium text-foreground">
                        {label}
                        {props.required && <span className="text-danger ml-1">*</span>}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={`w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground resize-none disabled:bg-muted disabled:cursor-not-allowed ${error ? 'border-danger' : ''} ${className}`}
                    {...props}
                />
                {error && <p className="text-xs text-danger">{error}</p>}
            </div>
        );
    }
);

TextArea.displayName = 'TextArea';
