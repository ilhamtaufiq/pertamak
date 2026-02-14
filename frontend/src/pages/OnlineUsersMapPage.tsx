import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../lib/api';
import { Avatar, Spinner, Button } from '../components/ui';
import type { User } from '../types/user';
import { ArrowLeft, User as UserIcon, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

// Fix Leaflet marker icon issue
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapRecenter({ center }: { center: [number, number] }) {
    const map = useMap();
    map.setView(center);
    return null;
}

export function OnlineUsersMapPage({ onBack }: { onBack: () => void }) {
    const { data: onlineUsersData, isLoading } = useQuery({
        queryKey: ['online-users'],
        queryFn: () => api.get<{ data: User[] }>('/users/online'),
        refetchInterval: 30000,
    });

    const onlineUsers = onlineUsersData?.data || [];
    const usersWithLocation = onlineUsers.filter(u => u.latitude && u.longitude);

    // Default center to Cianjur (or first user)
    const defaultCenter: [number, number] = usersWithLocation.length > 0
        ? [Number(usersWithLocation[0].latitude), Number(usersWithLocation[0].longitude)]
        : [-6.8173, 107.1424]; // Cianjur coordinate fallback

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Spinner size="lg" color="primary" />
                <p className="text-muted-foreground animate-pulse font-bold text-sm uppercase tracking-widest">Memuat Peta...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Premium Header */}
            <div className="flex items-center justify-between mb-6 px-1">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        isIconOnly
                        onClick={onBack}
                        className="bg-card shadow-sm border border-border/40 rounded-2xl hover:scale-105 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Monitoring</span>
                        </div>
                        <h2 className="text-2xl font-black text-foreground tracking-tight">Peta Tim Lapangan</h2>
                    </div>
                </div>

                <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Total Online</span>
                    <span className="text-lg font-black text-primary tabular-nums leading-none">{onlineUsers.length}</span>
                </div>
            </div>

            <div className="flex-1 relative rounded-[2.5rem] overflow-hidden border border-border/40 shadow-2xl group">
                <MapContainer
                    center={defaultCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%', zIndex: 1 }}
                    zoomControl={false} // Custom zoom position or style if needed
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapRecenter center={defaultCenter} />

                    {usersWithLocation.map((user) => (
                        <Marker
                            key={user.id}
                            position={[Number(user.latitude), Number(user.longitude)]}
                        >
                            <Popup className="premium-popup">
                                <div className="p-0 min-w-[180px] bg-card overflow-hidden rounded-xl">
                                    <div className="p-3 bg-gradient-to-br from-primary/10 to-transparent flex items-center gap-3 border-b border-border/20">
                                        <Avatar
                                            src={user.karyawan?.foto?.thumb}
                                            alt={user.name}
                                            size="sm"
                                            className="ring-2 ring-primary/20"
                                            fallback={<UserIcon className="w-3 h-3 text-primary/40" />}
                                        />
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-foreground truncate">{user.name}</p>
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-70 truncate lowercase first-letter:uppercase">
                                                {user.karyawan?.jabatan || 'Petugas'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-3 space-y-2">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span>Aktif {user.last_seen ? formatDistanceToNow(new Date(user.last_seen), { addSuffix: true, locale: id }) : 'baru saja'}</span>
                                        </div>
                                        {user.latitude && (
                                            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded-lg">
                                                <MapPin className="w-2.5 h-2.5" />
                                                <span className="truncate">
                                                    {user.latitude?.toFixed(6)}, {user.longitude?.toFixed(6)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                {/* Glassmorphism Status Overlay */}
                <div className="absolute bottom-6 left-6 right-6 z-[1000] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                    <div className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border border-white/20 dark:border-white/5 p-4 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 shadow-inner">
                                <MapPin className="w-6 h-6 text-primary" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-black text-foreground tracking-tight">
                                    {usersWithLocation.length} Petugas Terdeteksi
                                </h3>
                                <p className="text-[11px] text-muted-foreground font-medium leading-none mt-1">
                                    {onlineUsers.length - usersWithLocation.length} petugas lainnya belum memperbarui GPS
                                </p>
                            </div>
                        </div>

                        <div className="flex -space-x-2 overflow-hidden px-2">
                            {usersWithLocation.slice(0, 4).map((user) => (
                                <Avatar
                                    key={user.id}
                                    src={user.karyawan?.foto?.thumb}
                                    className="w-7 h-7 ring-2 ring-card bg-muted"
                                    size="sm"
                                    fallback={<UserIcon className="w-3 h-3" />}
                                />
                            ))}
                            {usersWithLocation.length > 4 && (
                                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center ring-2 ring-card z-10">
                                    <span className="text-[9px] font-black text-white">+{usersWithLocation.length - 4}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .premium-popup .leaflet-popup-content-wrapper {
                    padding: 0;
                    overflow: hidden;
                    border-radius: 1rem;
                    background: transparent;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                }
                .premium-popup .leaflet-popup-content {
                    margin: 0;
                    width: auto !important;
                }
                .premium-popup .leaflet-popup-tip-container {
                    display: none;
                }
            `}} />
        </div>
    );
}

