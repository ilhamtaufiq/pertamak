import React, { useState, useEffect } from 'react';
import Head from 'expo-router/head';
import { KeyboardAvoidingView, Platform, StatusBar, StyleSheet } from 'react-native';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, LinearGradient, BlurView } from '../../tw';
import { Animated } from '../../tw/animated';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'expo-router';
import { Mail, Lock, LogIn, ShieldAlert, ArrowRight, Eye, EyeOff } from 'lucide-react-native';
import { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { APP_CONFIG } from '../../config';
import { z } from 'zod';
import logger from '../../lib/logger';
import { TYPOGRAPHY, BUTTON, COLORS as T, RADIUS, SHADOWS, SPACING } from '../../tokens';

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { setAuth } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    // Validate input with Zod
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const messages = result.error.issues.map(e => e.message).join(', ');
      setError(messages);
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
      logger.error(e, 'Login error');
      setError('Koneksi gagal. Pastikan jaringan internet atau backend aktif.');
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Head>
        <title>Masuk - Pertamak</title>
        <meta name="description" content="Halaman masuk aplikasi Pertamak untuk pelaporan kegiatan lapangan" />
      </Head>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[T.darkBg, T.darkSurface, T.primarySolid]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex1}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand/Logo Section */}
          <Animated.View
            entering={FadeInDown.duration(1000).springify()}
            style={styles.brandSection}
          >
            <View style={styles.logoBox}>
              <LogIn color={T.primary} size={56} strokeWidth={1.5} />
            </View>
            <Text style={styles.brandTitle}>Pertamak</Text>
          </Animated.View>

          {/* Glassmorphic Login Card */}
          <Animated.View entering={FadeInUp.delay(200).duration(1000).springify()}>
            <BlurView intensity={20} tint="dark" style={styles.loginCard}>
              <View style={styles.loginCardInner}>
                <View style={styles.welcomeSection}>
                  <Text style={styles.welcomeTitle}>Selamat Datang</Text>
                  <Text style={styles.welcomeSubtitle}>Silakan masuk untuk melanjutkan</Text>
                </View>

                {error ? (
                  <Animated.View entering={FadeInDown} style={styles.errorBox}>
                    <ShieldAlert color="#F87171" size={20} style={{ marginRight: 12 }} />
                    <Text style={styles.errorText}>{error}</Text>
                  </Animated.View>
                ) : null}

                {/* Email Input */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Nama Pengguna (Email)</Text>
                  <View style={styles.inputRow}>
                    <Mail color="#64748B" size={20} style={{ marginRight: 16 }} />
                    <TextInput
                      placeholder="admin@pertamak.com"
                      placeholderTextColor="#475569"
                      style={styles.textInput}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.fieldGroupLast}>
                  <Text style={styles.fieldLabel}>Sandi Rahasia (Password)</Text>
                  <View style={styles.inputRow}>
                    <Lock color="#64748B" size={20} style={{ marginRight: 16 }} />
                    <TextInput
                      placeholder="••••••••"
                      placeholderTextColor="#475569"
                      secureTextEntry={!showPassword}
                      style={styles.textInput}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                      {showPassword ? (
                        <EyeOff color="#64748B" size={20} />
                      ) : (
                        <Eye color="#64748B" size={20} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.9}
                  style={styles.loginBtnWrapper}
                >
                  <LinearGradient
                    colors={[T.primary, T.primarySolid]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.loginBtn}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Text style={styles.loginBtnText}>Masuk Sesi</Text>
                        <ArrowRight color="white" size={20} strokeWidth={3} />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.forgotBtn}>
                  <Text style={styles.forgotText}>Lupa sandi Anda?</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </Animated.View>

              <Animated.View entering={FadeInUp.delay(400)} style={styles.footerSection}>
            <View style={styles.footerLine} />
            <Text style={styles.footerText}>Pertamak v1.0.0</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.darkBg },
  flex1: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: SPACING.xxl, paddingVertical: 48 },
  brandSection: { alignItems: 'center', marginBottom: 48 },
  logoBox: {
    backgroundColor: 'rgba(14, 165, 233, 0.2)', padding: SPACING.xxl, borderRadius: RADIUS.xxl,
    marginBottom: SPACING.xxl, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)',
    ...SHADOWS.glow(T.primarySolid),
  },
  brandTitle: { color: 'white', ...TYPOGRAPHY.display, marginBottom: 8 },
  brandBadge: {
    backgroundColor: 'rgba(14, 165, 233, 0.2)', paddingHorizontal: SPACING.lg, paddingVertical: 6,
    borderRadius: RADIUS.xl, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  brandBadgeText: { color: '#7DD3FC', fontWeight: '700', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase' },
  loginCard: { borderRadius: RADIUS.xxl, overflow: 'hidden', borderWidth: 1, borderColor: T.darkBorder },
  loginCardInner: { padding: RADIUS.xl, backgroundColor: T.darkCard },
  welcomeSection: { marginBottom: RADIUS.xl },
  welcomeTitle: { color: 'white', fontSize: 30, fontWeight: '700', marginBottom: 8 },
  welcomeSubtitle: { color: '#94A3B8', ...TYPOGRAPHY.bodySecondary },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)', flexDirection: 'row', alignItems: 'center',
    padding: RADIUS.md, borderRadius: RADIUS.md, marginBottom: SPACING.xxl, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
  },
  errorText: { color: '#FCA5A5', flex: 1, ...TYPOGRAPHY.caption },
  fieldGroup: { marginBottom: SPACING.xl },
  fieldGroupLast: { marginBottom: RADIUS.xxl },
  fieldLabel: { color: '#94A3B8', ...TYPOGRAPHY.label, marginBottom: SPACING.md, marginLeft: 4 },
  inputRow: {
    backgroundColor: 'rgba(15,23,42,0.5)', flexDirection: 'row', alignItems: 'center',
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', height: BUTTON.primary.height, paddingHorizontal: SPACING.xl,
  },
  textInput: { flex: 1, color: 'white', ...TYPOGRAPHY.body },
  loginBtnWrapper: { marginBottom: SPACING.xxl },
  loginBtn: {
    ...BUTTON.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
    ...SHADOWS.glow(T.primarySolid),
  },
  loginBtnText: { color: 'white', ...TYPOGRAPHY.subheading, marginRight: 8 },
  forgotBtn: { alignItems: 'center', paddingVertical: 8 },
  forgotText: { color: T.textInactive, ...TYPOGRAPHY.caption, fontWeight: '600' },
  footerSection: { alignItems: 'center', marginTop: 48 },
  footerLine: { height: 1, width: 48, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: SPACING.lg },
  footerText: { color: T.textTertiary, fontWeight: '700', fontSize: 10, letterSpacing: 4, textTransform: 'uppercase' },
});
