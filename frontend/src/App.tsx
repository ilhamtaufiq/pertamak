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
  FolderOpen,
} from 'lucide-react';
import { KegiatanPage, KegiatanFormModal } from './pages/KegiatanPage';
import { KaryawanSection } from './components/KaryawanSection';
import { JadwalPiketSection } from './components/JadwalPiketSection';
import { BottomNav } from './components/BottomNav';
import { AppSidebar, type PageType, navItems } from './components/AppSidebar';
import { DesktopDashboard } from './components/DesktopDashboard';
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

function pageTitle(page: PageType, userName: string): string {
  if (page === 'home') return 'Beranda';
  if (page === 'profile') return userName;
  return navItems.find((m) => m.id === page)?.label
    || menuItems.find((m) => m.id === page)?.label
    || 'Detail';
}

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const { user, token, isLoading, logout } = useAuth();

  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const isAdmin = !!user?.roles?.some((r) => r.name === 'admin');

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
            <div className="md:hidden">
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

  const periodLabel =
    periodFilter === 'day' ? 'Harian' : periodFilter === 'month' ? 'Bulanan' : 'Tahunan';

  const cyclePeriod = () =>
    setPeriodFilter(
      periodFilter === 'day' ? 'month' : periodFilter === 'month' ? 'year' : 'day'
    );

  /** Mobile home — icon grid + floating cards */
  const mobileHome = (
    <>
      <section className="mb-10 px-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="grid grid-cols-6 gap-3">
          <button
            type="button"
            onClick={() => setCurrentPage('kegiatan')}
            className="col-span-4 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-3xl p-5 flex flex-col justify-between transition-all active:scale-[0.98] group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                <ClipboardList className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">
                Laporan
              </span>
            </div>
            <div>
              {statsLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded-lg" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-foreground tabular-nums">
                    {stats?.kegiatan_count ?? 0}
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">Total Kegiatan</span>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground mt-1 font-medium">
                Klik untuk lihat riwayat SKP
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={cyclePeriod}
            className="col-span-2 bg-card border border-border/60 hover:border-primary/40 rounded-3xl p-4 flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm shadow-black/5"
          >
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="text-center">
              <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none mb-1">
                Periode
              </p>
              <span className="text-[11px] font-bold text-foreground">{periodLabel}</span>
            </div>
          </button>

          {isAdmin && (
            <button
              type="button"
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
          )}

          <button
            type="button"
            onClick={() => isAdmin && setCurrentPage('users')}
            className={`col-span-3 border rounded-3xl p-4 flex items-center gap-4 transition-all active:scale-[0.98] shadow-sm shadow-black/5 ${
              isAdmin
                ? 'bg-card border-border/60 hover:border-primary/40'
                : 'bg-muted/50 border-transparent opacity-50 cursor-not-allowed'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                isAdmin ? 'bg-indigo-50 text-indigo-600' : 'bg-muted text-muted-foreground'
              }`}
            >
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground">Akses Izin</span>
              <span className="text-[10px] text-muted-foreground font-medium">
                {isAdmin ? 'Kelola Akun' : 'Admin Saja'}
              </span>
            </div>
          </button>
        </div>
      </section>

      <section className="mb-10 px-2">
        <div className="grid grid-cols-4 gap-y-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const colorMap: Record<string, string> = {
              'bg-blue-500': 'bg-blue-50 text-blue-600',
              'bg-emerald-500': 'bg-emerald-50 text-emerald-600',
              'bg-orange-500': 'bg-orange-50 text-orange-600',
            };
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentPage(item.id)}
                className="flex flex-col items-center gap-2 group"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${
                    colorMap[item.color] || 'bg-primary/10 text-primary'
                  } flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-bold text-foreground text-center line-clamp-1">
                  {item.label}
                </span>
              </button>
            );
          })}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setCurrentPage('users')}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-bold text-foreground text-center">Pengguna</span>
            </button>
          )}
        </div>
      </section>

      {isAdmin && <OnlineUsersWidget onOpenMap={() => setCurrentPage('map')} />}

      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Terbaru dari kami</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {isAdmin && (
            <button
              type="button"
              className="p-4 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center gap-4 text-left transition-transform active:scale-[0.98]"
              onClick={() => setCurrentPage('map')}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-emerald-900 leading-tight">Pantau Kehadiran</h4>
                <p className="text-xs text-emerald-700/70 mt-0.5">
                  Lihat siapa saja yang sedang bertugas di lapangan saat ini.
                </p>
              </div>
            </button>
          )}
          <div className="p-1 rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-200">
            <div className="bg-white/10 backdrop-blur-sm p-5 rounded-[1.8rem] flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-xl bg-white/20">
                  <ClipboardList className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold text-primary-foreground uppercase tracking-tighter">
                  Review Jurnal
                </span>
              </div>
              <div className="text-primary-foreground">
                <h4 className="text-lg font-bold leading-tight">Sudah Lapor Hari Ini?</h4>
                <p className="text-sm opacity-80 mt-1">
                  Pastikan Jurnal SKP Anda terisi setiap harinya untuk laporan bulanan yang akurat.
                </p>
              </div>
              <Button
                variant="secondary"
                className="w-full bg-card text-blue-600 font-bold hover:bg-blue-50 border-none"
                onClick={() => setCurrentPage('kegiatan')}
              >
                Buka Jurnal
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-0">
      <LocationTracker />

      <AppSidebar
        activePage={currentPage}
        onPageChange={setCurrentPage}
        onAddClick={() => setIsFormOpen(true)}
        onLogout={logout}
        userName={user.name}
        userPhoto={user.karyawan?.foto?.thumb}
        isAdmin={isAdmin}
      />

      {/* Mobile header — floating island */}
      <header className="md:hidden sticky top-0 z-40 w-full px-4 pt-4 pb-2 safe-top pointer-events-none">
        <div className="bg-card/70 backdrop-blur-2xl border border-border/60 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] px-4 py-2 flex items-center justify-between pointer-events-auto">
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
                    src={user.karyawan?.foto?.thumb || '/logo.png'}
                    alt="User"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-card rounded-full shadow-sm" />
                <button
                  type="button"
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
                {currentPage === 'home'
                  ? user.name
                  : menuItems.find((m) => m.id === currentPage)?.label || 'Detail'}
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

      {/* Desktop top bar */}
      <header className="hidden md:flex sticky top-0 z-30 md:ml-[17.5rem] h-16 items-center justify-between border-b border-border bg-card/90 backdrop-blur-xl px-6 lg:px-8">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
            <span>Portal</span>
            <span className="text-border">/</span>
            <span className="text-foreground font-semibold">{pageTitle(currentPage, user.name)}</span>
          </div>
          <h1 className="text-lg font-bold text-foreground tracking-tight mt-0.5 truncate">
            {pageTitle(currentPage, user.name)}
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {currentPage === 'kegiatan' && (
            <Button
              variant="primary"
              size="sm"
              className="rounded-xl font-bold h-9 px-4 shadow-sm shadow-primary/20"
              onClick={() => setIsFormOpen(true)}
            >
              Tambah Kegiatan
            </Button>
          )}
          <div className="hidden lg:flex items-center gap-2.5 pl-3 ml-1 border-l border-border">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-border bg-muted ring-2 ring-primary/10">
              <img
                src={user.karyawan?.foto?.thumb || '/logo.png'}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground max-w-[10rem] truncate leading-tight">
                {user.name}
              </p>
              <p className="text-[10px] font-medium text-muted-foreground">
                {isAdmin ? 'Administrator' : 'Pegawai'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 md:ml-[17.5rem] md:px-6 lg:px-8 md:py-7">
        <div className="mx-auto w-full max-w-7xl">
          {currentPage === 'home' ? (
            <>
              <div className="md:hidden">{mobileHome}</div>
              <div className="hidden md:block">
                <DesktopDashboard
                  userName={user.name}
                  isAdmin={isAdmin}
                  stats={stats}
                  statsLoading={statsLoading}
                  periodFilter={periodFilter}
                  onPeriodChange={setPeriodFilter}
                  onNavigate={setCurrentPage}
                />
              </div>
            </>
          ) : (
            <div className="md:rounded-2xl md:border md:border-border md:bg-card md:p-6 lg:p-8 md:shadow-sm">
              {renderPage()}
            </div>
          )}
        </div>
      </main>

      <BottomNav
        activePage={currentPage}
        onPageChange={setCurrentPage}
        onAddClick={() => setIsFormOpen(true)}
      />

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
