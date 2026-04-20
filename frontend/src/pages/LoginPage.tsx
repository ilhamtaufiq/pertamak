import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await api.post<{ token: string; user: any }>('/login', { email, password });
            login(res.token, res.user);
        } catch (err: any) {
            setError(err.message || 'Email atau password salah. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-background px-4">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[100px]" />
                <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px]" />
            </div>

            <div className="w-full max-w-sm z-10 space-y-8">
                {/* Logo & Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-lg mb-4 animate-in fade-in zoom-in duration-500 overflow-hidden p-2">
                        <img src="/logo.png" alt="Cianjur Kab Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Selamat Datang
                    </h1>
                    <p className="text-sm text-muted-foreground italic">
                        Layanan Administrasi UPTD Pertamanan dan Pemakaman Disperkim Cianjur
                    </p>
                </div>

                <Card className="p-6 border-border/50 shadow-xl bg-card/80 backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="admin@pertamak.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <div className="space-y-1">
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <div className="flex justify-end">
                                <button type="button" className="text-xs text-primary font-medium hover:underline">
                                    Lupa Password?
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs text-center animate-shake">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold"
                            isLoading={isLoading}
                        >
                            <LogIn className="w-5 h-5 mr-2" />
                            Masuk
                        </Button>
                    </form>
                </Card>

                {/* Footer Info */}
                <p className="text-center text-xs text-muted-foreground">
                    Build with ❤️ for Pertamak Hub
                </p>
            </div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.2s ease-in-out 0s 2;
                }
            `}</style>
        </div>
    );
};

export default LoginPage;
