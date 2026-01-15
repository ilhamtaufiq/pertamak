import { useState, useEffect, useMemo } from 'react';
import { MapPin, Filter, X, FileText, Printer } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Image } from 'lucide-react';
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
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingKegiatan, setEditingKegiatan] = useState<Kegiatan | null>(null);
    const [viewingKegiatan, setViewingKegiatan] = useState<Kegiatan | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

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

    // Fetch kegiatans
    const { data, isLoading, error } = useQuery({
        queryKey: ['kegiatans', user?.id],
        queryFn: () => api.get<PaginatedResponse<Kegiatan>>('/kegiatans'),
        enabled: !!user,
    });

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
        data?.data.forEach(k => {
            const year = k.tanggal.split('-')[0];
            years.add(year);
        });
        const yearOptions = [
            { value: '', label: 'Semua Tahun' },
            ...Array.from(years).sort((a, b) => b.localeCompare(a)).map(y => ({ value: y, label: y }))
        ];

        const userOptions = [
            { value: '', label: 'Semua Petugas' },
            ...(employeesData?.data.map(e => ({ value: String(e.user_id), label: e.nama })) || [])
        ];

        return { days, months, years: yearOptions, users: userOptions };
    }, [data, employeesData, isAdmin]);

    // Filtered data
    const filteredData = useMemo(() => {
        if (!data?.data) return [];
        return data.data.filter(kegiatan => {
            const [year, month, day] = kegiatan.tanggal.split('-');
            const matchDay = !filterDay || day === filterDay;
            const matchMonth = !filterMonth || month === filterMonth;
            const matchYear = !filterYear || year === filterYear;
            const matchUser = !filterUser || String(kegiatan.user_id) === filterUser;
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
            {/* Filter Bar */}
            <div className="mb-4 p-3 bg-card rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filter</span>
                    <div className="ml-auto flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="h-7 px-2 gap-1.5 text-xs"
                            onClick={() => setIsPrintModalOpen(true)}
                            isDisabled={filteredData.length === 0}
                        >
                            <FileText className="w-3.5 h-3.5" />
                            Ekspor PDF
                        </Button>
                        {hasActiveFilter && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                                <X className="w-3 h-3" />
                                Reset
                            </button>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
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
                </div>
                {isAdmin && (
                    <div className="mt-2">
                        <Select
                            options={filterOptions.users}
                            value={filterUser}
                            onChange={setFilterUser}
                            placeholder="Pilih Petugas"
                        />
                    </div>
                )}
                {hasActiveFilter && (
                    <p className="text-xs text-muted-foreground mt-2">
                        Menampilkan {filteredData.length} dari {data?.data.length} kegiatan
                    </p>
                )}
            </div>

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

            {/* Empty State */}
            {data?.data.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 rounded-full bg-default-100 flex items-center justify-center mb-4">
                        <Image className="w-10 h-10 text-default-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Belum ada kegiatan</h3>
                    <p className="text-default-500 text-sm mb-4">
                        Tap "Tambah" untuk mulai mencatat kegiatan
                    </p>
                    <Button variant="primary" onClick={handleAddClick}>
                        Tambah Kegiatan Pertama
                    </Button>
                </div>
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
                        {filteredData.length} kegiatan akan dicetak
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
