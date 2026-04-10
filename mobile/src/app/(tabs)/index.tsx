import React, { useCallback } from 'react';
import { View, Text, ActivityIndicator, ScrollView, LinearGradient, BlurView, TouchableOpacity, Image } from '../../tw';
import { useAuthStore } from '../../stores/authStore';
import { Stack, useRouter } from 'expo-router';
import { useKegiatan } from '../../hooks/useKegiatan';
import { KegiatanCard } from '../../components/features/KegiatanCard';
import { Animated } from '../../tw/animated';
import { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { RefreshControl, StatusBar, StyleSheet, Dimensions } from 'react-native';
import { ListTodo, Map as MapIcon, Bell, CalendarDays, ArrowRight } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#38BDF8',
  primarySolid: '#0EA5E9',
  darkBg: '#020617',
  darkSurface: '#0F172A',
  text: '#FFFFFF',
  textSecondary: '#64748B',
  textTertiary: '#475569',
  border: 'rgba(255,255,255,0.1)',
  borderSky: 'rgba(56, 189, 248, 0.15)',
};

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
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={[COLORS.darkBg, COLORS.darkSurface]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={COLORS.primary} />
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
              <FeatureItem icon={ListTodo} title="Kegiatan" color={COLORS.primary} route="/kegiatan/create" />
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
                <ArrowRight color={COLORS.primary} size={14} />
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={COLORS.primary} size="large" />
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
  container: { flex: 1, backgroundColor: COLORS.darkBg },
  scroll: { flex: 1 },
  headerArea: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatarFrame: {
    width: 56, height: 56, borderRadius: 16, borderWidth: 2,
    borderColor: 'rgba(56, 189, 248, 0.3)', overflow: 'hidden',
    shadowColor: COLORS.primarySolid, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
  },
  avatarImage: { width: '100%', height: '100%' },
  userInfo: { marginLeft: 16 },
  statusText: { color: '#94A3B8', fontWeight: '900', fontSize: 10, letterSpacing: 3, marginBottom: 4, textTransform: 'uppercase' },
  greetingText: { color: 'white', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  bellButton: {
    backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  featureSection: { marginBottom: 40 },
  sectionLabel: { color: COLORS.primary, fontWeight: '900', fontSize: 10, letterSpacing: 4, marginBottom: 24, paddingLeft: 4 },
  featureGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  featureItem: { width: '47%' },
  featureCard: {
    padding: 24, borderRadius: 32, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: 'rgba(255,255,255,0.03)', alignItems: 'center',
  },
  featureIconBox: {
    padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12,
    shadowColor: COLORS.primary, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
  },
  featureTitle: { color: 'white', fontWeight: '900', fontSize: 14, letterSpacing: -0.5, textTransform: 'uppercase' },
  recentSection: { flex: 1, paddingBottom: 120 },
  recentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingHorizontal: 4 },
  recentTitle: { color: 'white', fontWeight: '900', fontSize: 24, letterSpacing: -0.5 },
  recentSubtitle: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700', marginTop: 2 },
  seeAllButton: {
    backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 12, flexDirection: 'row', alignItems: 'center',
  },
  seeAllText: { color: COLORS.primary, fontWeight: '700', fontSize: 12, marginRight: 8 },
  loadingBox: { paddingVertical: 80, alignItems: 'center' },
  emptyBox: {
    paddingVertical: 80, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 40, borderStyle: 'dashed', borderWidth: 1, borderColor: COLORS.border,
  },
  emptyText: { color: COLORS.textSecondary, marginTop: 16, fontWeight: '500' },
});
