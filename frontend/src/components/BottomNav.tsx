import { Home, Plus, ClipboardList, User, FolderOpen } from 'lucide-react';
import { Button } from './ui';

interface BottomNavProps {
    onAddClick: () => void;
    onPageChange: (page: 'home' | 'kegiatan' | 'karyawan' | 'piket' | 'users' | 'map' | 'profile' | 'media') => void;
    activePage: string;
}

export function BottomNav({ onAddClick, onPageChange, activePage }: BottomNavProps) {
    return (
        <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-lg z-50">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] px-2 py-2 flex items-center justify-between">

                {/* Home */}
                <button
                    onClick={() => onPageChange('home')}
                    className={`flex-1 flex flex-col items-center justify-center py-2 transition-all duration-300 rounded-2xl ${activePage === 'home'
                        ? 'text-primary scale-110'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                >
                    <Home className={`w-5 h-5 ${activePage === 'home' ? 'fill-primary/10' : ''}`} />
                    <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Beranda</span>
                </button>

                {/* Media Library */}
                <button
                    onClick={() => onPageChange('media')}
                    className={`flex-1 flex flex-col items-center justify-center py-2 transition-all duration-300 rounded-2xl ${activePage === 'media'
                        ? 'text-primary scale-110'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                >
                    <FolderOpen className={`w-5 h-5 ${activePage === 'media' ? 'fill-primary/10' : ''}`} />
                    <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Media</span>
                </button>

                {/* FAB: Add */}
                <div className="px-2">
                    <Button
                        variant="primary"
                        isIconOnly
                        onClick={onAddClick}
                        className="w-14 h-14 rounded-full shadow-lg shadow-primary/30 hover:scale-110 hover:rotate-90 transition-all duration-500 bg-primary border-none"
                    >
                        <Plus className="w-8 h-8 text-white" strokeWidth={3} />
                    </Button>
                </div>

                {/* Kegiatan / Jurnal */}
                <button
                    onClick={() => onPageChange('kegiatan')}
                    className={`flex-1 flex flex-col items-center justify-center py-2 transition-all duration-300 rounded-2xl ${activePage === 'kegiatan'
                        ? 'text-primary scale-110'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                >
                    <ClipboardList className={`w-5 h-5 ${activePage === 'kegiatan' ? 'fill-primary/10' : ''}`} />
                    <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Jurnal</span>
                </button>

                {/* Profil */}
                <button
                    onClick={() => onPageChange('profile')}
                    className={`flex-1 flex flex-col items-center justify-center py-2 transition-all duration-300 rounded-2xl ${activePage === 'profile'
                        ? 'text-primary scale-110'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                >
                    <User className={`w-5 h-5 ${activePage === 'profile' ? 'fill-primary/10' : ''}`} />
                    <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Profil</span>
                </button>

            </div>
        </nav>
    );
}
