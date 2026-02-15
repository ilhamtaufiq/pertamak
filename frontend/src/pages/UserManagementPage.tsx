import React, { useState, useMemo } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Mail,
    ShieldCheck,
    AlertCircle,
    Users,
    UserPlus,
    CheckCircle2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

// UI Components
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Spinner, Avatar, Input, Select } from '../components/ui';

interface Karyawan {
    id: string;
    nama: string;
    jabatan: string;
    foto?: {
        thumb: string;
        url: string;
    } | null;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'karyawan';
    roles?: Array<{ name: string }>;
    karyawan_id?: string;
    karyawan?: Karyawan;
    created_at: string;
}

interface UserFormData {
    id?: string;
    name: string;
    email: string;
    password?: string;
    role: 'admin' | 'karyawan';
    karyawan_id: string;
}

const UserManagementPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Form State
    const [formData, setFormData] = useState<UserFormData>({
        name: '',
        email: '',
        password: '',
        role: 'karyawan',
        karyawan_id: ''
    });

    // Queries
    const { data: userData, isLoading: isLoadingUsers } = useQuery<{ data: User[] }>({
        queryKey: ['users'],
        queryFn: async () => {
            return api.get<{ data: User[] }>('/users');
        }
    });

    const users = userData?.data || [];

    const { data: karyawanData } = useQuery<{ data: Karyawan[] }>({
        queryKey: ['karyawans'],
        queryFn: async () => {
            return api.get<{ data: Karyawan[] }>('/karyawans');
        }
    });

    const karyawans = karyawanData?.data || [];

    // Mutations
    const createUserMutation = useMutation({
        mutationFn: (newUser: UserFormData) => api.post('/users', newUser as unknown as Record<string, unknown>),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            handleCloseModal();
        }
    });

    const updateUserMutation = useMutation({
        mutationFn: (updatedUser: UserFormData) => api.put(`/users/${updatedUser.id}`, updatedUser as unknown as Record<string, unknown>),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            handleCloseModal();
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/users/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });

    // Filtered Users
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());

            const userRole = user.roles?.[0]?.name || user.role;
            const matchesRole = roleFilter === 'all' || userRole === roleFilter;

            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, roleFilter]);

    // Handlers
    const handleOpenModal = (user: User | null = null) => {
        if (user) {
            setEditingUser(user);
            const userRole = (user.roles?.[0]?.name as 'admin' | 'karyawan') || user.role;
            setFormData({
                id: user.id,
                name: user.name,
                email: user.email,
                role: userRole,
                karyawan_id: user.karyawan_id || ''
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'karyawan',
                karyawan_id: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            updateUserMutation.mutate(formData);
        } else {
            createUserMutation.mutate(formData);
        }
    };

    const handleDeleteUser = (id: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            deleteUserMutation.mutate(id);
        }
    };

    if (isLoadingUsers) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Spinner size="lg" color="primary" />
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest animate-pulse">Syncing user database...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Premium Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-1 bg-primary rounded-full" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Security & Access</span>
                    </div>
                    <h2 className="text-2xl font-black text-foreground tracking-tight">User Management</h2>
                    <p className="text-muted-foreground text-sm font-medium">Monitoring perizinan dan akses sistem untuk tim administrasi.</p>
                </div>
                <Button
                    onClick={() => handleOpenModal()}
                    variant="primary"
                    className="h-10 px-5 gap-2 text-[11px] font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus className="w-5 h-5" strokeWidth={3} />
                    TAMBAH USER
                </Button>
            </div>

            {/* Glassmorphism Filters & Search */}
            <section className="animate-in fade-in slide-in-from-top-2 duration-500 delay-75">
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-4 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Search className="w-4 h-4 text-primary opacity-50" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari nama atau email..."
                                className="w-full pl-11 pr-4 py-3 bg-background/50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm font-medium placeholder:text-muted-foreground/50 shadow-inner"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <Select
                                value={roleFilter}
                                onChange={(val) => setRoleFilter(val)}
                                options={[
                                    { value: 'all', label: 'SEMUA ROLE' },
                                    { value: 'admin', label: 'ADMINISTRATOR' },
                                    { value: 'karyawan', label: 'KARYAWAN' }
                                ]}
                                className="bg-background/50 border-none shadow-inner"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* User Grid (Bento Style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => {
                        const userRole = user.roles?.[0]?.name || user.role;
                        const isAdmin = userRole === 'admin';
                        return (
                            <div
                                key={user.id}
                                className="group bg-card border border-border/40 p-5 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 active:scale-[0.98] animate-in fade-in slide-in-from-bottom-2"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-2xl ${isAdmin ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'} shadow-inner`}>
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-foreground tracking-tight group-hover:text-primary transition-colors leading-none mb-1">
                                                {user.name}
                                            </span>
                                            <div className="flex items-center gap-1.5 opacity-60">
                                                <Mail className="w-3 h-3 text-muted-foreground" />
                                                <span className="text-[10px] font-bold text-muted-foreground truncate max-w-[140px]">{user.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleOpenModal(user)}
                                            className="p-2 rounded-xl bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                        >
                                            <Plus className="w-3.5 h-3.5 rotate-45" /> {/* Using Plus rotated as a subtle edit icon alternative or keeping standard icons if allowed */}
                                            <Edit2 className="w-3.5 h-3.5 hidden" />
                                            <span className="sr-only">Edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="p-2 rounded-xl bg-muted/50 text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black text-muted-foreground uppercase opacity-60 tracking-tighter">System Access</span>
                                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${isAdmin
                                            ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                            : 'bg-primary/10 text-primary border border-primary/20'
                                            }`}>
                                            {isAdmin ? 'Administrator' : 'Personnel'}
                                        </span>
                                    </div>

                                    <div className="pt-3 border-t border-border/40">
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                src={user.karyawan?.foto?.thumb}
                                                alt={user.name}
                                                size="sm"
                                                className="ring-2 ring-background shadow-sm"
                                                fallback={<CheckCircle2 className="w-4 h-4 text-muted-foreground/20" />}
                                            />
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[9px] font-black text-muted-foreground uppercase opacity-60 tracking-tighter leading-none mb-1">Linked Profile</span>
                                                {user.karyawan ? (
                                                    <span className="text-[11px] font-bold text-foreground truncate">{user.karyawan.nama}</span>
                                                ) : (
                                                    <span className="text-[11px] font-bold text-muted-foreground/40 italic">Not Linked</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 bg-card/50 border-2 border-dashed border-border/40 rounded-[3rem]">
                        <div className="p-5 rounded-full bg-muted/50 mb-4">
                            <UserPlus className="w-10 h-10 text-muted-foreground/20" />
                        </div>
                        <h4 className="text-sm font-black text-foreground uppercase tracking-widest">No matching users</h4>
                        <p className="text-xs text-muted-foreground mt-1">Coba sesuaikan filter pencarian Anda.</p>
                        {(searchTerm || roleFilter !== 'all') && (
                            <button
                                onClick={() => { setSearchTerm(''); setRoleFilter('all'); }}
                                className="mt-4 text-[10px] font-bold text-primary uppercase underline underline-offset-4"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Modal User Form */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="md">
                <ModalHeader onClose={handleCloseModal}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            {editingUser ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-foreground tracking-tight">{editingUser ? 'Edit User Credentials' : 'Create System Account'}</h2>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Access Control & Security Roles</p>
                        </div>
                    </div>
                </ModalHeader>
                <form onSubmit={handleSubmit}>
                    <ModalBody className="space-y-6">
                        <div className="space-y-4">
                            <Input
                                label="Full Name"
                                placeholder="John Doe"
                                required
                                className="bg-background/50"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="john@pertamak.com"
                                required
                                className="bg-background/50"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />

                            <div className="relative">
                                <Input
                                    label={editingUser ? "New Password (Optional)" : "Temporary Password"}
                                    type="password"
                                    placeholder="••••••••"
                                    required={!editingUser}
                                    className="bg-background/50"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                {!editingUser && (
                                    <div className="absolute top-[34px] right-3">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Access Role</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: 'karyawan' })}
                                        className={`flex flex-col items-center p-4 rounded-[1.5rem] border-2 transition-all active:scale-95 ${formData.role === 'karyawan' ? 'bg-primary/5 border-primary ring-4 ring-primary/10' : 'bg-background border-border hover:border-muted-foreground/30'}`}
                                    >
                                        <CheckCircle2 className={`w-5 h-5 mb-2 ${formData.role === 'karyawan' ? 'text-primary' : 'text-muted-foreground/30'}`} />
                                        <span className="font-black text-xs text-foreground uppercase tracking-tight">Karyawan</span>
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-50 tracking-tighter">Regular Access</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: 'admin' })}
                                        className={`flex flex-col items-center p-4 rounded-[1.5rem] border-2 transition-all active:scale-95 ${formData.role === 'admin' ? 'bg-amber-500/5 border-amber-400 ring-4 ring-amber-400/10' : 'bg-background border-border hover:border-muted-foreground/30'}`}
                                    >
                                        <AlertCircle className={`w-5 h-5 mb-2 ${formData.role === 'admin' ? 'text-amber-500' : 'text-muted-foreground/30'}`} />
                                        <span className="font-black text-xs text-foreground uppercase tracking-tight">Administrator</span>
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-50 tracking-tighter">Full System Access</span>
                                    </button>
                                </div>
                            </div>

                            <div className="pt-5 border-t border-border/40">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Link to Employee Profile</label>
                                        <span className="text-[9px] bg-muted text-muted-foreground font-black px-2 py-0.5 rounded-lg">OPTIONAL</span>
                                    </div>
                                    <Select
                                        value={formData.karyawan_id}
                                        onChange={(val) => setFormData({ ...formData, karyawan_id: val })}
                                        options={[
                                            { value: '', label: '- UNLINKED -' },
                                            ...karyawans.map((k) => ({ value: String(k.id), label: `${k.nama.toUpperCase()} (${k.jabatan.toUpperCase()})` }))
                                        ]}
                                        className="bg-background/50 border-none shadow-inner"
                                    />
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter className="bg-muted/30">
                        <Button variant="ghost" onClick={handleCloseModal} type="button" className="text-xs font-bold uppercase tracking-widest">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="px-8 h-11 text-xs font-black uppercase tracking-[0.15em] shadow-lg shadow-primary/20"
                            isLoading={createUserMutation.isPending || updateUserMutation.isPending}
                        >
                            {editingUser ? 'Save Changes' : 'Initialize Account'}
                        </Button>
                    </ModalFooter>
                </form>
            </Modal>
        </div>
    );
};

export default UserManagementPage;
