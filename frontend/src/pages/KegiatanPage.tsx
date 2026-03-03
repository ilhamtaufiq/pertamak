import { useState, useEffect, useMemo } from 'react';
import { MapPin, Filter, FileText, Printer, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { format } from 'date-fns';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, TextArea, Spinner, ImageUploader, Select } from '../components/ui';
import { api } from '../lib/api';
import { KegiatanCard } from '../components/KegiatanCard';
import { KegiatanDetailModal } from '../components/KegiatanDetailModal';
import { KegiatanPrintView } from '../components/KegiatanPrintView';
import { KegiatanGroupedPrintView } from '../components/KegiatanGroupedPrintView';
import { useGeolocation } from '../hooks/useGeolocation';
import { useAuth } from '../contexts/AuthContext';
import type { Kegiatan, PaginatedResponse, ApiResponse, KegiatanFormData } from '../types/kegiatan';
import type { Karyawan } from '../types/karyawan';

export function KegiatanPage() {
    const { user, token } = useAuth();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingKegiatan, setEditingKegiatan] = useState<Kegiatan | null>(null);
    const [viewingKegiatan, setViewingKegiatan] = useState<Kegiatan | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);

    // Filters
    const [filterDay, setFilterDay] = useState<string>('');
    const [filterMonth, setFilterMonth] = useState<string>('');
    const [filterYear, setFilterYear] = useState<string>('');
    const [filterUser, setFilterUser] = useState<string>('');

    const isAdmin = user?.roles?.some(r => r.name === 'admin');

    // Fetch employees (for admin filter)
    const { data: employeesData } = useQuery({
        queryKey: ['employees'],
        queryFn: () => api.get<{ data: Karyawan[] }>('/karyawans'),
        enabled: isAdmin,
    });

    // Infinite Query for fetch kegiatans
    const {
        data: infiniteData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error
    } = useInfiniteQuery({
        queryKey: ['kegiatans', user?.id, filterDay, filterMonth, filterYear, filterUser],
        queryFn: ({ pageParam = 1 }) => api.get<PaginatedResponse<Kegiatan>>('/kegiatans', {
            page: pageParam,
            per_page: 20,
            day: filterDay,
            month: filterMonth,
            year: filterYear,
            user_id: filterUser
        }),
        getNextPageParam: (lastPage) => lastPage.next_page_url ? lastPage.current_page + 1 : undefined,
        initialPageParam: 1,
        enabled: !!user,
    });

    const { ref: loadMoreRef, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    // Flattened data from multiple pages
    const flattedData = useMemo(() => {
        return infiniteData?.pages.flatMap(page => page.data) || [];
    }, [infiniteData]);

    // Data used for display (already filtered on server, but can still apply client filters if needed)
    const filteredData = flattedData;

    // Total results count from pagination
    const totalResults = infiniteData?.pages[0]?.total || 0;

    // Generate filter options from data
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

        // Extract unique years from data
        const years = new Set<string>();
        flattedData.forEach(k => {
            const year = k.tanggal.split('-')[0];
            years.add(year);
        });
        const currentYear = new Date().getFullYear().toString();
        years.add(currentYear); // Ensure current year is always there

        const yearOptions = [
            { value: '', label: 'Semua Tahun' },
            ...Array.from(years).sort((a, b) => b.localeCompare(a)).map(y => ({ value: y, label: y }))
        ];

        const userOptions = [
            { value: '', label: 'Semua Petugas' },
            ...(employeesData?.data.map(e => ({ value: String(e.user_id), label: e.nama })) || [])
        ];

        return { days, months, years: yearOptions, users: userOptions };
    }, [flattedData, employeesData, isAdmin]);

    const hasActiveFilter = filterDay || filterMonth || filterYear || filterUser;
    const clearFilters = () => {
        setFilterDay('');
        setFilterMonth('');
        setFilterYear('');
        setFilterUser('');
    };

    // Get selected user info for print
    const selectedUserInfo = useMemo(() => {
        if (!isAdmin) {
            return user?.karyawan;
        }
        if (!filterUser) return undefined;
        return employeesData?.data.find(e => String(e.user_id) === filterUser);
    }, [filterUser, employeesData, isAdmin, user]);

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete<ApiResponse<null>>(`/kegiatans/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kegiatans'] });
        },
    });

    const handleView = (kegiatan: Kegiatan) => {
        setViewingKegiatan(kegiatan);
        setIsDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setIsDetailOpen(false);
        setViewingKegiatan(null);
    };

    const handleEdit = (kegiatan: Kegiatan) => {
        setIsDetailOpen(false);
        setViewingKegiatan(null);
        setEditingKegiatan(kegiatan);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Hapus kegiatan ini?')) {
            setIsDetailOpen(false);
            setViewingKegiatan(null);
            deleteMutation.mutate(id);
        }
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setEditingKegiatan(null);
    };

    const handleAddClick = () => {
        setEditingKegiatan(null);
        setIsModalOpen(true);
    };

    const handlePrint = () => {
        const printContent = document.getElementById('print-preview-content');
        if (printContent) {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            const doc = iframe.contentWindow?.document;
            if (doc) {
                doc.write('<html><head><title>Print Preview</title>');
                // Copy styles from the current document
                const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
                styles.forEach(style => doc.write(style.outerHTML));
                doc.write('</head><body>');
                doc.write(printContent.innerHTML);
                doc.write('</body></html>');
                doc.close();

                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();

                // Remove iframe after print dialog closes
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 1000);
            }
        }
    };

    const handleDownloadDocx = async () => {
        setIsDownloadingDocx(true);
        try {
            const params = new URLSearchParams();
            if (filterDay) params.append('day', filterDay);
            if (filterMonth) params.append('month', filterMonth);
            if (filterYear) params.append('year', filterYear);
            if (filterUser) params.append('user_id', filterUser);

            const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
            const response = await fetch(`${API_BASE_URL}/kegiatans/export/docx?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'Laporan_Kegiatan.docx';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch) filename = filenameMatch[1];
            }

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download DOCX failed:', error);
            alert('Gagal mendownload file DOCX');
        } finally {
            setIsDownloadingDocx(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <Spinner size="lg" />
                    <p className="text-default-500 text-sm">Memuat kegiatan...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-danger/10 text-danger rounded-xl text-center">
                Error: {error.message}
            </div>
        );
    }

    return (
        <>
            {/* Premium Filter Bar */}
            <section className="mb-6 animate-in fade-in slide-in-from-top-2 duration-500 relative z-30">
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                <Filter className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Filter Laporan</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {hasActiveFilter && (
                                <button
                                    onClick={clearFilters}
                                    className="text-[10px] font-bold text-destructive uppercase tracking-tight px-2 py-1 rounded-full bg-destructive/10 hover:bg-destructive/20 transition-colors"
                                >
                                    Reset
                                </button>
                            )}
                            <div className="flex gap-1.5">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="h-8 px-3 gap-2 text-[11px] font-bold bg-primary text-white border-none shadow-md shadow-primary/20 hover:scale-105 active:scale-95"
                                    onClick={() => setIsPrintModalOpen(true)}
                                    isDisabled={isLoading || !infiniteData || flattedData.length === 0}
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    PDF
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="h-8 px-3 gap-2 text-[11px] font-bold bg-blue-600 text-white border-none shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95"
                                    onClick={handleDownloadDocx}
                                    isLoading={isDownloadingDocx}
                                    isDisabled={isLoading || !infiniteData || flattedData.length === 0 || isDownloadingDocx}
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    DOCX
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
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
                                showSearch
                            />
                        </div>
                    )}

                    {hasActiveFilter && (
                        <div className="mt-4 flex items-center justify-between px-1">
                            <p className="text-[10px] text-muted-foreground font-medium">
                                Ditemukan <span className="text-foreground font-bold">{flattedData.length}</span> dari <span className="text-foreground font-bold">{totalResults}</span> kegiatan
                            </p>
                            <div className="h-1 flex-1 bg-muted rounded-full mx-3 overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: `${Math.min(100, (flattedData.length / totalResults) * 100)}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredData.map((kegiatan, index) => (
                    <KegiatanCard
                        key={kegiatan.id}
                        kegiatan={kegiatan}
                        index={index}
                        onClick={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isDeleting={deleteMutation.isPending}
                    />
                ))}
            </div>

            {/* Load More Sentinel */}
            <div ref={loadMoreRef} className="py-8 flex justify-center">
                {isFetchingNextPage && (
                    <div className="flex flex-col items-center gap-2">
                        <Spinner size="sm" />
                        <p className="text-xs text-muted-foreground">Memuat lebih banyak...</p>
                    </div>
                )}
                {!hasNextPage && flattedData.length > 0 && (
                    <p className="text-xs text-muted-foreground italic">Semua kegiatan telah dimuat</p>
                )}
            </div>

            {/* Premium Empty State */}
            {flattedData.length === 0 && !isLoading && (
                <section className="flex flex-col items-center justify-center py-20 px-6 animate-in fade-in zoom-in-95 duration-500">
                    <div className="relative mb-8">
                        <div className="w-32 h-32 rounded-full bg-primary/5 flex items-center justify-center animate-pulse">
                            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                                <FileText className="w-12 h-12 text-primary/40" />
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 p-3 bg-card rounded-2xl shadow-xl">
                            <Plus className="w-6 h-6 text-primary" strokeWidth={3} />
                        </div>
                    </div>

                    <h3 className="text-xl font-black text-foreground mb-2">Jurnal Masih Kosong</h3>
                    <p className="text-muted-foreground text-sm mb-8 max-w-[240px] text-center leading-relaxed">
                        Mulai catat aktivitas harianmu untuk laporan SKP yang lebih rapi.
                    </p>

                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleAddClick}
                        className="rounded-2xl px-8 py-6 font-bold text-base shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        Tambah Jurnal Sekarang
                    </Button>
                </section>
            )}

            {/* Form Modal */}
            <KegiatanFormModal
                isOpen={isModalOpen}
                onClose={handleClose}
                kegiatan={editingKegiatan}
            />

            {/* Detail Modal */}
            <KegiatanDetailModal
                isOpen={isDetailOpen}
                onClose={handleCloseDetail}
                kegiatan={viewingKegiatan}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Print Preview Modal */}
            <Modal isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)} size="lg">
                <ModalHeader onClose={() => setIsPrintModalOpen(false)}>
                    Preview Jurnal SKP
                </ModalHeader>
                <ModalBody className="p-0 bg-muted overflow-hidden">
                    <div className="max-h-[70vh] overflow-auto p-4 flex justify-center">
                        <div id="print-preview-content" className="bg-white shadow-xl origin-top scale-[0.6] sm:scale-[0.8] md:scale-100 min-w-[1000px]">
                            {isAdmin && !filterUser ? (
                                <KegiatanGroupedPrintView
                                    data={filteredData}
                                    month={filterMonth}
                                    year={filterYear}
                                />
                            ) : (
                                <KegiatanPrintView
                                    data={filteredData}
                                    month={filterMonth}
                                    year={filterYear}
                                    userInfo={selectedUserInfo ? {
                                        nama: selectedUserInfo.nama,
                                        nip: selectedUserInfo.nip,
                                        jabatan: selectedUserInfo.jabatan
                                    } : undefined}
                                />
                            )}
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter className="justify-between">
                    <p className="text-xs text-muted-foreground">
                        {flattedData.length} kegiatan akan dicetak
                    </p>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => setIsPrintModalOpen(false)}>
                            Batal
                        </Button>
                        <Button variant="primary" onClick={handlePrint} className="gap-2">
                            <Printer className="w-4 h-4" />
                            Cetak Jurnal
                        </Button>
                    </div>
                </ModalFooter>
            </Modal>
        </>
    );
}

