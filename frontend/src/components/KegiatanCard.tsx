import { Calendar, MapPin, Pencil, Trash2, Image } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Button, Card, CardContent, CardFooter, Chip } from './ui';
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
        <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => onClick(kegiatan)}>
            {/* Hero Image */}
            <div className="aspect-video bg-muted relative overflow-hidden">
                {heroImage ? (
                    <img
                        src={heroImage.url}
                        alt={kegiatan.uraian_kegiatan}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Image className="w-12 h-12" />
                    </div>
                )}

                {/* Photo count badge */}
                {kegiatan.dokumentasi.length > 1 && (
                    <Chip
                        size="sm"
                        className="absolute bottom-2 right-2 bg-black/60 text-white"
                    >
                        +{kegiatan.dokumentasi.length - 1} foto
                    </Chip>
                )}

                {/* Index badge */}
                <Chip
                    color="primary"
                    size="sm"
                    variant="solid"
                    className="absolute top-2 left-2 font-bold"
                >
                    #{index + 1}
                </Chip>

                {/* Author Badge (Admin only) */}
                {isAdmin && kegiatan.user_name && (
                    <Chip
                        size="sm"
                        className="absolute top-2 right-2 bg-black/60 text-white border-none"
                    >
                        {kegiatan.user_name}
                    </Chip>
                )}
            </div>

            <CardContent className="space-y-2">
                {/* Location */}
                <div className="flex items-center gap-2 text-primary">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{kegiatan.lokasi}</span>
                </div>

                {/* Description */}
                <p className="text-sm leading-relaxed line-clamp-2">
                    {kegiatan.uraian_kegiatan}
                </p>

                {/* Date */}
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                        {kegiatan.hari}, {format(new Date(kegiatan.tanggal), 'd MMMM yyyy', { locale: id })}
                    </span>
                </div>
            </CardContent>

            <div className="border-t border-border" />

            <CardFooter className="gap-2">
                <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={(e) => { e.stopPropagation(); onEdit(kegiatan); }}
                >
                    <Pencil className="w-4 h-4" />
                    Edit
                </Button>
                <div className="w-px h-6 bg-border" />
                <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={(e) => { e.stopPropagation(); onDelete(kegiatan.id); }}
                    isDisabled={isDeleting}
                >
                    <Trash2 className="w-4 h-4 text-danger" />
                    Hapus
                </Button>
            </CardFooter>
        </Card>
    );
}
