import {
  ClipboardList,
  Users,
  Calendar,
  FolderOpen,
  Shield,
  MapPin,
  User,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { Button } from './ui';
import { OnlineUsersWidget } from './OnlineUsersWidget';
import type { PageType } from './AppSidebar';

type PeriodFilter = 'day' | 'month' | 'year';

interface DashboardStats {
  kegiatan_count: number;
  karyawan_count: number;
  jadwal_piket_today_count: number;
  period: string;
  date: string;
}

interface DesktopDashboardProps {
  userName: string;
  isAdmin: boolean;
  stats: DashboardStats | null;
  statsLoading: boolean;
  periodFilter: PeriodFilter;
  onPeriodChange: (p: PeriodFilter) => void;
  onNavigate: (page: PageType) => void;
}

const periodLabel = (p: PeriodFilter) =>
  p === 'day' ? 'Harian' : p === 'month' ? 'Bulanan' : 'Tahunan';

function formatLongDate(d = new Date()) {
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const modules: {
  id: PageType;
  label: string;
  description: string;
  icon: typeof ClipboardList;
  tone: string;
  adminOnly?: boolean;
}[] = [
  {
    id: 'kegiatan',
    label: 'Jurnal SKP',
    description: 'Catat & tinjau kegiatan harian',
    icon: ClipboardList,
    tone: 'bg-sky-50 text-sky-600 ring-sky-100',
  },
  {
    id: 'karyawan',
    label: 'Karyawan',
    description: 'Data pegawai UPTD',
    icon: Users,
    tone: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  },
  {
    id: 'piket',
    label: 'Jadwal Piket',
    description: 'Jadwal kerja & shift',
    icon: Calendar,
    tone: 'bg-orange-50 text-orange-600 ring-orange-100',
  },
  {
    id: 'media',
    label: 'Media',
    description: 'Dokumentasi & arsip file',
    icon: FolderOpen,
    tone: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
  },
  {
    id: 'map',
    label: 'Peta Lokasi',
    description: 'Pantau kehadiran lapangan',
    icon: MapPin,
    tone: 'bg-teal-50 text-teal-600 ring-teal-100',
    adminOnly: true,
  },
  {
    id: 'users',
    label: 'Pengguna',
    description: 'Kelola akun & izin',
    icon: Shield,
    tone: 'bg-amber-50 text-amber-600 ring-amber-100',
    adminOnly: true,
  },
  {
    id: 'profile',
    label: 'Profil Saya',
    description: 'Pengaturan akun',
    icon: User,
    tone: 'bg-slate-100 text-slate-600 ring-slate-200',
  },
];

export function DesktopDashboard({
  userName,
  isAdmin,
  stats,
  statsLoading,
  periodFilter,
  onPeriodChange,
  onNavigate,
}: DesktopDashboardProps) {
  const visibleModules = modules.filter((m) => !m.adminOnly || isAdmin);
  const firstName = userName.split(' ')[0];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-sky-200/30 blur-3xl" />
          <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-primary/5 to-transparent" />
        </div>
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 lg:p-8">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-[11px] font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Dashboard Pegawai
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
              Halo, {firstName}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground font-medium capitalize">
              {formatLongDate()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-xl border border-border bg-background/80 backdrop-blur p-1 shadow-sm">
              {(['day', 'month', 'year'] as PeriodFilter[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPeriodChange(p)}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                    periodFilter === p
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {p === 'day' ? 'Hari' : p === 'month' ? 'Bulan' : 'Tahun'}
                </button>
              ))}
            </div>
            <Button
              variant="primary"
              className="rounded-xl font-bold h-10 px-4 shadow-md shadow-primary/20"
              onClick={() => onNavigate('kegiatan')}
            >
              Buka Jurnal
            </Button>
          </div>
        </div>
      </section>

      {/* KPI */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Kegiatan"
          sublabel={`Periode ${periodLabel(periodFilter).toLowerCase()}`}
          value={stats?.kegiatan_count}
          loading={statsLoading}
          icon={ClipboardList}
          accent="from-sky-500 to-primary"
          onClick={() => onNavigate('kegiatan')}
        />
        <KpiCard
          label="Karyawan"
          sublabel="Total data pegawai"
          value={stats?.karyawan_count}
          loading={statsLoading}
          icon={Users}
          accent="from-emerald-500 to-teal-500"
          onClick={() => onNavigate('karyawan')}
        />
        <KpiCard
          label="Piket Hari Ini"
          sublabel="Jadwal aktif hari ini"
          value={stats?.jadwal_piket_today_count}
          loading={statsLoading}
          icon={Calendar}
          accent="from-orange-500 to-amber-500"
          onClick={() => onNavigate('piket')}
        />
        <KpiCard
          label="Media"
          sublabel="Dokumentasi & arsip"
          valueLabel="Buka"
          loading={false}
          icon={FolderOpen}
          accent="from-indigo-500 to-violet-500"
          onClick={() => onNavigate('media')}
        />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Modules */}
        <section className="xl:col-span-8 space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-foreground">Modul Aplikasi</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Akses fitur portal pegawai</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {visibleModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => onNavigate(mod.id)}
                  className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-4 text-left shadow-sm hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <span
                    className={`flex items-center justify-center w-11 h-11 rounded-xl ring-1 shrink-0 ${mod.tone}`}
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="min-w-0 flex-1 pt-0.5">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{mod.label}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                    <span className="block text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {mod.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Right column */}
        <aside className="xl:col-span-4 space-y-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-sky-500 to-blue-600 p-5 text-primary-foreground shadow-lg shadow-primary/25">
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 left-6 w-32 h-32 rounded-full bg-white/5" />
            <div className="relative">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/80">
                Reminder
              </p>
              <h3 className="text-lg font-bold mt-2 leading-snug">Sudah lapor jurnal hari ini?</h3>
              <p className="text-sm text-white/85 mt-2 leading-relaxed">
                Isi Jurnal SKP agar rekap bulanan tetap lengkap dan akurat.
              </p>
              <Button
                variant="secondary"
                className="mt-5 w-full bg-card text-primary font-bold border-none hover:bg-card/95 h-10 rounded-xl"
                onClick={() => onNavigate('kegiatan')}
              >
                Isi Jurnal Sekarang
              </Button>
            </div>
          </div>

          {isAdmin && (
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <OnlineUsersWidget onOpenMap={() => onNavigate('map')} compact />
            </div>
          )}

          <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-4">
            <p className="text-xs font-bold text-foreground">Tips cepat</p>
            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground leading-relaxed">
              <li>• Gunakan filter periode di atas untuk menyesuaikan KPI.</li>
              <li>• Tombol “Tambah Kegiatan” tersedia di sidebar kiri.</li>
              <li>• Media menyimpan foto & dokumen kegiatan.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  sublabel,
  value,
  valueLabel,
  loading,
  icon: Icon,
  accent,
  onClick,
}: {
  label: string;
  sublabel: string;
  value?: number;
  valueLabel?: string;
  loading: boolean;
  icon: typeof ClipboardList;
  accent: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden text-left rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-primary/25 hover:shadow-md transition-all"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${accent}`} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          {loading ? (
            <div className="mt-2 h-9 w-16 bg-muted animate-pulse rounded-lg" />
          ) : (
            <p className="mt-1.5 text-3xl font-black tabular-nums tracking-tight text-foreground">
              {valueLabel ?? value ?? 0}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1.5 font-medium">{sublabel}</p>
        </div>
        <span
          className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${accent} text-white shadow-md opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all`}
        >
          <Icon className="w-4.5 h-4.5" />
        </span>
      </div>
    </button>
  );
}
