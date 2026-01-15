import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Filter, X, FileText, Printer } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Select, Chip, Spinner, Input } from './ui';
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
        <section className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-foreground">Jadwal Piket</h2>
                    <p className="text-muted-foreground text-sm">Atur jadwal piket malam karyawan.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="gap-2 h-8 px-2 text-xs"
                        onClick={() => setIsPrintModalOpen(true)}
                        isDisabled={filteredData.length === 0}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        Ekspor PDF
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 h-8"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus className="w-4 h-4" />
                        Tambah
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="p-3 bg-card rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filter</span>
                    {hasActiveFilter && (
                        <button
                            onClick={clearFilters}
                            className="ml-auto flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                            <X className="w-3 h-3" />
                            Reset
                        </button>
                    )}
                </div>
                <div className={`grid ${isAdmin ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-3'} gap-2`}>
                    <Select
                        options={filterOptions.days}
                        value={filterDay}
                        onChange={setFilterDay}
                        placeholder="Tgl"
                    />
                    <Select
                        options={filterOptions.months}
                        value={filterMonth}
                        onChange={setFilterMonth}
                        placeholder="Bulan"
                    />
                    <Select
                        options={filterOptions.years}
                        value={filterYear}
                        onChange={setFilterYear}
                        placeholder="Tahun"
                    />
                    {isAdmin && (
                        <div className="col-span-2 md:col-span-1">
                            <Select
                                options={filterOptions.users}
                                value={filterUser}
                                onChange={setFilterUser}
                                placeholder="Petugas"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Schedule Table */}
            <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold w-24">HARI</th>
                            <th className="px-4 py-3 text-left font-semibold">
                                <Chip color="primary" size="sm" variant="flat">
                                    Piket Malam
                                </Chip>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {HARI.map(hari => (
                            <tr key={hari} className="border-t border-border">
                                <td className="px-4 py-3 font-medium text-card-foreground">
                                    {hari}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1.5">
                                        {getScheduleForDay(hari, 'Malam').map(s => {
                                            const isCurrentUser = user?.karyawan?.id === s.karyawan_id;
                                            return (
                                                <Chip
                                                    key={s.id}
                                                    size="sm"
                                                    variant={isCurrentUser ? "solid" : "flat"}
                                                    onClose={isAdmin ? () => handleDelete(s.id) : undefined}
                                                    className={isCurrentUser ? "bg-primary text-white" : "bg-primary/10 text-primary-600 border-primary/20"}
                                                >
                                                    {s.karyawan.nama}
                                                </Chip>
                                            );
                                        })}
                                        {getScheduleForDay(hari, 'Malam').length === 0 && (
                                            <span className="text-muted-foreground text-xs italic">Kosong</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
