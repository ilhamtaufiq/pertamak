import React from 'react';
import Head from 'expo-router/head';
import { View, Text, ScrollView, TouchableOpacity, LinearGradient, BlurView, Image } from '../../tw';
import { useAuthStore } from '../../stores/authStore';
import { LogOut, User, Shield, Info, ChevronRight, Smartphone, Bell, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Animated } from '../../tw/animated';
import { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Alert, StatusBar, StyleSheet, TouchableOpacity as NativeTouchableOpacity, ActivityIndicator } from 'react-native';
import * as Updates from 'expo-updates';
import { TYPOGRAPHY, BUTTON, COLORS as T, RADIUS, SHADOWS, SPACING } from '../../tokens';

export default function ProfileTab() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Keluar Akun',
      'Apakah Anda yakin ingin keluar dari sesi ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Keluar', 
          style: 'destructive',
          onPress: async () => {
            await clearAuth();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const [isCheckingUpdate, setIsCheckingUpdate] = React.useState(false);

  const handleCheckUpdate = async () => {
    try {
      setIsCheckingUpdate(true);
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        Alert.alert('Update Tersedia', 'Update OTA baru sedang diunduh. Tunggu sebentar...');
        await Updates.fetchUpdateAsync();
        Alert.alert('Update Selesai', 'Akses fitur terbaru sekarang! Aplikasi akan dimuat ulang.', [
          { text: 'Muat Ulang', style: 'default', onPress: () => Updates.reloadAsync() }
        ]);
      } else {
        Alert.alert('Versi Terbaru', 'Tidak ada update OTA (EAS Update) baru saat ini.');
      }
    } catch (e: any) {
      Alert.alert('Gagal Cek Update', 'Terjadi kesalahan koneksi atau aplikasi berjalan di mode development (Expo Go).\n\nDetails: ' + e.message);
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const ProfileItem = ({ icon: Icon, title, value, color = T.primary, onPress, isLoading = false }: { icon: any, title: string, value: string, color?: string, onPress?: () => void, isLoading?: boolean }) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress} activeOpacity={onPress ? 0.7 : 1} disabled={!onPress || isLoading}>
      <View style={[styles.profileItemIcon, { backgroundColor: `${color}15` }]}>
        <Icon color={color} size={22} />
      </View>
      <View style={styles.profileItemText}>
        <Text style={styles.profileItemLabel}>{title}</Text>
        <Text style={styles.profileItemValue}>{value}</Text>
      </View>
      {isLoading ? <ActivityIndicator color={color} /> : <ChevronRight color="#475569" size={20} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Head>
        <title>Profil - Pertamak</title>
      </Head>
      <StatusBar barStyle="light-content" />
      <LinearGradient 
        colors={[T.darkBg, T.darkSurface]} 
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header/Banner Area */}
        <View style={styles.headerArea}>
            <Animated.View entering={FadeInDown.duration(800)}>
              <View style={styles.avatarFrame}>
                <Image 
                  source={{ uri: `https://ui-avatars.com/api/?name=${user?.name}&background=0EA5E9&color=fff&bold=true&size=256` }}
                  style={styles.avatarImage}
                />
              </View>
            </Animated.View>
            
            <Animated.View entering={FadeInUp.delay(200)} style={styles.userInfoCenter}>
              <Text style={styles.userName}>{user?.name}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {user?.role}
                </Text>
              </View>
            </Animated.View>
        </View>

        {/* Content Section */}
        <View style={styles.contentArea}>
           <Animated.View entering={FadeInUp.delay(400)}>
              <Text style={styles.sectionLabel}>AKUN SAYA</Text>
              
              <ProfileItem icon={User} title="Nama Lengkap" value={user?.name || '-'} />
              <ProfileItem icon={Shield} title="Hak Akses" value={user?.role?.toUpperCase() || '-'} />
              <ProfileItem icon={Smartphone} title="Versi Aplikasi" value="1.0.0 (Alpha)" />
           </Animated.View>

           <Animated.View entering={FadeInUp.delay(600)} style={styles.preferencesSection}>
              <Text style={styles.sectionLabelSecondary}>PREFERENSI & SISTEM</Text>
              
              <ProfileItem icon={Bell} title="Notifikasi" value="Aktif" color="#6366F1" />
              <ProfileItem 
                icon={Smartphone} 
                title="Cek Update via EAS" 
                value="Tap untuk sinkronisasi OTA" 
                color="#0EA5E9" 
                onPress={handleCheckUpdate}
                isLoading={isCheckingUpdate}
              />
              <ProfileItem icon={Heart} title="Bantuan & Dukungan" value="Hubungi Admin" color="#F43F5E" />
              <ProfileItem icon={Info} title="Tentang" value="PERTAMAK v1.0.0" color="#FACC15" />
           </Animated.View>

           {/* Logout Button */}
           <Animated.View entering={FadeInUp.delay(800)} style={styles.logoutSection}>
              <NativeTouchableOpacity 
                activeOpacity={0.8}
                onPress={handleLogout}
                style={styles.logoutButton}
              >
                 <LogOut color="#FB7185" size={24} style={{ marginRight: 12 }} />
                 <Text style={styles.logoutText}>Keluar Akun</Text>
              </NativeTouchableOpacity>
              
              <Text style={styles.footerText}>
                Pertamak
              </Text>
           </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.darkBg },
  scroll: { flex: 1 },
  headerArea: { paddingTop: 96, paddingBottom: 48, alignItems: 'center' },
  avatarFrame: {
    width: 128, height: 128, borderRadius: RADIUS.xxl, borderWidth: 4,
    borderColor: 'rgba(56, 189, 248, 0.3)', overflow: 'hidden',
    ...SHADOWS.glow(T.primarySolid),
    marginBottom: SPACING.xl,
  },
  avatarImage: { width: '100%', height: '100%' },
  userInfoCenter: { alignItems: 'center' },
  userName: { color: 'white', ...TYPOGRAPHY.title, marginBottom: 8 },
  roleBadge: {
    backgroundColor: 'rgba(14, 165, 233, 0.2)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 6,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  roleText: { color: '#7DD3FC', fontWeight: '700', ...TYPOGRAPHY.label, marginBottom: 0 },
  contentArea: { paddingHorizontal: SPACING.xl, paddingBottom: 160 },
  sectionLabel: { color: T.primary, ...TYPOGRAPHY.label, letterSpacing: 4, marginBottom: SPACING.xl, marginLeft: SPACING.xs },
  sectionLabelSecondary: { color: T.textTertiary, ...TYPOGRAPHY.label, letterSpacing: 4, marginBottom: SPACING.xl, marginLeft: SPACING.xs },
  profileItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.darkCard, padding: SPACING.xl,
    borderRadius: 28, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: T.darkBorder,
  },
  profileItemIcon: { padding: SPACING.md, borderRadius: RADIUS.md, marginRight: SPACING.lg },
  profileItemText: { flex: 1 },
  profileItemLabel: { color: T.textSecondary, ...TYPOGRAPHY.label, marginBottom: 4 },
  profileItemValue: { color: 'white', ...TYPOGRAPHY.bodySecondary },
  preferencesSection: { marginTop: RADIUS.xl },
  logoutSection: { marginTop: 48 },
  logoutButton: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    ...BUTTON.primary,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  logoutText: { color: '#FB7185', ...TYPOGRAPHY.subheading },
  footerText: { color: T.textInactive, textAlign: 'center', ...TYPOGRAPHY.badge, letterSpacing: 5, marginTop: RADIUS.xl },
});
