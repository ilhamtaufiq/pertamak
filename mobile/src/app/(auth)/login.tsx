import React, { useState, useEffect } from 'react';
import Head from 'expo-router/head';
import { KeyboardAvoidingView, Platform, StatusBar, StyleSheet } from 'react-native';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image } from '../../tw';
import { Animated } from '../../tw/animated';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'expo-router';
import { Mail, Lock, ShieldAlert, ArrowRight, Eye, EyeOff } from 'lucide-react-native';
import { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { APP_CONFIG, APP_VERSION } from '../../config';
import { Alert } from 'react-native';
import { z } from 'zod';
import logger from '../../lib/logger';
import { TYPOGRAPHY, BUTTON, COLORS as T, RADIUS, SPACING } from '../../tokens';

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
        <title>Masuk - Pertamak Hub</title>
        <meta name="description" content="Halaman masuk Pertamak Hub untuk pelaporan kegiatan lapangan" />
      </Head>
      <StatusBar barStyle="light-content" />
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
            <Image
              source={require('../../../assets/logo-kabupaten-cianjur.png')}
              style={styles.brandLogo}
              accessibilityLabel="Logo Kabupaten Cianjur"
            />
            <Text style={styles.brandTitle}>Pertamak Hub</Text>
            <Text style={styles.brandSubtitle}>Kabupaten Cianjur</Text>
          </Animated.View>

          {/* Login Card */}
          <Animated.View entering={FadeInUp.delay(200).duration(1000).springify()}>
            <View style={styles.loginCard}>
              <View style={styles.loginCardInner}>
                <View style={styles.welcomeSection}>
                  <Text style={styles.welcomeTitle}>Selamat Datang</Text>
                  <Text style={styles.welcomeSubtitle}>Silakan masuk untuk melanjutkan</Text>
                </View>

                {error ? (
                  <Animated.View entering={FadeInDown} style={styles.errorBox}>
                    <ShieldAlert color="#FCA5A5" size={20} style={{ marginRight: 12 }} />
                    <Text style={styles.errorText}>{error}</Text>
                  </Animated.View>
                ) : null}

                {/* Email Input */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Nama Pengguna (Email)</Text>
                  <View style={styles.inputRow}>
                    <Mail color={T.textSecondary} size={20} style={{ marginRight: 12 }} />
                    <TextInput
                      placeholder="admin@pertamak.com"
                      placeholderTextColor={T.textTertiary}
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
                    <Lock color={T.textSecondary} size={20} style={{ marginRight: 12 }} />
                    <TextInput
                      placeholder="••••••••"
                      placeholderTextColor={T.textTertiary}
                      secureTextEntry={!showPassword}
                      style={styles.textInput}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeBtn}
                      accessibilityRole="button"
                      accessibilityLabel={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    >
                      {showPassword ? (
                        <EyeOff color={T.textSecondary} size={20} />
                      ) : (
                        <Eye color={T.textSecondary} size={20} />
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
                  <View style={styles.loginBtn}>
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Text style={styles.loginBtnText}>Masuk Sesi</Text>
                        <ArrowRight color="white" size={18} strokeWidth={2.5} style={{ marginLeft: 8 }} />
                      </>
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.forgotBtn}
                  accessibilityRole="button"
                  onPress={() => Alert.alert('Lupa Sandi', 'Sandi hanya bisa direset oleh admin. Hubungi admin kantor Anda.')}
                >
                  <Text style={styles.forgotText}>Lupa sandi Anda?</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400)} style={styles.footerSection}>
            <Text style={styles.footerText}>Pertamak Hub v{APP_VERSION}</Text>
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
  brandSection: { alignItems: 'center', marginBottom: 40 },
  brandTitle: { color: T.text, ...TYPOGRAPHY.display },
  brandLogo: { width: 96, height: 96, marginBottom: SPACING.md },
  brandSubtitle: { color: T.textSecondary, ...TYPOGRAPHY.caption, marginTop: 2 },
  loginCard: {
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: T.darkBorder, backgroundColor: T.darkSurface,
  },
  loginCardInner: { padding: SPACING.xl },
  welcomeSection: { marginBottom: SPACING.xl },
  welcomeTitle: { color: T.text, ...TYPOGRAPHY.title, fontSize: 24, lineHeight: 30, marginBottom: 4 },
  welcomeSubtitle: { color: T.textSecondary, ...TYPOGRAPHY.bodySecondary },
  errorBox: {
    backgroundColor: 'rgba(244,63,94,0.08)', flexDirection: 'row', alignItems: 'center',
    padding: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.xl, borderWidth: 1, borderColor: 'rgba(244,63,94,0.3)',
  },
  errorText: { color: '#FCA5A5', flex: 1, ...TYPOGRAPHY.caption },
  fieldGroup: { marginBottom: SPACING.lg },
  fieldGroupLast: { marginBottom: SPACING.xl },
  fieldLabel: { color: T.textSecondary, ...TYPOGRAPHY.label, marginBottom: SPACING.sm },
  inputRow: {
    backgroundColor: T.darkBg, flexDirection: 'row', alignItems: 'center',
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: T.darkBorder, height: BUTTON.primary.height, paddingLeft: SPACING.lg, paddingRight: SPACING.xs,
  },
  textInput: { flex: 1, color: T.text, ...TYPOGRAPHY.body },
  eyeBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  loginBtnWrapper: { marginBottom: SPACING.lg },
  loginBtn: {
    ...BUTTON.primary, backgroundColor: T.primaryDeep, alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
  },
  loginBtnText: { color: 'white', ...TYPOGRAPHY.subheading },
  forgotBtn: { alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  forgotText: { color: T.textSecondary, ...TYPOGRAPHY.caption, fontWeight: '600' },
  footerSection: { alignItems: 'center', marginTop: 40 },
  footerText: { color: T.textTertiary, ...TYPOGRAPHY.badge },
});
