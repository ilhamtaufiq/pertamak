import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Plus, Pencil, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Avatar, Spinner, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui';
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
                    <h2 className="text-xl font-bold text-foreground">Daftar Karyawan</h2>
                    <p className="text-muted-foreground text-sm">Kelola data pegawai dan profil.</p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAdd}
                >
                    <Plus className="w-4 h-4" />
                    Tambah
                </Button>
            </div>

            {/* Karyawan Table */}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-16 text-center">Foto</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Jabatan</TableHead>
                        <TableHead>NIP</TableHead>
                        <TableHead>No. HP</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data?.data.map((karyawan) => (
                        <TableRow key={karyawan.id}>
                            <TableCell className="text-center">
                                <Avatar
                                    src={karyawan.foto?.thumb}
                                    alt={karyawan.nama}
                                    size="sm"
                                    className="mx-auto"
                                    fallback={<User className="w-4 h-4 text-default-500" />}
                                />
                            </TableCell>
                            <TableCell>
                                <span className="font-bold text-foreground">{karyawan.nama}</span>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm font-medium text-muted-foreground">{karyawan.jabatan}</span>
                            </TableCell>
                            <TableCell>
                                <span className="text-xs font-mono text-muted-foreground">{karyawan.nip || '-'}</span>
                            </TableCell>
                            <TableCell>
                                <span className="text-xs text-muted-foreground">{karyawan.no_hp || '-'}</span>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleEdit(karyawan)}
                                        className="text-muted-foreground hover:text-primary"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDelete(karyawan.id)}
                                        className="text-muted-foreground hover:text-danger"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-danger" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}

                    {data?.data.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                                Belum ada data karyawan
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

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
                        className="w-full px-4 py-3 rounded-xl border border-default-200 bg-default-100 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Maks. 10MB (JPG, PNG)</p>
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
