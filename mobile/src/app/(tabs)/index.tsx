import React, { useCallback } from 'react';
import Head from 'expo-router/head';
import { View, Text, ActivityIndicator, ScrollView, LinearGradient, BlurView, TouchableOpacity, Image } from '../../tw';
import { useAuthStore } from '../../stores/authStore';
import { Stack, useRouter } from 'expo-router';
import { useKegiatan } from '../../hooks/useKegiatan';
import { KegiatanCard } from '../../components/features/KegiatanCard';
import { Animated } from '../../tw/animated';
import { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { RefreshControl, StatusBar, StyleSheet, Dimensions } from 'react-native';
import { ListTodo, Map as MapIcon, Bell, CalendarDays, ArrowRight } from 'lucide-react-native';
import { TYPOGRAPHY, BUTTON, COLORS as T, RADIUS, SHADOWS, SPACING } from '../../tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
    >
      <BlurView intensity={10} tint="dark" style={styles.featureCard}>
        <View style={[styles.featureIconBox, { backgroundColor: `${color}20`, borderColor: `${color}30` }]}>
          <Icon color={color} size={28} strokeWidth={2} />
        </View>
        <Text style={styles.featureTitle}>{title}</Text>
      </BlurView>
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

      <LinearGradient
        colors={[T.darkBg, T.darkSurface]}
        style={StyleSheet.absoluteFill}
      />

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
                  source={{ uri: `https://ui-avatars.com/api/?name=${user?.name}&background=0EA5E9&color=fff&bold=true&size=128` }}
                  style={styles.avatarImage}
                />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.statusText}>STATUS: ONLINE</Text>
                <Text style={styles.greetingText}>Halo, {user?.name?.split(' ')[0]} 👋</Text>
              </View>
            </Animated.View>

            <TouchableOpacity style={styles.bellButton}>
              <Bell color="white" size={24} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          {/* Service Grid Section */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.featureSection}>
            <Text style={styles.sectionLabel}>FITUR UTAMA</Text>
            <View style={styles.featureGrid}>
              <FeatureItem icon={ListTodo} title="Kegiatan" color={T.primary} route="/kegiatan/create" />
              <FeatureItem icon={MapIcon} title="Peta" color="#F472B6" route="/(tabs)/maps" />
            </View>
          </Animated.View>

          {/* Recent Activities Section */}
          <Animated.View entering={FadeInUp.delay(400)} style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <View>
                <Text style={styles.recentTitle}>Kegiatan Terakhir</Text>
                <Text style={styles.recentSubtitle}>Pantau progres pengerjaan harian Anda</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/kegiatan')}
                style={styles.seeAllButton}
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
                <CalendarDays color="#1E293B" size={64} strokeWidth={1} />
                <Text style={styles.emptyText}>Belum ada kegiatan terbaru</Text>
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
    width: BUTTON.primary.height, height: BUTTON.primary.height, borderRadius: RADIUS.md, borderWidth: 2,
    borderColor: 'rgba(56, 189, 248, 0.3)', overflow: 'hidden',
    ...SHADOWS.glow(T.primarySolid),
  },
  avatarImage: { width: '100%', height: '100%' },
  userInfo: { marginLeft: SPACING.lg },
  statusText: { color: T.textSecondary, ...TYPOGRAPHY.badge, marginBottom: 4 },
  greetingText: { color: 'white', ...TYPOGRAPHY.heading },
  bellButton: {
    backgroundColor: 'rgba(255,255,255,0.05)', padding: SPACING.md, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: T.darkBorder,
  },
  featureSection: { marginBottom: SPACING.xxxl },
  sectionLabel: { color: T.primary, ...TYPOGRAPHY.label, letterSpacing: 4, marginBottom: SPACING.xl, paddingLeft: 4 },
  featureGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  featureItem: { width: '47%' },
  featureCard: {
    padding: SPACING.xl, borderRadius: RADIUS.xxl, borderWidth: 1, borderColor: T.darkBorder,
    backgroundColor: T.darkCard, alignItems: 'center',
  },
  featureIconBox: {
    padding: SPACING.lg, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  featureTitle: { color: 'white', ...TYPOGRAPHY.caption, textTransform: 'uppercase' },
  recentSection: { flex: 1, paddingBottom: 120 },
  recentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.xl, paddingHorizontal: 4 },
  recentTitle: { color: 'white', ...TYPOGRAPHY.heading },
  recentSubtitle: { color: T.textSecondary, ...TYPOGRAPHY.bodySecondary, fontWeight: '700', marginTop: 2 },
  seeAllButton: {
    backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm, flexDirection: 'row', alignItems: 'center',
  },
  seeAllText: { color: T.primary, ...TYPOGRAPHY.bodySecondary, marginRight: SPACING.xs },
  loadingBox: { paddingVertical: 80, alignItems: 'center' },
  emptyBox: {
    paddingVertical: 80, alignItems: 'center', backgroundColor: T.darkCard,
    borderRadius: RADIUS.xxxl, borderStyle: 'dashed', borderWidth: 1, borderColor: T.darkBorder,
  },
  emptyText: { color: T.textSecondary, marginTop: SPACING.lg, ...TYPOGRAPHY.caption },
});
