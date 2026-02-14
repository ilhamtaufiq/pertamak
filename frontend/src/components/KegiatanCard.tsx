import { Calendar, MapPin, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Button, Card, CardContent, CardFooter } from './ui';
import { useAuth } from '../contexts/AuthContext';
import type { Kegiatan } from '../types/kegiatan';

interface KegiatanCardProps {
    kegiatan: Kegiatan;
    index: number;
    onClick: (kegiatan: Kegiatan) => void;
    onEdit: (kegiatan: Kegiatan) => void;
    onDelete: (id: number) => void;
    isDeleting?: boolean;
}

export function KegiatanCard({ kegiatan, index, onClick, onEdit, onDelete, isDeleting }: KegiatanCardProps) {
    const { user } = useAuth();
    const isAdmin = user?.roles?.some(r => r.name === 'admin');
    const heroImage = kegiatan.dokumentasi[0];

    return (
        <Card
            className="group overflow-hidden border-none shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 active:scale-[0.98] rounded-[2rem] bg-card border border-border/40"
            onClick={() => onClick(kegiatan)}
        >
            {/* Hero Section */}
            <div className="aspect-video bg-muted relative overflow-hidden">
                {heroImage ? (
                    <img
                        src={heroImage.url}
                        alt={kegiatan.uraian_kegiatan}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30 bg-muted/30">
                        <ImageIcon className="w-10 h-10 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">No Documentation</span>
                    </div>
                )}

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                {/* Index & Author */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                    <div className="px-2.5 py-1 rounded-lg bg-primary text-white text-[10px] font-black shadow-lg shadow-primary/30">
                        #{String(index + 1).padStart(2, '0')}
                    </div>
                    {isAdmin && kegiatan.user_name && (
                        <div className="px-2 py-1 rounded-lg bg-white/20 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-tight border border-white/20">
                            {kegiatan.user_name}
                        </div>
                    )}
                </div>

                {/* Photo count badge */}
                {kegiatan.dokumentasi.length > 1 && (
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-bold border border-white/10 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5" />
                        +{kegiatan.dokumentasi.length - 1}
                    </div>
                )}
            </div>

            <CardContent className="p-5 space-y-3">
                {/* Header Info */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-primary bg-primary/10 px-2 py-1 rounded-lg w-fit">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[120px]">
                            {kegiatan.lokasi.split(',')[0]}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tabular-nums">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(kegiatan.tanggal), 'dd MMM yyyy', { locale: id })}
                    </div>
                </div>

                {/* Description */}
                <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {kegiatan.uraian_kegiatan}
                </h3>
            </CardContent>

            <div className="mx-5 border-t border-border/40" />

            <CardFooter className="p-3 gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-10 rounded-xl font-bold text-[11px] uppercase tracking-wider text-muted-foreground hover:bg-muted active:scale-95"
                    onClick={(e) => { e.stopPropagation(); onEdit(kegiatan); }}
                >
                    <Pencil className="w-3.5 h-3.5 mr-2" />
                    Edit
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-10 rounded-xl font-bold text-[11px] uppercase tracking-wider text-destructive hover:bg-destructive/5 active:scale-95"
                    onClick={(e) => { e.stopPropagation(); onDelete(kegiatan.id); }}
                    isDisabled={isDeleting}
                >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Hapus
                </Button>
            </CardFooter>
        </Card>
    );
}