// Expose function to open form from parent
export function useKegiatanForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [editing, setEditing] = useState<Kegiatan | null>(null);

    const openForm = () => {
        setEditing(null);
        setIsOpen(true);
    };

    const closeForm = () => {
        setIsOpen(false);
        setEditing(null);
    };

    return { isOpen, editing, openForm, closeForm };
}

// Form Modal Component
interface KegiatanFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    kegiatan: Kegiatan | null;
}

function KegiatanFormModal({ isOpen, onClose, kegiatan }: KegiatanFormModalProps) {
    const queryClient = useQueryClient();
    const isEditing = !!kegiatan;

    const [formData, setFormData] = useState<KegiatanFormData>({
        tanggal: format(new Date(), 'yyyy-MM-dd'),
        lokasi: '',
        latitude: null,
        longitude: null,
        uraian_kegiatan: '',
    });
    const [files, setFiles] = useState<File[]>([]);
    const [deleteIds, setDeleteIds] = useState<number[]>([]);

    // Geolocation hook
    const { isLoading: isGeoLoading, error: geoError, coordinates, address, getLocation, formatLocationWithCoords } = useGeolocation();

    // Update form when geolocation is fetched
    useEffect(() => {
        if (coordinates && address) {
            setFormData(prev => ({
                ...prev,
                lokasi: formatLocationWithCoords(),
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
            }));
        }
    }, [coordinates, address, formatLocationWithCoords]);

    // Reset form when kegiatan changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                tanggal: kegiatan?.tanggal || format(new Date(), 'yyyy-MM-dd'),
                lokasi: kegiatan?.lokasi || '',
                latitude: kegiatan?.latitude || null,
                longitude: kegiatan?.longitude || null,
                uraian_kegiatan: kegiatan?.uraian_kegiatan || '',
            });
            setFiles([]);
            setDeleteIds([]);
        }
    }, [isOpen, kegiatan]);

    const createMutation = useMutation({
        mutationFn: (data: FormData) => api.post<ApiResponse<Kegiatan>>('/kegiatans', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kegiatans'] });
            onClose();
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: FormData) => api.put<ApiResponse<Kegiatan>>(`/kegiatans/${kegiatan?.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kegiatans'] });
            onClose();
        },
    });

    const mutation = isEditing ? updateMutation : createMutation;

    const handleSubmit = () => {
        const data = new FormData();
        data.append('tanggal', formData.tanggal);
        data.append('lokasi', formData.lokasi);
        if (formData.latitude !== null) {
            data.append('latitude', String(formData.latitude));
        }
        if (formData.longitude !== null) {
            data.append('longitude', String(formData.longitude));
        }
        data.append('uraian_kegiatan', formData.uraian_kegiatan);

        files.forEach((file) => {
            data.append('dokumentasi[]', file);
        });

        deleteIds.forEach((id) => {
            data.append('delete_dokumentasi[]', String(id));
        });

        mutation.mutate(data);
    };

    const toggleDeleteExisting = (id: number) => {
        setDeleteIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalHeader onClose={onClose}>
                {isEditing ? 'Edit Kegiatan' : 'Tambah Kegiatan'}
            </ModalHeader>
            <ModalBody>
                <Input
                    type="date"
                    label="Tanggal"
                    required
                    value={formData.tanggal}
                    onChange={(e) => setFormData(prev => ({ ...prev, tanggal: e.target.value }))}
                />

                <Input
                    label="Lokasi"
                    required
                    placeholder="Contoh: Kantor UPTD Pertamak"
                    value={formData.lokasi}
                    onChange={(e) => setFormData(prev => ({ ...prev, lokasi: e.target.value }))}
                />

                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={getLocation}
                    isLoading={isGeoLoading}
                    isDisabled={isGeoLoading}
                    className="flex items-center gap-2 -mt-2"
                >
                    <MapPin className="w-4 h-4" />
                    {isGeoLoading ? 'Mencari lokasi...' : 'Gunakan Lokasi Saat Ini'}
                </Button>

                {geoError && (
                    <p className="text-sm text-danger -mt-2">{geoError}</p>
                )}

                <TextArea
                    label="Uraian Kegiatan"
                    required
                    placeholder="• Kegiatan 1&#10;• Kegiatan 2"
                    rows={4}
                    value={formData.uraian_kegiatan}
                    onChange={(e) => setFormData(prev => ({ ...prev, uraian_kegiatan: e.target.value }))}
                />

                {/* Uppy Image Uploader */}
                <ImageUploader
                    onFilesChange={setFiles}
                    maxFiles={10}
                    existingImages={isEditing && kegiatan?.dokumentasi ? kegiatan.dokumentasi : []}
                    onDeleteExisting={toggleDeleteExisting}
                    deletedIds={deleteIds}
                />

                {mutation.error && (
                    <div className="p-3 bg-danger/10 text-danger rounded-lg text-sm">
                        {mutation.error.message}
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
                    isLoading={mutation.isPending}
                >
                    {isEditing ? 'Simpan Perubahan' : 'Tambah Kegiatan'}
                </Button>
            </ModalFooter>
        </Modal>
    );
}

// Export for external use
export { KegiatanFormModal };
