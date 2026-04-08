import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, LinearGradient, BlurView } from '../../tw';
import { Animated } from '../../tw/animated';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'expo-router';
import { Mail, Lock, LogIn, ShieldAlert, ArrowRight } from 'lucide-react-native';
import { useSharedValue, useAnimatedStyle, withSpring, withDelay, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { APP_CONFIG } from '../../config';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { setAuth } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Masukkan email dan password Anda.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${APP_CONFIG.API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          device_name: `${Platform.OS}_${Platform.Version}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Kredensial yang diberikan salah.');
        setIsLoading(false);
        return;
      }

      // Map roles from Spatie (backend) to authStore role
      const roles = data.user?.roles?.map((r: any) => r.name) || [];
      const userRole = roles.includes('admin') ? 'admin' : 'karyawan';

      await setAuth({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: userRole,
      }, data.token);

      router.replace('/(tabs)');
    } catch (e) {
      console.error('Login error:', e);
      setError('Koneksi gagal. Pastikan jaringan internet atau backend aktif.');
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#020617', '#0F172A', '#0EA5E9']}
        className="absolute inset-0"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-12"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand/Logo Section */}
          <Animated.View
            entering={FadeInDown.duration(1000).springify()}
            className="items-center mb-12"
          >
            <View className="bg-sky-500/20 p-6 rounded-[40px] mb-6 border border-sky-400/30 shadow-2xl shadow-sky-500/20">
              <LogIn color="#38BDF8" size={56} strokeWidth={1.5} />
            </View>
            <Text className="text-white text-5xl font-black tracking-tighter mb-2">
              Pertamak
            </Text>
            <View className="bg-sky-500/20 px-4 py-1.5 rounded-full border border-sky-400/20">
              <Text className="text-sky-300 font-bold text-xs uppercase tracking-[3px]">
                Mobile Hub
              </Text>
            </View>
          </Animated.View>

          {/* Glassmorphic Login Card */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(1000).springify()}
          >
            <BlurView intensity={20} tint="dark" className="rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
              <View className="p-8 bg-white/5">
                <View className="mb-8">
                  <Text className="text-white text-3xl font-bold mb-2">Selamat Datang</Text>
                  <Text className="text-slate-400 text-base">Silakan masuk untuk melanjutkan</Text>
                </View>

                {error ? (
                  <Animated.View
                    entering={FadeInDown}
                    className="bg-red-500/10 flex-row items-center p-4 rounded-2xl mb-6 border border-red-500/20"
                  >
                    <ShieldAlert color="#F87171" size={20} className="mr-3" />
                    <Text className="text-red-300 flex-1 text-sm font-medium">{error}</Text>
                  </Animated.View>
                ) : null}

                {/* Email Input */}
                <View className="mb-5">
                  <Text className="text-slate-400 text-xs uppercase font-black tracking-widest mb-3 ml-1">Nama Pengguna (Email)</Text>
                  <View className="bg-slate-900/50 flex-row items-center rounded-2xl border border-white/5 h-16 px-5 focus:border-sky-500/50">
                    <Mail color="#64748B" size={20} className="mr-4" />
                    <TextInput
                      placeholder="admin@pertamak.com"
                      placeholderTextColor="#475569"
                      className="flex-1 text-white text-lg"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View className="mb-10">
                  <Text className="text-slate-400 text-xs uppercase font-black tracking-widest mb-3 ml-1">Sandi Rahasia (Password)</Text>
                  <View className="bg-slate-900/50 flex-row items-center rounded-2xl border border-white/5 h-16 px-5 focus:border-sky-500/50">
                    <Lock color="#64748B" size={20} className="mr-4" />
                    <TextInput
                      placeholder="••••••••"
                      placeholderTextColor="#475569"
                      secureTextEntry
                      className="flex-1 text-white text-lg"
                      value={password}
                      onChangeText={setPassword}
                    />
                  </View>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.9}
                  className="mb-6"
                >
                  <LinearGradient
                    colors={['#38BDF8', '#0EA5E9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="h-16 rounded-2xl items-center justify-center shadow-xl shadow-sky-500/40 flex-row"
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Text className="text-white text-xl font-black mr-2">Masuk Sesi</Text>
                        <ArrowRight color="white" size={20} strokeWidth={3} />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity className="items-center py-2">
                  <Text className="text-slate-700 text-sm font-semibold">Lupa sandi Anda?</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(400)}
            className="items-center mt-12"
          >
            <View className="h-px w-12 bg-white/10 mb-4" />
            <Text className="text-slate-600 font-bold text-[10px] uppercase tracking-[4px]">
              Pertamak v1.0.0 (Enterprise)
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
