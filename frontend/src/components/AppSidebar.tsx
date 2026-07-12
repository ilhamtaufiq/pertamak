import {
  Home,
  ClipboardList,
  Users,
  Calendar,
  FolderOpen,
  User,
  Shield,
  MapPin,
  LogOut,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { Button } from './ui';

export type PageType =
  | 'home'
  | 'kegiatan'
  | 'karyawan'
  | 'piket'
  | 'users'
  | 'map'
  | 'profile'
  | 'media';

export const navItems: {
  id: PageType;
  label: string;
  description: string;
  icon: typeof Home;
  adminOnly?: boolean;
  group: 'utama' | 'data' | 'sistem';
}[] = [
  { id: 'home', label: 'Beranda', description: 'Ringkasan', icon: Home, group: 'utama' },
  { id: 'kegiatan', label: 'Jurnal SKP', description: 'Kegiatan harian', icon: ClipboardList, group: 'utama' },
  { id: 'media', label: 'Media', description: 'File manager', icon: FolderOpen, group: 'utama' },
  { id: 'karyawan', label: 'Karyawan', description: 'Data pegawai', icon: Users, group: 'data' },
  { id: 'piket', label: 'Jadwal Piket', description: 'Jadwal kerja', icon: Calendar, group: 'data' },
  { id: 'map', label: 'Peta Lokasi', description: 'Pantau tim', icon: MapPin, adminOnly: true, group: 'data' },
  { id: 'users', label: 'Pengguna', description: 'Kelola akun', icon: Shield, adminOnly: true, group: 'sistem' },
  { id: 'profile', label: 'Profil', description: 'Akun saya', icon: User, group: 'sistem' },
];

const groupLabels: Record<string, string> = {
  utama: 'Utama',
  data: 'Data & Operasional',
  sistem: 'Sistem',
};

interface AppSidebarProps {
  activePage: PageType;
  onPageChange: (page: PageType) => void;
  onAddClick: () => void;
  onLogout: () => void;
  userName: string;
  userPhoto?: string | null;
  isAdmin: boolean;
}

export function AppSidebar({
  activePage,
  onPageChange,
  onAddClick,
  onLogout,
  userName,
  userPhoto,
  isAdmin,
}: AppSidebarProps) {
  const items = navItems.filter((item) => !item.adminOnly || isAdmin);
  const groups = (['utama', 'data', 'sistem'] as const).filter((g) =>
    items.some((i) => i.group === g)
  );

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-[17.5rem] flex-col border-r border-border bg-card">
      {/* Brand */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-primary/5 to-transparent pointer-events-none" />
        <div className="relative flex items-center gap-3 px-5 py-5">
          <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-primary/15 shadow-sm bg-muted shrink-0">
            <img src="/logo.png" alt="Pertamak" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground tracking-tight truncate">UPTD Pertamak</p>
            <p className="text-[11px] text-muted-foreground font-medium">Portal Pegawai Web</p>
          </div>
        </div>
      </div>

      {/* Primary action */}
      <div className="px-4 pt-4 pb-1">
        <Button
          variant="primary"
          className="w-full justify-center gap-2 rounded-xl h-11 font-bold shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-shadow"
          onClick={onAddClick}
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Tambah Kegiatan
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {groups.map((group) => (
          <div key={group}>
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/80">
              {groupLabels[group]}
            </p>
            <div className="space-y-0.5">
              {items
                .filter((item) => item.group === group)
                .map((item) => {
                  const Icon = item.icon;
                  const active = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onPageChange(item.id)}
                      className={`group relative w-full flex items-center gap-3 pl-3 pr-2.5 py-2.5 rounded-xl text-left transition-all ${
                        active
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <span
                        className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 transition-colors ${
                          active
                            ? 'bg-white/20 text-primary-foreground'
                            : 'bg-muted text-muted-foreground group-hover:bg-card group-hover:text-foreground'
                        }`}
                      >
                        <Icon className="w-[18px] h-[18px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block text-[13px] font-semibold leading-tight ${
                            active ? 'text-primary-foreground' : 'text-foreground'
                          }`}
                        >
                          {item.label}
                        </span>
                        <span
                          className={`block text-[11px] leading-tight mt-0.5 ${
                            active ? 'text-primary-foreground/75' : 'text-muted-foreground'
                          }`}
                        >
                          {item.description}
                        </span>
                      </span>
                      {active && (
                        <ChevronRight className="w-4 h-4 text-primary-foreground/80 shrink-0" />
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2.5">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-card shadow-sm bg-card">
              <img
                src={userPhoto || '/logo.png'}
                alt={userName}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-card" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-foreground truncate">{userName}</p>
            <p className="text-[10px] font-medium text-muted-foreground">
              {isAdmin ? 'Administrator' : 'Pegawai'}
            </p>
          </div>
          <Button
            variant="ghost"
            isIconOnly
            size="sm"
            onClick={onLogout}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 rounded-lg"
            aria-label="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
