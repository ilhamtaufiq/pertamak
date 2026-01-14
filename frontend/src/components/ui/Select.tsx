import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    label?: string;
    value?: string;
    onChange?: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
    error?: string;
}

export function Select({ label, value, onChange, options, placeholder = 'Pilih...', disabled, error }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="space-y-1.5" ref={selectRef}>
            {label && (
                <label className="block text-sm font-medium text-foreground">{label}</label>
            )}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-card text-left flex items-center justify-between transition-all disabled:bg-muted disabled:cursor-not-allowed ${isOpen ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                        } ${error ? 'border-danger' : ''}`}
                >
                    <span className={selectedOption ? 'text-card-foreground' : 'text-muted-foreground'}>
                        {selectedOption?.label || placeholder}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-card rounded-xl border border-border shadow-lg py-1 max-h-60 overflow-auto">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange?.(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-4 py-2 text-left flex items-center justify-between hover:bg-muted transition-colors ${option.value === value ? 'text-primary bg-primary/5' : 'text-card-foreground'
                                    }`}
                            >
                                {option.label}
                                {option.value === value && <Check className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            {error && <p className="text-xs text-danger">{error}</p>}
        </div>
    );
}
