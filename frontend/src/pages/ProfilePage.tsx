import React, { useState } from 'react';
import {
    User,
    Mail,
    Phone,
    Fingerprint,
    Lock,
    Camera,
    Save,
    AlertCircle,
    CheckCircle2,
    ShieldCheck
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import {
    Button,
    Card,
    Input,
    Spinner,
} from '../components/ui';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Form States
    const [nip, setNip] = useState(user?.karyawan?.nip || '');
    const [noHp, setNoHp] = useState(user?.karyawan?.no_hp || '');
    const [foto, setFoto] = useState<File | null>(null);
    const [fotoPreview, setFotoPreview] = useState<string | null>(user?.karyawan?.foto?.url || null);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI States
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Update Profile Mutation (Karyawan data)
    const updateProfileMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            if (!user?.karyawan?.id) throw new Error("Profil karyawan tidak ditemukan");
            return api.put(`/karyawans/${user.karyawan.id}`, formData);
        },
        onSuccess: () => {
            setSuccessMessage("Profil berhasil diperbarui!");
            setErrorMessage(null);
            queryClient.invalidateQueries({ queryKey: ['me'] });
            // The AuthContext fetches from /me, so invalidating query client 
            // will refresh it if any other component uses it, 
            // but we might need to manually refresh or wait for reload.
            setTimeout(() => setSuccessMessage(null), 3000);
        },
        onError: (error: any) => {
            setErrorMessage(error.message || "Gagal memperbarui profil");
            setSuccessMessage(null);
            setTimeout(() => setErrorMessage(null), 3000);
        }
    });

    // Update Password Mutation
    const updatePasswordMutation = useMutation({
        mutationFn: async (data: any) => {
            return api.put(`/users/${user?.id}`, data);
        },
        onSuccess: () => {
            setSuccessMessage("Kata sandi berhasil diubah!");
            setErrorMessage(null);
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setSuccessMessage(null), 3000);
        },
        onError: (error: any) => {
            setErrorMessage(error.message || "Gagal mengubah kata sandi");
            setSuccessMessage(null);
            setTimeout(() => setErrorMessage(null), 3000);
        }
    });

    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = () => {
        const formData = new FormData();
        formData.append('nip', nip);
        formData.append('no_hp', noHp);
        formData.append('nama', user?.karyawan?.nama || user?.name || '');
        formData.append('jabatan', user?.karyawan?.jabatan || '');
        if (foto) {
            formData.append('foto', foto);
        }
        updateProfileMutation.mutate(formData);
    };

    const handleSavePassword = () => {
        if (!newPassword) {
            setErrorMessage("Kata sandi baru tidak boleh kosong");
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrorMessage("Konfirmasi kata sandi tidak cocok");
            return;
        }
        if (newPassword.length < 8) {
            setErrorMessage("Kata sandi baru minimal 8 karakter");
            return;
        }
        updatePasswordMutation.mutate({
            name: user?.name, // Maintain name
            email: user?.email, // Maintain email
            password: newPassword,
            role: user?.roles?.[0]?.name || 'karyawan',
            karyawan_id: user?.karyawan?.id
        });
    };

    if (!user) return (
        <div className="flex items-center justify-center p-20">
            <Spinner size="lg" />
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
            {/* Header */}
            <div className="px-1">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-1 bg-primary rounded-full" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Pengaturan Akun</span>
                </div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">Profil Pengguna</h2>
                <p className="text-muted-foreground text-sm font-medium">Kelola informasi pribadi dan keamanan akun Anda.</p>
            </div>

            {/* Notifications */}
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] w-[calc(100%-2.5rem)] max-w-sm pointer-events-none space-y-2">
                {successMessage && (
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-success/30 text-success p-4 rounded-3xl flex items-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.1)] pointer-events-auto animate-in slide-in-from-top-4 duration-300">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        <p className="text-xs font-bold uppercase tracking-tight">{successMessage}</p>
                    </div>
                )}
                {errorMessage && (
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-danger/30 text-danger p-4 rounded-3xl flex items-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.1)] pointer-events-auto animate-in slide-in-from-top-4 duration-300">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-xs font-bold uppercase tracking-tight">{errorMessage}</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                {/* Profile Picture Bento Card */}
                <Card className="md:col-span-2 overflow-hidden border-none shadow-sm shadow-black/5 bg-card rounded-[2.5rem]">
                    <div className="relative flex flex-col items-center justify-center p-8 bg-gradient-to-b from-primary/5 to-transparent h-full">
                        <div className="group relative">
                            <div className="w-40 h-40 rounded-[3.5rem] overflow-hidden ring-8 ring-background shadow-2xl transition-transform group-hover:scale-105 duration-500">
                                <img
                                    src={fotoPreview || "/logo.png"}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <label className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary text-white rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-90 transition-all border-4 border-background">
                                <Camera className="w-6 h-6" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleFotoChange} />
                            </label>
                        </div>
                        <div className="mt-8 text-center">
                            <h3 className="text-xl font-black text-foreground leading-tight">{user.name}</h3>
                            <p className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest mt-2 inline-block">
                                {user.roles?.[0]?.name || 'Pegawai'}
                            </p>
                        </div>
                        <div className="mt-8 w-full">
                            <Button
                                onClick={handleSaveProfile}
                                isLoading={updateProfileMutation.isPending}
                                className="w-full rounded-2xl h-12 font-black gap-2 text-xs uppercase tracking-widest shadow-lg shadow-primary/10"
                            >
                                <Save className="w-4 h-4" />
                                UPDATE FOTO
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Personal Information Bento Card */}
                <Card className="md:col-span-4 border-none shadow-sm shadow-black/5 bg-card rounded-[2.5rem] p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 rounded-2xl bg-sky-50 text-primary shadow-inner">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-foreground tracking-tight">Data Personal</h3>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-wider">Identitas Resmi Pegawai</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nomor Induk Pegawai (NIP)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-primary/50">
                                    <Fingerprint className="w-4 h-4" />
                                </div>
                                <Input
                                    placeholder="19XXXXXXXXXXXXX"
                                    value={nip}
                                    onChange={(e) => setNip(e.target.value)}
                                    className="bg-background/50 border-none rounded-2xl h-12 shadow-inner pl-12"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nomor WhatsApp / HP</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-primary/50">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <Input
                                    placeholder="08XXXXXXXXXX"
                                    value={noHp}
                                    onChange={(e) => setNoHp(e.target.value)}
                                    className="bg-background/50 border-none rounded-2xl h-12 shadow-inner pl-12"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Email Unit Kerja</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/30">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div className="w-full bg-background/30 border-none rounded-2xl h-12 flex items-center pl-12 pr-4 text-sm font-medium text-muted-foreground/60 italic cursor-not-allowed">
                                    {user.email}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Jabatan Saat Ini</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/30">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <div className="w-full bg-background/30 border-none rounded-2xl h-12 flex items-center pl-12 pr-4 text-sm font-medium text-muted-foreground/60 italic cursor-not-allowed">
                                    {user.karyawan?.jabatan || '-'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex justify-end">
                        <Button
                            variant="primary"
                            onClick={handleSaveProfile}
                            isLoading={updateProfileMutation.isPending}
                            className="px-8 h-12 rounded-2xl font-black gap-3 shadow-lg shadow-primary/20 text-xs uppercase tracking-widest"
                        >
                            <Save className="w-5 h-5" />
                            SIMPAN INFORMASI
                        </Button>
                    </div>
                </Card>

                {/* Security Bento Card */}
                <Card className="md:col-span-6 border-none shadow-sm shadow-black/5 bg-card rounded-[2.5rem] p-8 mt-2 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 rounded-2xl bg-amber-50 text-amber-500 shadow-inner">
                                <Lock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-foreground tracking-tight">Keamanan Akun</h3>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-wider">Perbarui Kata Sandi Anda</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Kata Sandi Baru</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-amber-500/50">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="bg-background/50 border-none rounded-2xl h-12 shadow-inner pl-12"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Konfirmasi Kata Sandi</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-amber-500/50">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="bg-background/50 border-none rounded-2xl h-12 shadow-inner pl-12"
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={handleSavePassword}
                                isLoading={updatePasswordMutation.isPending}
                                className="w-full h-12 rounded-2xl font-black gap-3 bg-slate-900 border-none hover:bg-slate-800 text-xs uppercase tracking-widest"
                            >
                                <ShieldCheck className="w-5 h-5" />
                                UBAH PASSWORD
                            </Button>
                        </div>
                        <p className="mt-6 text-[10px] text-muted-foreground font-medium italic">
                            *Gunakan minimal 8 karakter dengan kombinasi huruf dan angka untuk keamanan maksimal.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ProfilePage;
