import React, { useState, useMemo } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Mail,
    ShieldCheck,
    Briefcase,
    AlertCircle,
    Users,
    UserPlus,
    CheckCircle2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

// UI Components
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Card, CardContent, Spinner, Chip, Avatar, Input, Select } from '../components/ui';

interface Karyawan {
    id: string;
    nama: string;
    jabatan: string;
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
                <p className="text-muted-foreground font-medium animate-pulse">Syncing user database...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-foreground">User Management</h2>
                    <p className="text-muted-foreground text-sm">Control access and roles for all administrators and employees.</p>
                </div>
                <Button
                    onClick={() => handleOpenModal()}
                    className="bg-[var(--color-primary)] hover:bg-sky-500 shadow-lg shadow-sky-200/50 flex items-center gap-2 h-11 px-6 rounded-xl"
                >
                    <Plus className="w-5 h-5" />
                    Add New User
                </Button>
            </div>

            {/* Filters & Search */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-foreground placeholder:text-muted-foreground"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 h-full">
                    <Select
                        value={roleFilter}
                        onChange={(val) => setRoleFilter(val)}
                        options={[
                            { value: 'all', label: 'All Roles' },
                            { value: 'admin', label: 'Administrators' },
                            { value: 'karyawan', label: 'Employees' }
                        ]}
                    />
                </div>
            </div>

            {/* User Grid */}
            {filteredUsers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUsers.map((user) => {
                        const userRole = user.roles?.[0]?.name || user.role;
                        return (
                            <Card key={user.id} className="group hover:border-primary/50 transition-colors shadow-sm active:scale-[0.98]">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                fallback={<Users className="w-5 h-5 text-muted-foreground" />}
                                                className="bg-muted ring-2 ring-card"
                                            />
                                            <div>
                                                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{user.name}</h3>
                                                <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                                    <Mail className="w-3 h-3" />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                        <Chip
                                            variant="flat"
                                            className={userRole === 'admin' ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-sky-600'}
                                        >
                                            {userRole === 'admin' ? 'ADMIN' : 'Karyawan'}
                                        </Chip>
                                    </div>

                                    <div className="space-y-3 py-3 border-y border-border">
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Briefcase className="w-3.5 h-3.5" />
                                                <span>Employee Profile</span>
                                            </div>
                                            {user.karyawan ? (
                                                <span className="font-semibold text-foreground">{user.karyawan.nama}</span>
                                            ) : (
                                                <span className="text-muted-foreground italic">Unlinked</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 mt-4">
                                        <Button
                                            isIconOnly
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleOpenModal(user)}
                                            className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            isIconOnly
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-muted rounded-3xl border-2 border-dashed border-border">
                    <UserPlus className="w-16 h-16 text-muted-foreground/30 mb-4" />
                    <h3 className="text-xl font-bold text-foreground">No users found</h3>
                    <p className="text-muted-foreground mb-6">Try adjusting your filters or search term.</p>
                    <Button variant="ghost" onClick={() => { setSearchTerm(''); setRoleFilter('all'); }}>
                        Clear All Filters
                    </Button>
                </div>
            )}

            {/* Modal User Form */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="md">
                <ModalHeader onClose={handleCloseModal}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            {editingUser ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">{editingUser ? 'Edit User Credentials' : 'Create System Account'}</h2>
                            <p className="text-xs text-muted-foreground">Provide access details and security roles.</p>
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
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="john@pertamak.com"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />

                            <div className="relative">
                                <Input
                                    label={editingUser ? "New Password (Leave blank to keep)" : "Temporary Password"}
                                    type="password"
                                    placeholder="••••••••"
                                    required={!editingUser}
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
                                <label className="text-sm font-bold text-foreground">Access Role</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: 'karyawan' })}
                                        className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${formData.role === 'karyawan' ? 'bg-primary/10 border-primary ring-2 ring-primary/20' : 'bg-card border-border hover:border-muted-foreground/30'}`}
                                    >
                                        <CheckCircle2 className={`w-5 h-5 mb-1 ${formData.role === 'karyawan' ? 'text-primary' : 'text-muted-foreground/30'}`} />
                                        <span className="font-bold text-sm text-foreground">Employee</span>
                                        <span className="text-[10px] text-muted-foreground">Regular Access</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: 'admin' })}
                                        className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${formData.role === 'admin' ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/20' : 'bg-card border-border hover:border-muted-foreground/30'}`}
                                    >
                                        <AlertCircle className={`w-5 h-5 mb-1 ${formData.role === 'admin' ? 'text-amber-500' : 'text-muted-foreground/30'}`} />
                                        <span className="font-bold text-sm text-foreground">Administrator</span>
                                        <span className="text-[10px] text-muted-foreground">Full System Access</span>
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-foreground">Link to Employee</label>
                                        <span className="text-[10px] bg-muted text-muted-foreground font-bold px-1.5 rounded">OPTIONAL</span>
                                    </div>
                                    <Select
                                        value={formData.karyawan_id}
                                        onChange={(val) => setFormData({ ...formData, karyawan_id: val })}
                                        options={[
                                            { value: '', label: '- Unlinked -' },
                                            ...karyawans.map((k) => ({ value: String(k.id), label: `${k.nama} (${k.jabatan})` }))
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter className="bg-muted/50">
                        <Button variant="ghost" onClick={handleCloseModal} type="button">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="px-8 bg-[var(--color-primary)] hover:bg-sky-500"
                            isLoading={createUserMutation.isPending || updateUserMutation.isPending}
                        >
                            {editingUser ? 'Update Account' : 'Initialize Account'}
                        </Button>
                    </ModalFooter>
                </form>
            </Modal>
        </div>
    );
};

export default UserManagementPage;
