import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Plus, Pencil, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Avatar, Spinner } from './ui';
import { api } from '../lib/api';
import type { Karyawan, KaryawanFormData } from '../types/karyawan';

interface KaryawanResponse {
    data: Karyawan[];
}

interface ApiResponse<T> {
    message: string;
    data: T;
}

export function KaryawanSection() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingKaryawan, setEditingKaryawan] = useState<Karyawan | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['karyawans'],
        queryFn: () => api.get<KaryawanResponse>('/karyawans'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete<ApiResponse<null>>(`/karyawans/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['karyawans'] }),
    });

    const handleEdit = (karyawan: Karyawan) => {
        setEditingKaryawan(karyawan);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingKaryawan(null);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Hapus karyawan ini?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setEditingKaryawan(null);
    };

    const filteredData = data?.data.filter(k =>
        k.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.jabatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (k.nip && k.nip.includes(searchQuery))
    ) || [];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Spinner size="lg" color="primary" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Syncing Personnel Data...</p>
            </div>
        );
    }

    return (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Premium Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-1 bg-primary rounded-full" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Personnel Management</span>
                    </div>
                    <h2 className="text-2xl font-black text-foreground tracking-tight">Daftar Karyawan</h2>
                    <p className="text-muted-foreground text-sm font-medium">Monitoring dan kelola data profil tim lapangan.</p>
                </div>
                <Button
                    variant="primary"
                    size="sm"
                    className="h-10 px-5 gap-2 text-[11px] font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    onClick={handleAdd}
                >
                    <Plus className="w-4 h-4" strokeWidth={3} />
                    TAMBAH PEGAWAI
                </Button>
            </div>

            {/* Glassmorphism Search Bar */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-3 shadow-sm">
                <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <User className="w-4 h-4 text-primary opacity-50" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari nama, jabatan, atau NIP..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-background/50 border-none rounded-2xl py-3 pl-11 pr-4 text-sm font-medium placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                    />
                </div>
            </div>

            {/* Personnel Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredData.length > 0 ? (
                    filteredData.map((karyawan, index) => (
                        <div
                            key={karyawan.id}
                            className="group bg-card border border-border/40 p-5 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 active:scale-[0.98] animate-in fade-in slide-in-from-bottom-2 duration-500"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="relative">
                                    <Avatar
                                        src={karyawan.foto?.thumb}
                                        alt={karyawan.nama}
                                        size="lg"
                                        className="ring-4 ring-background shadow-md"
                                        fallback={<User className="w-6 h-6 text-muted-foreground/40" />}
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-card shadow-sm" />
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(karyawan)}
                                        className="p-2 rounded-xl bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(karyawan.id)}
                                        className="p-2 rounded-xl bg-muted/50 text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-foreground leading-tight tracking-tight group-hover:text-primary transition-colors">
                                    {karyawan.nama}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                                        {karyawan.jabatan}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-border/40 grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-muted-foreground uppercase opacity-60 tracking-tighter">NIP / ID</span>
                                    <span className="text-xs font-bold text-foreground tabular-nums tracking-tight truncate">
                                        {karyawan.nip || 'Guest'}
                                    </span>
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="text-[9px] font-black text-muted-foreground uppercase opacity-60 tracking-tighter">CONTACT</span>
                                    <span className="text-xs font-bold text-foreground tabular-nums tracking-tight truncate">
                                        {karyawan.no_hp || '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 bg-card/50 border-2 border-dashed border-border/40 rounded-[3rem]">
                        <div className="p-4 rounded-full bg-muted/50 mb-4">
                            <User className="w-8 h-8 text-muted-foreground/20" />
                        </div>
                        <h4 className="text-sm font-black text-foreground uppercase tracking-widest">No Personnel Found</h4>
                        <p className="text-xs text-muted-foreground mt-1">Coba sesuaikan kata kunci pencarian Anda.</p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-4 text-[10px] font-bold text-primary uppercase underline underline-offset-4"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Form Modal */}
            <KaryawanFormModal
                isOpen={isModalOpen}
                onClose={handleClose}
                karyawan={editingKaryawan}
            />
        </section>
    );
}


// Form Modal
interface KaryawanFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    karyawan: Karyawan | null;
}

function KaryawanFormModal({ isOpen, onClose, karyawan }: KaryawanFormModalProps) {
    const queryClient = useQueryClient();
    const isEditing = !!karyawan;

    const [formData, setFormData] = useState<KaryawanFormData>({
        nama: '',
        jabatan: '',
        nip: '',
        no_hp: '',
    });
    const [foto, setFoto] = useState<File | null>(null);
    const [deleteFoto, setDeleteFoto] = useState(false);

    // Reset form when modal opens with different karyawan
    useEffect(() => {
        if (isOpen) {
            setFormData({
                nama: karyawan?.nama || '',
                jabatan: karyawan?.jabatan || '',
                nip: karyawan?.nip || '',
                no_hp: karyawan?.no_hp || '',
            });
            setFoto(null);
            setDeleteFoto(false);
        }
    }, [isOpen, karyawan]);

    const createMutation = useMutation({
        mutationFn: (data: FormData) => api.post<ApiResponse<Karyawan>>('/karyawans', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['karyawans'] });
            onClose();
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: FormData) => api.put<ApiResponse<Karyawan>>(`/karyawans/${karyawan?.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['karyawans'] });
            onClose();
        },
    });

    const mutation = isEditing ? updateMutation : createMutation;

    const handleSubmit = () => {
        const data = new FormData();
        data.append('nama', formData.nama);
        data.append('jabatan', formData.jabatan);
        if (formData.nip) data.append('nip', formData.nip);
        if (formData.no_hp) data.append('no_hp', formData.no_hp);
        if (foto) data.append('foto', foto);
        if (deleteFoto) data.append('delete_foto', '1');

        mutation.mutate(data);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalHeader onClose={onClose}>
                {isEditing ? 'Edit Karyawan' : 'Tambah Karyawan'}
            </ModalHeader>
            <ModalBody>
                <Input
                    label="Nama"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                />

                <Input
                    label="Jabatan"
                    required
                    placeholder="Contoh: Staff, Kepala Seksi"
                    value={formData.jabatan}
                    onChange={(e) => setFormData(prev => ({ ...prev, jabatan: e.target.value }))}
                />

                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="NIP"
                        value={formData.nip || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, nip: e.target.value }))}
                    />
                    <Input
                        label="No HP"
                        value={formData.no_hp || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, no_hp: e.target.value }))}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Foto</label>
                    {isEditing && karyawan?.foto && !deleteFoto && (
                        <div className="mb-2 flex items-center gap-2">
                            <Avatar src={karyawan.foto.thumb} size="md" />
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeleteFoto(true)}
                            >
                                <Trash2 className="w-4 h-4 text-danger" />
                                Hapus foto
                            </Button>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFoto(e.target.files?.[0] || null)}
                        className="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 text-xs font-medium file:mr-4 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-primary file:text-white file:text-[10px] file:font-black file:uppercase transition-all focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    />
                    <p className="text-[10px] text-muted-foreground font-medium mt-2 ml-1">Format: JPG, PNG • Maks. 10MB</p>
                </div>

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
                    {isEditing ? 'Simpan' : 'Tambah'}
                </Button>
            </ModalFooter>
        </Modal>
    );
}
