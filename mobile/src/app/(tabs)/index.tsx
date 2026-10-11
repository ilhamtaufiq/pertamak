import React, { useCallback } from 'react';
import Head from 'expo-router/head';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Image } from '../../tw';
import { useAuthStore } from '../../stores/authStore';
import { Stack, useRouter } from 'expo-router';
import { useKegiatan } from '../../hooks/useKegiatan';
import { KegiatanCard } from '../../components/features/KegiatanCard';
import { RefreshControl, StatusBar, StyleSheet } from 'react-native';
import { Plus, ListTodo, Map as MapIcon, FolderOpen, ArrowRight } from 'lucide-react-native';
import { TYPOGRAPHY, COLORS as T, RADIUS, SPACING } from '../../tokens';

const QUICK_ACTIONS = [
  { icon: ListTodo, label: 'Jurnal', route: '/(tabs)/kegiatan' },
  { icon: MapIcon, label: 'Peta', route: '/(tabs)/maps' },
  { icon: FolderOpen, label: 'Media', route: '/(tabs)/media' },
] as const;

export default function HomeTab() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { data: kegiatan, isLoading, refetch, isRefetching } = useKegiatan();

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const recentKegiatan = (kegiatan?.pages.flatMap(page => page.data) || []).slice(0, 5);
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const firstName = user?.name?.split(' ')[0] ?? '';

  return (
    <View style={styles.container}>
      <Head>
        <title>Beranda - Pertamak</title>
        <meta name="description" content="Beranda aplikasi Pertamak - monitoring kegiatan lapangan" />
      </Head>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={T.primary} />
        }
      >
        {/* Greeting */}
        <View style={styles.greetingRow}>
          <Image
            source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? 'User')}&background=0284C7&color=fff&bold=true&size=96` }}
            style={styles.avatar}
            accessibilityLabel="Foto profil"
          />
          <View style={styles.greetingText}>
            <Text style={styles.date}>{today}</Text>
            <Text style={styles.greeting} numberOfLines={1}>Halo, {firstName}</Text>
          </View>
        </View>

        {/* Primary action */}
        <TouchableOpacity
          onPress={() => router.push('/kegiatan/create')}
          style={styles.primaryAction}
          accessibilityRole="button"
          accessibilityLabel="Buat kegiatan baru"
        >
          <View style={styles.primaryIcon}>
            <Plus color="white" size={22} strokeWidth={2.5} />
          </View>
          <View style={styles.primaryText}>
            <Text style={styles.primaryTitle}>Buat kegiatan baru</Text>
            <Text style={styles.primaryHint}>Catat lokasi, uraian, dan foto dokumentasi</Text>
          </View>
          <ArrowRight color="white" size={20} />
        </TouchableOpacity>

        {/* Quick actions */}
        <View style={styles.quickRow}>
          {QUICK_ACTIONS.map(({ icon: Icon, label, route }) => (
            <TouchableOpacity
              key={label}
              onPress={() => router.push(route as any)}
              style={styles.quickItem}
              accessibilityRole="button"
              accessibilityLabel={label}
            >
              <View style={styles.quickIcon}>
                <Icon color={T.textSecondary} size={20} strokeWidth={2} />
              </View>
              <Text style={styles.quickLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kegiatan terakhir</Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/kegiatan')}
            style={styles.seeAll}
            accessibilityRole="button"
            accessibilityLabel="Lihat semua kegiatan"
          >
            <Text style={styles.seeAllText}>Lihat semua</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={T.primary} />
          </View>
        ) : recentKegiatan.length > 0 ? (
          recentKegiatan.map((item: any) => (
            <KegiatanCard
              key={item.id}
              item={item}
              onPress={(id) => router.push(`/kegiatan/${id}`)}
            />
          ))
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Belum ada kegiatan</Text>
            <Text style={styles.emptyHint}>Kegiatan yang Anda catat akan muncul di sini.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.darkBg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: SPACING.xl, paddingTop: 72, paddingBottom: 140 },

  greetingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xxl },
  avatar: { width: 48, height: 48, borderRadius: RADIUS.md, borderWidth: 1, borderColor: T.darkBorder },
  greetingText: { flex: 1, marginLeft: SPACING.md },
  date: { color: T.textSecondary, ...TYPOGRAPHY.caption },
  greeting: { color: T.text, ...TYPOGRAPHY.title, marginTop: 2 },

  primaryAction: {
    flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, borderRadius: RADIUS.lg,
    backgroundColor: T.primaryDeep, marginBottom: SPACING.xl,
  },
  primaryIcon: {
    width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md,
  },
  primaryText: { flex: 1 },
  primaryTitle: { color: 'white', ...TYPOGRAPHY.subheading },
  primaryHint: { color: 'rgba(255,255,255,0.8)', ...TYPOGRAPHY.caption, marginTop: 2 },

  quickRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xxxl },
  quickItem: {
    flex: 1, alignItems: 'center', marginHorizontal: 4, paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: T.darkBorder, backgroundColor: T.darkSurface,
    minHeight: 44,
  },
  quickIcon: { marginBottom: SPACING.sm },
  quickLabel: { color: T.text, ...TYPOGRAPHY.caption, fontWeight: '600' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  sectionTitle: { color: T.text, ...TYPOGRAPHY.heading },
  seeAll: { minHeight: 44, justifyContent: 'center' },
  seeAllText: { color: T.primary, ...TYPOGRAPHY.bodySecondary },

  loadingBox: { paddingVertical: 64, alignItems: 'center' },
  emptyBox: {
    paddingVertical: 40, paddingHorizontal: SPACING.xl, alignItems: 'center', borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: T.darkBorder, backgroundColor: T.darkSurface,
  },
  emptyTitle: { color: T.text, ...TYPOGRAPHY.bodySecondary },
  emptyHint: { color: T.textSecondary, ...TYPOGRAPHY.caption, marginTop: SPACING.xs, textAlign: 'center' },
});
