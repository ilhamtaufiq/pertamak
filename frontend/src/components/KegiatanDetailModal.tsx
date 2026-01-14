import React, { useState, useEffect } from 'react';
import {
    X,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Calendar,
    ExternalLink,
    Pencil,
    Trash2,
    Image as ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Button } from './ui';
import type { Kegiatan } from '../types/kegiatan';

interface KegiatanDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    kegiatan: Kegiatan | null;
    onEdit: (kegiatan: Kegiatan) => void;
    onDelete: (id: number) => void;
}

export function KegiatanDetailModal({
    isOpen,
    onClose,
    kegiatan,
    onEdit,
    onDelete,
}: KegiatanDetailModalProps) {
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isImageViewOpen, setIsImageViewOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setActiveImageIndex(0);
            setIsScrolled(false);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen || !kegiatan) return null;

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setIsScrolled(e.currentTarget.scrollTop > 50);
    };

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (kegiatan.dokumentasi.length > 0) {
            setActiveImageIndex((prev) => (prev + 1) % kegiatan.dokumentasi.length);
        }
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (kegiatan.dokumentasi.length > 0) {
            setActiveImageIndex((prev) => (prev - 1 + kegiatan.dokumentasi.length) % kegiatan.dokumentasi.length);
        }
    };

    const googleMapsUrl = kegiatan.latitude && kegiatan.longitude
        ? `https://www.google.com/maps/search/?api=1&query=${kegiatan.latitude},${kegiatan.longitude}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(kegiatan.lokasi)}`;

    const formattedDate = format(new Date(kegiatan.tanggal), 'EEEE, d MMMM yyyy', { locale: id });

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                <div
                    className="modal-content bg-card w-full sm:max-w-2xl sm:rounded-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Sticky Header */}
                    <div className={`sticky top-0 z-10 transition-all duration-300 ${isScrolled ? 'bg-card/95 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
                        <div className="flex items-center justify-between p-4">
                            <button
                                onClick={onClose}
                                className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <h2 className={`font-semibold text-lg transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0'}`}>
                                Detail Kegiatan
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 rounded-full hover:bg-muted transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
                        {/* Hero Image Carousel */}
                        <div className="relative aspect-video bg-muted">
                            {kegiatan.dokumentasi.length > 0 ? (
                                <>
                                    <img
                                        src={kegiatan.dokumentasi[activeImageIndex]?.url}
                                        alt={kegiatan.dokumentasi[activeImageIndex]?.name}
                                        className="w-full h-full object-cover cursor-pointer"
                                        onClick={() => setIsImageViewOpen(true)}
                                    />

                                    {/* Navigation Arrows */}
                                    {kegiatan.dokumentasi.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}

                                    {/* Image Indicators */}
                                    {kegiatan.dokumentasi.length > 1 && (
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                                            {kegiatan.dokumentasi.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setActiveImageIndex(index)}
                                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${index === activeImageIndex
                                                            ? 'bg-white w-6'
                                                            : 'bg-white/50 hover:bg-white/80'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Photo Count */}
                                    <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/50 text-white text-sm font-medium">
                                        {activeImageIndex + 1} / {kegiatan.dokumentasi.length}
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                                    <ImageIcon className="w-16 h-16 mb-2 opacity-30" />
                                    <p className="text-sm">Tidak ada foto</p>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-5">
                            {/* Location */}
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-muted-foreground mb-1">Lokasi</p>
                                    <p className="font-medium leading-relaxed">{kegiatan.lokasi}</p>
                                    {kegiatan.latitude && kegiatan.longitude && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            📍 {kegiatan.latitude.toFixed(6)}, {kegiatan.longitude.toFixed(6)}
                                        </p>
                                    )}
                                    <a
                                        href={googleMapsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 mt-2 text-sm text-primary hover:underline"
                                    >
                                        Buka di Google Maps
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>

                            {/* Date */}
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Tanggal</p>
                                    <p className="font-medium capitalize">{formattedDate}</p>
                                </div>
                            </div>

                            {/* Divider */}
                            <hr className="border-border" />

                            {/* Uraian Kegiatan */}
                            <div>
                                <h3 className="font-semibold text-lg mb-3">Uraian Kegiatan</h3>
                                <div className="bg-muted/50 rounded-xl p-4">
                                    <p className="text-foreground leading-relaxed whitespace-pre-line">
                                        {kegiatan.uraian_kegiatan}
                                    </p>
                                </div>
                            </div>

                            {/* Photo Gallery */}
                            {kegiatan.dokumentasi.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">
                                        Dokumentasi ({kegiatan.dokumentasi.length} foto)
                                    </h3>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {kegiatan.dokumentasi.map((foto, index) => (
                                            <button
                                                key={foto.id}
                                                onClick={() => setActiveImageIndex(index)}
                                                className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-200 ring-2 ring-offset-2 ${activeImageIndex === index
                                                        ? 'ring-primary'
                                                        : 'ring-transparent hover:ring-primary/40'
                                                    }`}
                                            >
                                                <img
                                                    src={foto.thumb}
                                                    alt={foto.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 bg-card border-t border-border flex gap-3 sm:justify-end safe-bottom">
                        <Button
                            variant="ghost"
                            className="flex-1 sm:flex-none text-destructive hover:bg-destructive/10"
                            onClick={() => onDelete(kegiatan.id)}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus
                        </Button>
                        <Button
                            variant="primary"
                            className="flex-1 sm:flex-none shadow-lg"
                            onClick={() => onEdit(kegiatan)}
                        >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit Kegiatan
                        </Button>
                    </div>
                </div>
            </div>

            {/* Full Image View Modal */}
            {isImageViewOpen && kegiatan.dokumentasi.length > 0 && (
                <div
                    className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
                    onClick={() => setIsImageViewOpen(false)}
                >
                    <button
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                        onClick={() => setIsImageViewOpen(false)}
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <img
                        src={kegiatan.dokumentasi[activeImageIndex]?.url}
                        alt={kegiatan.dokumentasi[activeImageIndex]?.name}
                        className="max-w-full max-h-full object-contain"
                    />
                    {kegiatan.dokumentasi.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Slide-up Animation */}
            <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-content {
          animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
        </>
    );
}
