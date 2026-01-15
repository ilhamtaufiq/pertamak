import React from 'react';

interface TableProps {
    children: React.ReactNode;
    className?: string;
}

export function Table({ children, className = '' }: TableProps) {
    return (
        <div className="w-full overflow-x-auto rounded-xl border border-border bg-card">
            <table className={`w-auto min-w-full divide-y divide-border ${className}`}>
                {children}
            </table>
        </div>
    );
}

export function TableHeader({ children, className = '' }: TableProps) {
    return (
        <thead className={`bg-muted/50 ${className}`}>
            {children}
        </thead>
    );
}

export function TableBody({ children, className = '' }: TableProps) {
    return (
        <tbody className={`divide-y divide-border ${className}`}>
            {children}
        </tbody>
    );
}

export function TableRow({ children, className = '', onClick }: TableProps & { onClick?: () => void }) {
    return (
        <tr
            className={`transition-colors hover:bg-muted/30 ${onClick ? 'cursor-pointer' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </tr>
    );
}

export function TableHead({ children, className = '', ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
    return (
        <th
            className={`px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider ${className}`}
            {...props}
        >
            {children}
        </th>
    );
}

export function TableCell({ children, className = '', ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
    return (
        <td
            className={`px-4 py-3 text-sm text-foreground align-middle ${className}`}
            {...props}
        >
            {children}
        </td>
    );
}
