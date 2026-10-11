import React from 'react';
import Head from 'expo-router/head';
import { View, Text, ScrollView, TouchableOpacity, Image } from '../../tw';
import { useAuthStore } from '../../stores/authStore';
import { LogOut, User, Shield, Info, ChevronRight, RefreshCw, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Alert, StatusBar, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { APP_VERSION } from '../../config';
import * as Updates from 'expo-updates';
import { TYPOGRAPHY, COLORS as T, RADIUS, SPACING } from '../../tokens';

export default function ProfileTab() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isCheckingUpdate, setIsCheckingUpdate] = React.useState(false);
  const roleLabel = user?.role === 'admin' ? 'Administrator' : 'Karyawan';

  const handleLogout = () => {
    Alert.alert('Keluar dari akun?', 'Anda perlu masuk lagi untuk membuka aplikasi.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await clearAuth();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleCheckUpdate = async () => {
    try {
      setIsCheckingUpdate(true);
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        Alert.alert('Pembaruan siap', 'Muat ulang aplikasi untuk memakai versi terbaru.', [
          { text: 'Muat ulang', onPress: () => Updates.reloadAsync() },
        ]);
      } else {
        Alert.alert('Sudah versi terbaru', 'Tidak ada pembaruan baru saat ini.');
      }
    } catch (e: any) {
      Alert.alert(
        'Gagal memeriksa pembaruan',
        'Periksa koneksi internet Anda. Di Expo Go, pemeriksaan pembaruan tidak tersedia.\n\n' + e.message
      );
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  return (
    <View style={styles.container}>
      <Head>
        <title>Profil - Pertamak</title>
      </Head>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16) + SPACING.xl, paddingBottom: insets.bottom + 120 }]}
      >
        {/* Identity */}
        <View style={styles.identity}>
          <Image
            source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? 'User')}&background=0284C7&color=fff&bold=true&size=128` }}
            style={styles.avatar}
            accessibilityLabel="Foto profil"
          />
          <View style={styles.identityText}>
            <Text style={styles.name} numberOfLines={1}>{user?.name ?? '-'}</Text>
            <Text style={styles.role}>{roleLabel}</Text>
          </View>
        </View>

        <Group title="Akun">
          <Row icon={User} label="Nama lengkap" value={user?.name ?? '-'} />
          <Row icon={Shield} label="Peran" value={roleLabel} />
        </Group>

        <Group title="Aplikasi">
          <Row
            icon={RefreshCw}
            label="Periksa pembaruan"
            value="Ambil perbaikan terbaru dari server"
            onPress={handleCheckUpdate}
            loading={isCheckingUpdate}
          />
          <Row icon={Heart} label="Bantuan" value="Hubungi admin kantor Anda" />
          <Row icon={Info} label="Versi" value={`Pertamak ${APP_VERSION}`} last />
        </Group>

        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logout}
          accessibilityRole="button"
          accessibilityLabel="Keluar dari akun"
        >
          <LogOut color={T.rose} size={18} />
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.groupCard}>{children}</View>
    </View>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  onPress,
  loading = false,
  last = false,
}: {
  icon: any;
  label: string;
  value: string;
  onPress?: () => void;
  loading?: boolean;
  last?: boolean;
}) {
  const interactive = !!onPress;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!interactive || loading}
      activeOpacity={interactive ? 0.7 : 1}
      accessibilityRole={interactive ? 'button' : undefined}
      accessibilityLabel={`${label}: ${value}`}
      style={[styles.row, !last && styles.rowBorder]}
    >
      <Icon color={T.textSecondary} size={18} style={{ marginRight: SPACING.md }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
      {loading ? (
        <ActivityIndicator color={T.primary} />
      ) : interactive ? (
        <ChevronRight color={T.textTertiary} size={18} />
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.darkBg },
  content: { paddingHorizontal: SPACING.xl },

  identity: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xxxl },
  avatar: { width: 64, height: 64, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: T.darkBorder },
  identityText: { flex: 1, marginLeft: SPACING.lg },
  name: { color: T.text, ...TYPOGRAPHY.heading },
  role: { color: T.textSecondary, ...TYPOGRAPHY.caption, marginTop: 2 },

  group: { marginBottom: SPACING.xxl },
  groupTitle: { color: T.textSecondary, ...TYPOGRAPHY.sectionLabel, marginBottom: SPACING.sm, marginLeft: SPACING.xs },
  groupCard: {
    backgroundColor: T.darkSurface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: T.darkBorder, overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 60, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: T.darkBorder },
  rowLabel: { color: T.textSecondary, ...TYPOGRAPHY.caption },
  rowValue: { color: T.text, ...TYPOGRAPHY.bodySecondary, marginTop: 2 },

  logout: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    height: 52, borderRadius: RADIUS.md, borderWidth: 1, borderColor: T.darkBorder, marginTop: SPACING.sm,
  },
  logoutText: { color: T.rose, ...TYPOGRAPHY.bodySecondary },
});
