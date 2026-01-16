import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Avatar, Spinner } from './ui';
import type { User } from '../types/user';
import { Users, MapPin } from 'lucide-react';

export function OnlineUsersWidget({ onOpenMap }: { onOpenMap?: () => void }) {
    const { data, isLoading } = useQuery({
        queryKey: ['online-users'],
        queryFn: () => api.get<{ data: User[] }>('/users/online'),
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    if (isLoading) {
        return (
            <div className="flex justify-center p-4">
                <Spinner size="sm" color="primary" />
            </div>
        );
    }

    const onlineUsers = data?.data || [];

    return (
        <section className="mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold">Online Sekarang</h3>
                </div>
                <button
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
