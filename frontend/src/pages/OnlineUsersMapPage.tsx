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
                <p className="text-muted-foreground">Memuat peta...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-120px)]">
            <div className="flex items-center gap-3 mb-4">
                <Button variant="ghost" isIconOnly onClick={onBack}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        Peta Petugas Online
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        {usersWithLocation.length} dari {onlineUsers.length} petugas memiliki data lokasi
                    </p>
                </div>
            </div>

            <div className="flex-1 rounded-2xl overflow-hidden border border-border shadow-inner relative">
                <MapContainer
                    center={defaultCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
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
                            <Popup>
                                <div className="p-1 min-w-[150px]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Avatar
                                            src={user.karyawan?.foto?.thumb}
                                            alt={user.name}
                                            size="sm"
                                            fallback={<UserIcon className="w-3 h-3" />}
                                        />
                                        <div>
                                            <p className="text-sm font-bold leading-tight">{user.name}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {user.karyawan?.jabatan || 'Petugas'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded">
                                        <MapPin className="w-3 h-3" />
                                        Aktif {user.last_seen ? formatDistanceToNow(new Date(user.last_seen), { addSuffix: true, locale: id }) : 'baru saja'}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                {/* Overlay for users without location */}
                {onlineUsers.length > usersWithLocation.length && (
                    <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-white/90 backdrop-blur border border-border p-3 rounded-xl shadow-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold">Lokasi Tidak Tersedia</p>
                                <p className="text-[10px] text-muted-foreground">
                                    {onlineUsers.length - usersWithLocation.length} petugas belum menginfokan lokasi
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
