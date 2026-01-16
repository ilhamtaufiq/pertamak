import { useState, useEffect } from 'react';
import { ClipboardList, Users, Calendar, ArrowLeft, LogOut, Shield, CalendarDays } from 'lucide-react';
import { KegiatanPage, KegiatanFormModal } from './pages/KegiatanPage';
import { KaryawanSection } from './components/KaryawanSection';
import { JadwalPiketSection } from './components/JadwalPiketSection';
import { BottomNav } from './components/BottomNav';
import { Button, Spinner } from './components/ui';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import UserManagementPage from './pages/UserManagementPage';
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

type PageType = 'home' | 'kegiatan' | 'karyawan' | 'piket' | 'users' | 'map';

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
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <LocationTracker />
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground">
        <div className="px-4 py-3">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {currentPage !== 'home' && (
                <Button
                  variant="ghost"
                  isIconOnly
                  onClick={() => setCurrentPage('home')}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden p-1.5">
                <img src="/logo.png" alt="Cianjur Kab Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <h1 className="font-semibold text-white leading-tight">{user.name}</h1>
                <p className="text-[10px] text-white/70 uppercase tracking-wider font-bold">Administrator</p>
              </div>
            </div>
            <Button
              variant="ghost"
              isIconOnly
              size="sm"
              onClick={logout}
              className="text-white hover:bg-white/20 rounded-xl"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>

          {/* Search bar - only on home */}
          {/* {currentPage === 'home' && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari kegiatan..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          )} */}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4">
        {currentPage === 'home' ? (
          <>
            {/* Online Users Widget */}
            {user?.roles?.some(r => r.name === 'admin') && (
              <OnlineUsersWidget onOpenMap={() => setCurrentPage('map')} />
            )}

            {/* Menu Icons Grid */}
            <section className="mb-6">
              <h3 className="text-lg font-bold mb-4">Menu</h3>
              <div className="grid grid-cols-3 gap-3">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentPage(item.id)}
                      className="flex flex-col items-center p-4 rounded-2xl bg-card shadow-sm border border-default-200 hover:shadow-md hover:scale-105 transition-all active:scale-95"
                    >
                      <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-2`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </button>
                  );
                })}
                {/* Admin-only User Management */}
                {user?.roles?.some(r => r.name === 'admin') && (
                  <button
                    onClick={() => setCurrentPage('users')}
                    className="flex flex-col items-center p-4 rounded-2xl bg-card shadow-sm border border-default-200 hover:shadow-md hover:scale-105 transition-all active:scale-95"
                  >
                    <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center mb-2">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Users</span>
                    <span className="text-xs text-muted-foreground">User Management</span>
                  </button>
                )}
              </div>
            </section>

            {/* Quick Stats with Date Filter */}
            <section className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Ringkasan</h3>
                {/* Period Filter Tabs */}
                <div className="flex bg-muted rounded-xl p-1 gap-1">
                  {(['day', 'month', 'year'] as PeriodFilter[]).map((period) => (
                    <button
                      key={period}
                      onClick={() => setPeriodFilter(period)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${periodFilter === period
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      {period === 'day' ? 'Hari' : period === 'month' ? 'Bulan' : 'Tahun'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Kegiatan Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full" />
                  <ClipboardList className="w-8 h-8 mb-2 opacity-80" />
                  {statsLoading ? (
                    <div className="h-8 flex items-center">
                      <Spinner size="sm" color="white" />
                    </div>
                  ) : (
                    <p className="text-2xl font-bold">{stats?.kegiatan_count ?? 0}</p>
                  )}
                  <p className="text-sm opacity-80">
                    Kegiatan {periodFilter === 'day' ? 'Hari Ini' : periodFilter === 'month' ? 'Bulan Ini' : 'Tahun Ini'}
                  </p>
                </div>

                {/* Karyawan Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full" />
                  <Users className="w-8 h-8 mb-2 opacity-80" />
                  {statsLoading ? (
                    <div className="h-8 flex items-center">
                      <Spinner size="sm" color="white" />
                    </div>
                  ) : (
                    <p className="text-2xl font-bold">{stats?.karyawan_count ?? 0}</p>
                  )}
                  <p className="text-sm opacity-80">Total Karyawan</p>
                </div>

                {/* Jadwal Piket Today Card */}
                <div className="col-span-2 p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full" />
                  <div className="flex items-center justify-between">
                    <div>
                      <CalendarDays className="w-8 h-8 mb-2 opacity-80" />
                      {statsLoading ? (
                        <div className="h-8 flex items-center">
                          <Spinner size="sm" color="white" />
                        </div>
                      ) : (
                        <p className="text-2xl font-bold">{stats?.jadwal_piket_today_count ?? 0}</p>
                      )}
                      <p className="text-sm opacity-80">Jadwal Piket Hari Ini</p>
                    </div>
                    <Calendar className="w-16 h-16 opacity-20" />
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

export default App;
