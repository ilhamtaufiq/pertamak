import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Filter, X, Printer, Calendar } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Select, Spinner, Input } from './ui';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { JadwalPiketPrintView } from './JadwalPiketPrintView';
import type { JadwalPiket, JadwalPiketFormData, JadwalPiketResponse, Hari, Shift } from '../types/jadwal_piket';
import type { Karyawan } from '../types/karyawan';

const HARI: Hari[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const HARI_MAP: Record<number, Hari> = {
    0: 'Minggu',
    1: 'Senin',
    2: 'Selasa',
    3: 'Rabu',
    4: 'Kamis',
    5: 'Jumat',
    6: 'Sabtu',
};

interface KaryawanResponse {
    data: Karyawan[];
}

interface ApiResponse<T> {
    message: string;
    data: T;
}

export function JadwalPiketSection() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const isAdmin = user?.roles?.some(r => r.name === 'admin');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

    // Filter state
    const [filterDay, setFilterDay] = useState<string>('');
    const [filterMonth, setFilterMonth] = useState<string>('');
    const [filterYear, setFilterYear] = useState<string>('');
    const [filterUser, setFilterUser] = useState<string>('');

    const { data: karyawanData } = useQuery({
        queryKey: ['karyawans'],
        queryFn: () => api.get<KaryawanResponse>('/karyawans'),
    });

    const { data, isLoading } = useQuery({
        queryKey: ['jadwal-pikets', user?.id],
        queryFn: () => api.get<JadwalPiketResponse>('/jadwal-pikets'),
    });



    // Generate filter options
    const filterOptions = useMemo(() => {
        const days = [
            { value: '', label: 'Semua Tgl' },
            ...Array.from({ length: 31 }, (_, i) => {
                const day = String(i + 1).padStart(2, '0');
                return { value: day, label: day };
            })
        ];

        const months = [
            { value: '', label: 'Semua Bulan' },
            { value: '01', label: 'Januari' },
            { value: '02', label: 'Februari' },
            { value: '03', label: 'Maret' },
            { value: '04', label: 'April' },
            { value: '05', label: 'Mei' },
            { value: '06', label: 'Juni' },
            { value: '07', label: 'Juli' },
            { value: '08', label: 'Agustus' },
            { value: '09', label: 'September' },
            { value: '10', label: 'Oktober' },
            { value: '11', label: 'November' },
            { value: '12', label: 'Desember' },
        ];

        const years = new Set<string>();
        data?.data.forEach(j => {
            if (j.tanggal) {
                const year = j.tanggal.split('-')[0];
                years.add(year);
            }
        });

        const yearOptions = [
            { value: '', label: 'Semua Tahun' },
            ...Array.from(years).sort((a, b) => b.localeCompare(a)).map(y => ({ value: y, label: y }))
        ];

        const userOptions = [
            { value: '', label: 'Semua Petugas' },
            ...(karyawanData?.data.map(k => ({ value: String(k.id), label: k.nama })) || [])
        ];

        return { days, months, years: yearOptions, users: userOptions };
    }, [data, karyawanData]);

    // Filtered data
    const filteredData = useMemo(() => {
        if (!data?.data) return [];
        return data.data.filter(j => {
            if (!j.tanggal) return true; // Legacy data
            const [year, month, day] = j.tanggal.split('-');
            const matchDay = !filterDay || day === filterDay;
            const matchMonth = !filterMonth || month === filterMonth;
            const matchYear = !filterYear || year === filterYear;
            const matchUser = !filterUser || String(j.karyawan_id) === filterUser;
            return matchDay && matchMonth && matchYear && matchUser;
        });
    }, [data, filterDay, filterMonth, filterYear, filterUser]);

    const hasActiveFilter = filterDay || filterMonth || filterYear || filterUser;
    const clearFilters = () => {
        setFilterDay('');
        setFilterMonth('');
        setFilterYear('');
        setFilterUser('');
    };



    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete<ApiResponse<null>>(`/jadwal-pikets/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jadwal-pikets'] }),
    });

    const handleDelete = (id: number) => {
        if (confirm('Hapus jadwal ini?')) {
            deleteMutation.mutate(id);
        }
    };

    const handlePrint = () => {
        const printContent = document.getElementById('piket-print-preview');
        if (printContent) {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            const doc = iframe.contentWindow?.document;
            if (doc) {
                doc.write('<html><head><title>Absensi Piket</title>');
                const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
                styles.forEach(style => doc.write(style.outerHTML));
                doc.write('</head><body>');
                doc.write(printContent.innerHTML);
                doc.write('</body></html>');
                doc.close();

                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();

                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 1000);
            }
        }
    };

    // Group data by hari and shift from filtered data
    const getScheduleForDay = (hari: Hari, shift: Shift) => {
        return filteredData.filter(j => j.hari === hari && j.shift === shift) || [];
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Spinner color="primary" />
            </div>
        );
    }

    return (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Premium Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-1 bg-primary rounded-full" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Management</span>
                    </div>
                    <h2 className="text-2xl font-black text-foreground tracking-tight">Jadwal Piket Malam</h2>
                    <p className="text-muted-foreground text-sm font-medium">Monitoring kehadiran kerja tim shift malam.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="h-10 px-4 gap-2 text-[11px] font-bold bg-card border border-border/60 shadow-sm hover:scale-105 active:scale-95 transition-all"
                        onClick={() => setIsPrintModalOpen(true)}
                        isDisabled={filteredData.length === 0}
                    >
                        <Printer className="w-3.5 h-3.5" />
                        CETAK PDF
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        className="h-10 px-4 gap-2 text-[11px] font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus className="w-4 h-4" />
                        TAMBAH JADWAL
                    </Button>
                </div>
            </div>

            {/* Premium Filter Section (Glassmorphism) */}
            <section className="animate-in fade-in slide-in-from-top-2 duration-500 delay-75">
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                <Filter className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Filter Jadwal</span>
                        </div>
                        {hasActiveFilter && (
                            <button
                                onClick={clearFilters}
                                className="text-[10px] font-bold text-destructive uppercase tracking-tight px-3 py-1.5 rounded-full bg-destructive/10 hover:bg-destructive/20 transition-colors"
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase ml-1">Hari</span>
                            <Select
                                options={filterOptions.days}
                                value={filterDay}
                                onChange={setFilterDay}
                                className="bg-background/50 border-none shadow-inner"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase ml-1">Bulan</span>
                            <Select
                                options={filterOptions.months}
                                value={filterMonth}
                                onChange={setFilterMonth}
                                className="bg-background/50 border-none shadow-inner"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase ml-1">Tahun</span>
                            <Select
                                options={filterOptions.years}
                                value={filterYear}
                                onChange={setFilterYear}
                                className="bg-background/50 border-none shadow-inner"
                            />
                        </div>
                    </div>

                    {isAdmin && (
                        <div className="mt-3 flex flex-col gap-1">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase ml-1">Petugas</span>
                            <Select
                                options={filterOptions.users}
                                value={filterUser}
                                onChange={setFilterUser}
                                className="bg-background/50 border-none shadow-inner"
                            />
                        </div>
                    )}
                </div>
            </section>

            {/* Premium Schedule Scroll View (Bento grouped cards) */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <h3 className="text-[11px] font-black text-foreground uppercase tracking-wider">Weekly Coverage</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {HARI.map(hari => {
                        const schedule = getScheduleForDay(hari, 'Malam');
                        return (
                            <div
                                key={hari}
                                className="group bg-card border border-border/40 p-5 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 active:scale-[0.98]"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-black text-lg tracking-tight group-hover:text-primary transition-colors">{hari}</h4>
                                    <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-lg uppercase">
                                        Shift Malam
                                    </span>
                                </div>

                                <div className="flex flex-col gap-2.5">
                                    {schedule.length > 0 ? (
                                        schedule.map(s => {
                                            const isCurrentUser = user?.karyawan?.id === s.karyawan_id;
                                            return (
                                                <div
                                                    key={s.id}
                                                    className={`relative flex items-center justify-between p-3 rounded-2xl border transition-all ${isCurrentUser
                                                        ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/10'
                                                        : 'bg-muted/30 border-transparent hover:bg-muted/50'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black shadow-sm ${isCurrentUser ? 'bg-primary text-white' : 'bg-background text-muted-foreground border border-border/40'
                                                            }`}>
                                                            {s.karyawan.nama.charAt(0)}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className={`text-xs font-bold ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                                                                {s.karyawan.nama}
                                                            </span>
                                                            {s.tanggal && (
                                                                <span className="text-[10px] text-muted-foreground font-medium opacity-60">
                                                                    {format(new Date(s.tanggal), 'dd MMM yyyy', { locale: id })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {isAdmin && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}
                                                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6 px-4 bg-muted/20 border border-dashed border-border/60 rounded-2xl">
                                            <Calendar className="w-5 h-5 text-muted-foreground/20 mb-2" />
                                            <span className="text-[10px] text-muted-foreground font-bold tracking-tight uppercase">No Officer Assigned</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Form Modal */}
            <JadwalPiketFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                karyawans={karyawanData?.data || []}
            />

            {/* Print Preview Modal */}
            <Modal isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)} size="xl">
                <ModalHeader onClose={() => setIsPrintModalOpen(false)}>
                    Preview Absensi Piket
                </ModalHeader>
                <ModalBody className="p-0 bg-muted overflow-hidden">
                    <div className="max-h-[75vh] overflow-auto p-4 flex justify-center">
                        <div id="piket-print-preview" className="bg-white shadow-xl origin-top scale-[0.6] sm:scale-[0.8] md:scale-90 lg:scale-100 min-w-[800px]">
                            <JadwalPiketPrintView
                                data={filteredData}
                                month={filterMonth}
                                year={filterYear}
                            />
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter className="justify-between">
                    <p className="text-xs text-muted-foreground font-medium">
                        Catatan: Dokumen ini khusus untuk Absensi Piket Malam
                    </p>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => setIsPrintModalOpen(false)}>
                            Batal
                        </Button>
                        <Button variant="primary" onClick={handlePrint} className="gap-2">
                            <Printer className="w-4 h-4" />
                            Cetak Absensi
                        </Button>
                    </div>
                </ModalFooter>
            </Modal>
        </section>
    );
}

