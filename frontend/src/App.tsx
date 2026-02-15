import { useState, useEffect } from 'react';
import { MediaProvider } from './contexts/MediaContext';
import { MediaPage } from './pages/MediaPage';
import {
  ClipboardList,
  Users,
  User,
  Calendar,
  ArrowLeft,
  LogOut,
  Shield,
  MapPin,
  FolderOpen
} from 'lucide-react';
import { KegiatanPage, KegiatanFormModal } from './pages/KegiatanPage';
import { KaryawanSection } from './components/KaryawanSection';
import { JadwalPiketSection } from './components/JadwalPiketSection';
import { BottomNav } from './components/BottomNav';
import { Button, Spinner } from './components/ui';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import UserManagementPage from './pages/UserManagementPage';
import ProfilePage from './pages/ProfilePage';
import { OnlineUsersWidget } from './components/OnlineUsersWidget';
import { OnlineUsersMapPage } from './pages/OnlineUsersMapPage';
import { LocationTracker } from './components/LocationTracker';
import { api } from './lib/api';

type PeriodFilter = 'day' | 'month' | 'year';

interface DashboardStats {
  kegiatan_count: number;
  karyawan_count: number;
  jadwal_piket_today_count: number;
  period: string;
  date: string;
}

type PageType = 'home' | 'kegiatan' | 'karyawan' | 'piket' | 'users' | 'map' | 'profile' | 'media';

