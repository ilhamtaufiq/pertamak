import React, { useCallback } from 'react';
import Head from 'expo-router/head';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Image } from '../../tw';
import { useAuthStore } from '../../stores/authStore';
import { Stack, useRouter } from 'expo-router';
import { useKegiatan } from '../../hooks/useKegiatan';
import { KegiatanCard } from '../../components/features/KegiatanCard';
import { Animated } from '../../tw/animated';
import { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { RefreshControl, StatusBar, StyleSheet } from 'react-native';
import { ListTodo, Map as MapIcon, Plus, FolderOpen, CalendarDays, ArrowRight } from 'lucide-react-native';
import { TYPOGRAPHY, BUTTON, COLORS as T, RADIUS, SPACING } from '../../tokens';

export default function HomeTab() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { data: kegiatan, isLoading, refetch } = useKegiatan();

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const recentKegiatan = (kegiatan?.pages.flatMap(page => page.data) || []).slice(0, 5);

  const FeatureItem = ({ icon: Icon, title, color, route }: { icon: any, title: string, color: string, route: string }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(route as any)}
      style={styles.featureItem}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.featureCard}>
        <Icon color={color} size={22} strokeWidth={2} />
        <Text style={styles.featureTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={T.primary} />
        }
      >
        {/* Header Area */}
        <View style={styles.headerArea}>
          <View style={styles.headerRow}>
            <Animated.View entering={FadeInDown.delay(100)} style={styles.userRow}>
              <View style={styles.avatarFrame}>
                <Image
                  source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? 'User')}&background=0EA5E9&color=fff&bold=true&size=128` }}
                  style={styles.avatarImage}
                />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.statusText}>{user?.role === 'admin' ? 'Administrator' : 'Karyawan'}</Text>
                <Text style={styles.greetingText}>Halo, {user?.name?.split(' ')[0]}</Text>
              </View>
            </Animated.View>

          </View>

          {/* Service Grid Section */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.featureSection}>
            <Text style={styles.sectionLabel}>Fitur utama</Text>
            <View style={styles.featureGrid}>
              <FeatureItem icon={Plus} title="Buat Kegiatan" color={T.primary} route="/kegiatan/create" />
              <FeatureItem icon={ListTodo} title="Jurnal" color={T.textSecondary} route="/(tabs)/kegiatan" />
              <FeatureItem icon={MapIcon} title="Peta" color={T.textSecondary} route="/(tabs)/maps" />
              <FeatureItem icon={FolderOpen} title="Media" color={T.textSecondary} route="/(tabs)/media" />
            </View>
          </Animated.View>

          {/* Recent Activities Section */}
          <Animated.View entering={FadeInUp.delay(400)} style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <View style={{ flex: 1, paddingRight: SPACING.md }}>
                <Text style={styles.recentTitle}>Kegiatan Terakhir</Text>
                <Text style={styles.recentSubtitle}>Pantau progres pengerjaan harian Anda</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/kegiatan')}
                style={styles.seeAllButton}
                accessibilityRole="button"
                accessibilityLabel="Lihat semua kegiatan"
              >
                <Text style={styles.seeAllText}>Semua</Text>
                <ArrowRight color={T.primary} size={14} />
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={T.primary} size="large" />
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
                <CalendarDays color={T.darkBorder} size={56} strokeWidth={1.25} />
                <Text style={styles.emptyText}>Belum ada kegiatan terbaru</Text>
                <Text style={styles.emptyHint}>Tekan Buat Kegiatan untuk mencatat yang pertama</Text>
              </View>
            )}
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.darkBg },
  scroll: { flex: 1 },
  headerArea: { paddingHorizontal: SPACING.xl, paddingTop: 64, paddingBottom: SPACING.xl },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xxxl },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatarFrame: {
    width: BUTTON.primary.height, height: BUTTON.primary.height, borderRadius: RADIUS.md, borderWidth: 1,
    borderColor: T.darkBorder, overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  userInfo: { marginLeft: SPACING.lg },
  statusText: { color: T.textSecondary, ...TYPOGRAPHY.badge, marginBottom: 2 },
  greetingText: { color: T.text, ...TYPOGRAPHY.heading },
  featureSection: { marginBottom: SPACING.xxxl },
  sectionLabel: { color: T.textSecondary, ...TYPOGRAPHY.sectionLabel, marginBottom: SPACING.md },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: SPACING.md },
  featureItem: { width: '48%' },
  featureCard: {
    padding: SPACING.lg, minHeight: 88, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: T.darkBorder,
    backgroundColor: T.darkSurface, justifyContent: 'space-between',
  },
  featureTitle: { color: T.text, ...TYPOGRAPHY.bodySecondary, marginTop: SPACING.md },
  recentSection: { flex: 1, paddingBottom: 120 },
  recentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
  recentTitle: { color: T.text, ...TYPOGRAPHY.heading },
  recentSubtitle: { color: T.textSecondary, ...TYPOGRAPHY.caption, marginTop: 2 },
  seeAllButton: {
    minHeight: 44, paddingHorizontal: SPACING.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  seeAllText: { color: T.primary, ...TYPOGRAPHY.bodySecondary, marginRight: SPACING.xs },
  loadingBox: { paddingVertical: 80, alignItems: 'center' },
  emptyBox: {
    paddingVertical: 56, paddingHorizontal: SPACING.xl, alignItems: 'center', backgroundColor: T.darkSurface,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: T.darkBorder,
  },
  emptyText: { color: T.text, marginTop: SPACING.lg, ...TYPOGRAPHY.bodySecondary },
  emptyHint: { color: T.textSecondary, marginTop: SPACING.xs, textAlign: 'center', ...TYPOGRAPHY.caption },
});