// Form Modal
interface JadwalPiketFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    karyawans: Karyawan[];
}

function JadwalPiketFormModal({ isOpen, onClose, karyawans }: JadwalPiketFormModalProps) {
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<JadwalPiketFormData>({
        hari: 'Senin',
        tanggal: format(new Date(), 'yyyy-MM-dd'),
        shift: 'Pagi',
        karyawan_id: karyawans[0]?.id || 0,
    });

    // Update hari whenever tanggal changes
    useEffect(() => {
        if (formData.tanggal) {
            const date = new Date(formData.tanggal);
            const dayIndex = date.getDay();
            setFormData(prev => ({ ...prev, hari: HARI_MAP[dayIndex] }));
        }
    }, [formData.tanggal]);

    const createMutation = useMutation({
        mutationFn: (data: JadwalPiketFormData) => api.post<ApiResponse<JadwalPiket>>('/jadwal-pikets', data as unknown as Record<string, unknown>),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jadwal-pikets'] });
            onClose();
        },
    });

    const handleSubmit = () => {
        createMutation.mutate(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalHeader onClose={onClose}>Tambah Jadwal Piket</ModalHeader>
            <ModalBody>
                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="Tanggal"
                        type="date"
                        value={formData.tanggal}
                        onChange={(e) => setFormData(prev => ({ ...prev, tanggal: e.target.value }))}
                    />
                    <div className="space-y-2">
                        <label className="block text-sm font-medium">Hari</label>
                        <div className="px-4 py-2 bg-muted rounded-xl border border-border text-muted-foreground text-sm h-[42px] flex items-center">
                            {formData.hari}
                        </div>
                    </div>
                </div>

                <Select
                    label="Karyawan"
                    value={formData.karyawan_id ? String(formData.karyawan_id) : ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, karyawan_id: Number(value) }))}
                    options={karyawans.map(k => ({ value: String(k.id), label: k.nama }))}
                    disabled={karyawans.length === 0}
                    showSearch={true}
                />


                {karyawans.length === 0 && (
                    <p className="text-xs text-danger">Tambahkan karyawan terlebih dahulu</p>
                )}

                {createMutation.error && (
                    <div className="p-3 bg-danger/10 text-danger rounded-lg text-sm">
                        {createMutation.error.message}
                    </div>
                )}
            </ModalBody>
            <ModalFooter>
                <Button variant="ghost" onClick={onClose}>
                    Batal
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    isLoading={createMutation.isPending}
                    isDisabled={karyawans.length === 0}
                >
                    Tambah Jadwal
                </Button>
            </ModalFooter>
        </Modal>
    );
}
