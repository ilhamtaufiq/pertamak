import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Avatar, Spinner } from './ui';
import type { User } from '../types/user';
import { Users, MapPin } from 'lucide-react';

export function OnlineUsersWidget({
    onOpenMap,
    compact = false,
}: {
    onOpenMap?: () => void;
    compact?: boolean;
}) {
    const { data, isLoading } = useQuery({
        queryKey: ['online-users'],
        queryFn: () => api.get<{ data: User[] }>('/users/online'),
        refetchInterval: 30000,
    });

    if (isLoading) {
        return (
            <div className="flex justify-center p-4">
                <Spinner size="sm" color="primary" />
            </div>
        );
    }

    const onlineUsers = data?.data || [];

    if (compact) {
        return (
            <section>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-bold text-foreground">Online Sekarang</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onOpenMap}
                        className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                        <MapPin className="w-3 h-3" />
                        {onlineUsers.length}
                    </button>
                </div>

                {onlineUsers.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">Tidak ada user online</p>
                ) : (
                    <ul className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {onlineUsers.map((user) => (
                            <li key={user.id} className="flex items-center gap-2.5">
                                <div className="relative shrink-0">
                                    <Avatar
                                        src={user.karyawan?.foto?.thumb}
                                        alt={user.name}
                                        size="sm"
                                        className="border border-border"
                                    />
                                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-card rounded-full" />
                                </div>
                                <span className="text-xs font-semibold text-foreground truncate">
                                    {user.name}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}

                {onOpenMap && (
                    <button
                        type="button"
                        onClick={onOpenMap}
                        className="mt-3 w-full text-xs font-bold text-primary hover:underline text-left"
                    >
                        Buka peta lokasi →
                    </button>
                )}
            </section>
        );
    }

    return (
        <section className="mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold">Online Sekarang</h3>
                </div>
                <button
                    type="button"
                    onClick={onOpenMap}
                    className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors shadow-sm"
                >
                    <MapPin className="w-3 h-3" />
                    {onlineUsers.length} Online
                </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {onlineUsers.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2 italic">Tidak ada user online</p>
                ) : (
                    onlineUsers.map((user) => (
                        <div key={user.id} className="flex flex-col items-center gap-1.5 min-w-[70px]">
                            <div className="relative">
                                <Avatar
                                    src={user.karyawan?.foto?.thumb}
                                    alt={user.name}
                                    size="md"
                                    className="border-2 border-background"
                                />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full" />
                            </div>
                            <span className="text-[11px] font-medium text-center truncate w-full px-1">
                                {user.name.split(' ')[0]}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
