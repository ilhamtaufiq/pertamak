import { Home, PlusCircle, ClipboardList } from 'lucide-react';
import { Button } from './ui';

interface BottomNavProps {
    onAddClick: () => void;
    onPageChange: (page: 'home' | 'kegiatan' | 'karyawan' | 'piket' | 'users') => void;
    activePage: string;
}

export function BottomNav({ onAddClick, onPageChange, activePage }: BottomNavProps) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-card nav-shadow z-50 safe-bottom border-t border-border">
            <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => onPageChange('home')}
                    className={`flex-1 h-full flex-col gap-0.5 rounded-none ${activePage === 'home' ? 'text-primary' : 'text-muted-foreground'
                        }`}
                >
                    <Home className="w-6 h-6" />
                    <span className="text-xs font-medium">Beranda</span>
                </Button>

                <Button
                    variant="ghost"
                    onClick={onAddClick}
                    className="flex-1 h-full flex-col gap-0.5 text-muted-foreground hover:text-foreground rounded-none"
                >
                    <PlusCircle className="w-7 h-7" />
                    <span className="text-xs font-medium">Tambah</span>
                </Button>

                <Button
                    variant="ghost"
                    onClick={() => onPageChange('kegiatan')}
                    className={`flex-1 h-full flex-col gap-0.5 rounded-none ${activePage === 'kegiatan' ? 'text-primary' : 'text-muted-foreground'
                        }`}
                >
                    <ClipboardList className="w-6 h-6" />
                    <span className="text-xs font-medium">Kegiatan</span>
                </Button>
            </div>
        </nav>
    );
}