const menuItems = [
  {
    id: 'kegiatan' as PageType,
    label: 'Kegiatan',
    description: 'Jurnal SKP',
    icon: ClipboardList,
    color: 'bg-blue-500',
  },
  {
    id: 'karyawan' as PageType,
    label: 'Karyawan',
    description: 'Data pegawai',
    icon: Users,
    color: 'bg-emerald-500',
  },
  {
    id: 'piket' as PageType,
    label: 'Jadwal Piket',
    description: 'Jadwal kerja',
    icon: Calendar,
    color: 'bg-orange-500',
  },
  {
    id: 'media' as PageType,
    label: 'Media',
    description: 'File manager',
    icon: FolderOpen,
    color: 'bg-indigo-500',
  },
  {
    id: 'profile' as PageType,
    label: 'Profil Saya',
    description: 'Atur akun',
    icon: User,
    color: 'bg-slate-500',
  },
];

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const { user, token, isLoading, logout } = useAuth();

  // Dashboard stats state
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch dashboard stats
  useEffect(() => {
    if (!token) return;

    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const response = await api.get<{ data: DashboardStats }>('/dashboard/stats', {
          period: periodFilter,
          date: new Date().toISOString().split('T')[0],
        });
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [token, periodFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (!token || !user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'kegiatan':
        return (
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Jurnal Kegiatan SKP</h2>
              <p className="text-muted-foreground text-sm">Catatan aktivitas harian dan dokumentasi.</p>
            </div>
            <KegiatanPage />
          </section>
        );
      case 'karyawan':
        return <KaryawanSection />;
      case 'piket':
        return <JadwalPiketSection />;
      case 'users':
        return <UserManagementPage />;
      case 'map':
        return <OnlineUsersMapPage onBack={() => setCurrentPage('home')} />;
      case 'profile':
        return <ProfilePage />;
      case 'media':
        return <MediaPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <LocationTracker />
      {/* Header - Floating Island Style (Matches BottomNav) */}
      <header className="sticky top-0 z-40 w-full px-4 pt-4 pb-2 safe-top pointer-events-none">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] px-4 py-2 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            {currentPage !== 'home' ? (
              <Button
                variant="ghost"
                isIconOnly
                size="sm"
                onClick={() => setCurrentPage('home')}
                className="text-foreground hover:bg-muted rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            ) : (
              <div className="group relative shrink-0">
                <div className="w-10 h-10 rounded-full border-2 border-primary/20 overflow-hidden bg-muted p-0.5 transition-transform group-hover:scale-105 shadow-inner">
                  <img
                    src={user.karyawan?.foto?.thumb || "/logo.png"}
                    alt="User"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-white rounded-full shadow-sm"></div>
                <button
                  onClick={() => setCurrentPage('profile')}
                  className="absolute inset-0 z-10 rounded-full focus:outline-none"
                  aria-label="Manage Profile"
                />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-muted-foreground leading-none opacity-60">
                {currentPage === 'home' ? 'PROFIL PEGAWAI' : 'HALAMAN'}
              </span>
              <h1 className="font-bold text-foreground text-sm leading-tight tracking-tight truncate">
                {currentPage === 'home' ? user.name : menuItems.find(m => m.id === currentPage)?.label || 'Detail'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              isIconOnly
              size="sm"
              onClick={logout}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4">
        {currentPage === 'home' ? (
          <>
            {/* Bento-style Status & Quick Actions */}
            <section className="mb-10 px-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-6 gap-3">
                {/* Main Stats Card - Bento 1 */}
                <button
                  onClick={() => setCurrentPage('kegiatan')}
                  className="col-span-4 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-3xl p-5 flex flex-col justify-between transition-all active:scale-[0.98] group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">Laporan</span>
                  </div>
                  <div>
                    {statsLoading ? (
                      <div className="h-8 w-16 bg-muted animate-pulse rounded-lg" />
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-foreground tabular-nums">{stats?.kegiatan_count ?? 0}</span>
                        <span className="text-xs text-muted-foreground font-semibold">Total Kegiatan</span>
                      </div>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-1 font-medium">Klik untuk lihat riwayat SKP</p>
                  </div>
                </button>

                {/* Period Filter - Bento 2 */}
                <button
                  onClick={() => setPeriodFilter(periodFilter === 'day' ? 'month' : periodFilter === 'month' ? 'year' : 'day')}
                  className="col-span-2 bg-card border border-border/60 hover:border-primary/40 rounded-3xl p-4 flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm shadow-black/5"
                >
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none mb-1">Periode</p>
                    <span className="text-[11px] font-bold text-foreground">
                      {periodFilter === 'day' ? 'Harian' : periodFilter === 'month' ? 'Bulanan' : 'Tahunan'}
                    </span>
                  </div>
                </button>

                {/* Map Action - Bento 3 */}
                <button
                  onClick={() => setCurrentPage('map')}
                  className="col-span-3 bg-card border border-border/60 hover:border-primary/40 rounded-3xl p-4 flex items-center gap-4 transition-all active:scale-[0.98] shadow-sm shadow-black/5"
                >
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">Peta Lokasi</span>
                    <span className="text-[10px] text-muted-foreground font-medium">Pantau Tim</span>
                  </div>
                </button>

                {/* Permissions/Users - Bento 4 */}
                <button
                  onClick={() => user?.roles?.some(r => r.name === 'admin') && setCurrentPage('users')}
                  className={`col-span-3 border rounded-3xl p-4 flex items-center gap-4 transition-all active:scale-[0.98] shadow-sm shadow-black/5 ${user?.roles?.some(r => r.name === 'admin')
                    ? 'bg-card border-border/60 hover:border-primary/40'
                    : 'bg-muted/50 border-transparent opacity-50 cursor-not-allowed'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${user?.roles?.some(r => r.name === 'admin') ? 'bg-indigo-50 text-indigo-600' : 'bg-muted text-muted-foreground'
                    }`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">Akses Izin</span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {user?.roles?.some(r => r.name === 'admin') ? 'Kelola Akun' : 'Admin Saja'}
                    </span>
                  </div>
                </button>
              </div>
            </section>

            {/* Services Grid (Gojek Style Icons) */}
            <section className="mb-10 px-2">
              <div className="grid grid-cols-4 gap-y-6">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const colorMap: any = {
                    'bg-blue-500': 'bg-blue-50 text-blue-600',
                    'bg-emerald-500': 'bg-emerald-50 text-emerald-600',
                    'bg-orange-500': 'bg-orange-50 text-orange-600'
                  };
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentPage(item.id)}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className={`w-14 h-14 rounded-2xl ${colorMap[item.color] || 'bg-primary/10 text-primary'} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="text-[11px] font-bold text-foreground text-center line-clamp-1">{item.label}</span>
                    </button>
                  );
                })}
                {/* Admin-only User Management */}
                {user?.roles?.some(r => r.name === 'admin') && (
                  <button
                    onClick={() => setCurrentPage('users')}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Shield className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] font-bold text-foreground text-center">Pengguna</span>
                  </button>
                )}
                <button className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center border-2 border-dashed border-gray-200">
                    <Users className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-400">Lainnya</span>
                </button>
              </div>
            </section>

            {/* Online Users Section */}
            {user?.roles?.some(r => r.name === 'admin') && (
              <OnlineUsersWidget onOpenMap={() => setCurrentPage('map')} />
            )}

            {/* "What's New" / Bento Highlights */}
            <section className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Terbaru dari kami</h3>
                <button className="text-xs font-bold text-primary">Lihat semua</button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Highlight 1: Online Status */}
                {user?.roles?.some(r => r.name === 'admin') && (
                  <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center gap-4 transition-transform active:scale-[0.98]" onClick={() => setCurrentPage('map')}>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-emerald-900 leading-tight">Pantau Kehadiran</h4>
                      <p className="text-xs text-emerald-700/70 mt-0.5">Lihat siapa saja yang sedang bertugas di lapangan saat ini.</p>
                    </div>
                  </div>
                )}

                {/* Highlight 2: Jurnal Summary Card */}
                <div className="p-1 rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-200">
                  <div className="bg-white/10 backdrop-blur-sm p-5 rounded-[1.8rem] flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="p-2 rounded-xl bg-white/20">
                        <ClipboardList className="w-6 h-6 text-white" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold text-white uppercase tracking-tighter">Review Jurnal</span>
                    </div>
                    <div className="text-white">
                      <h4 className="text-lg font-bold leading-tight">Sudah Lapor Hari Ini?</h4>
                      <p className="text-sm opacity-80 mt-1">Pastikan Jurnal SKP Anda terisi setiap harinya untuk laporan bulanan yang akurat.</p>
                    </div>
                    <Button
                      variant="secondary"
                      className="w-full bg-white text-blue-600 font-bold hover:bg-blue-50 border-none"
                      onClick={() => setCurrentPage('kegiatan')}
                    >
                      Buka Jurnal
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          renderPage()
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activePage={currentPage}
        onPageChange={setCurrentPage}
        onAddClick={() => setIsFormOpen(true)}
      />

      {/* Floating Add Form */}
      {isFormOpen && (
        <KegiatanFormModal
          isOpen={isFormOpen}
          kegiatan={null}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}

export default function Root() {
  return (
    <MediaProvider>
      <App />
    </MediaProvider>
  );
}
