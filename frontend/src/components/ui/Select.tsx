import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

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
    showSearch?: boolean;
}

export function Select({ label, value, onChange, options, placeholder = 'Pilih...', disabled, error, showSearch }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const selectRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    useEffect(() => {
        if (isOpen && showSearch) {
            setSearchTerm('');
            setTimeout(() => searchInputRef.current?.focus(), 10);
        }
    }, [isOpen, showSearch]);

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
                    <div className="absolute z-50 mt-1 w-full bg-card rounded-xl border border-border shadow-lg py-1 overflow-hidden flex flex-col max-h-60">
                        {showSearch && (
                            <div className="p-2 border-b border-border sticky top-0 bg-card z-10">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        className="w-full pl-9 pr-4 py-1.5 text-xs bg-muted border-none rounded-lg focus:ring-1 focus:ring-primary outline-none"
                                        placeholder="Cari..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </div>
                        )}
                        <div className="overflow-auto flex-1">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            onChange?.(option.value);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left flex items-center justify-between hover:bg-muted transition-colors ${option.value === value ? 'text-primary bg-primary/5' : 'text-card-foreground text-sm'
                                            }`}
                                    >
                                        <span className="truncate">{option.label}</span>
                                        {option.value === value && <Check className="w-4 h-4 flex-shrink-0" />}
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-xs text-muted-foreground text-center">
                                    Tidak ada hasil
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {error && <p className="text-xs text-danger">{error}</p>}
        </div>
    );
}
