import React from 'react';
import Head from 'expo-router/head';
import { View, Text, ScrollView, TouchableOpacity, Image } from '../../tw';
import { useAuthStore } from '../../stores/authStore';
import { LogOut, User, Shield, Info, ChevronRight, Smartphone, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Animated } from '../../tw/animated';
import { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Alert, StatusBar, StyleSheet, TouchableOpacity as NativeTouchableOpacity, ActivityIndicator } from 'react-native';
import { APP_VERSION } from '../../config';
import * as Updates from 'expo-updates';
import { TYPOGRAPHY, BUTTON, COLORS as T, RADIUS, SPACING } from '../../tokens';

export default function ProfileTab() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const roleLabel = user?.role === 'admin' ? 'Administrator' : 'Karyawan';

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

  const ProfileItem = ({ icon: Icon, title, value, onPress, isLoading = false }: { icon: any, title: string, value: string, onPress?: () => void, isLoading?: boolean }) => (
    <TouchableOpacity
      style={styles.profileItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress || isLoading}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${title}: ${value}`}
    >
      <Icon color={T.textSecondary} size={20} style={{ marginRight: SPACING.lg }} />
      <View style={styles.profileItemText}>
        <Text style={styles.profileItemLabel}>{title}</Text>
        <Text style={styles.profileItemValue}>{value}</Text>
      </View>
      {isLoading ? <ActivityIndicator color={T.primary} /> : onPress ? <ChevronRight color={T.textTertiary} size={20} /> : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Head>
        <title>Profil - Pertamak</title>
      </Head>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header/Banner Area */}
        <View style={styles.headerArea}>
            <Animated.View entering={FadeInDown.duration(800)}>
              <View style={styles.avatarFrame}>
                <Image 
                  source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? 'User')}&background=0EA5E9&color=fff&bold=true&size=256` }}
                  style={styles.avatarImage}
                />
              </View>
            </Animated.View>
            
            <Animated.View entering={FadeInUp.delay(200)} style={styles.userInfoCenter}>
              <Text style={styles.userName}>{user?.name}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {roleLabel}
                </Text>
              </View>
            </Animated.View>
        </View>

        {/* Content Section */}
        <View style={styles.contentArea}>
           <Animated.View entering={FadeInUp.delay(400)}>
              <Text style={styles.sectionLabel}>Akun saya</Text>
              
              <ProfileItem icon={User} title="Nama Lengkap" value={user?.name || '-'} />
              <ProfileItem icon={Shield} title="Hak Akses" value={roleLabel} />
              <ProfileItem icon={Smartphone} title="Versi Aplikasi" value={APP_VERSION} />
           </Animated.View>

           <Animated.View entering={FadeInUp.delay(600)} style={styles.preferencesSection}>
              <Text style={styles.sectionLabel}>Preferensi & sistem</Text>
              
              <ProfileItem 
                icon={Smartphone} 
                title="Cek Update via EAS" 
                value="Tap untuk sinkronisasi OTA" 
                onPress={handleCheckUpdate}
                isLoading={isCheckingUpdate}
              />
              <ProfileItem icon={Heart} title="Bantuan & Dukungan" value="Hubungi Admin" />
              <ProfileItem icon={Info} title="Tentang" value={`Pertamak v${APP_VERSION}`} />
           </Animated.View>

           {/* Logout Button */}
           <Animated.View entering={FadeInUp.delay(800)} style={styles.logoutSection}>
              <NativeTouchableOpacity 
                activeOpacity={0.8}
                onPress={handleLogout}
                style={styles.logoutButton}
              >
                 <LogOut color={T.rose} size={20} style={{ marginRight: SPACING.md }} />
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
  headerArea: { paddingTop: 80, paddingBottom: SPACING.xxxl, alignItems: 'center' },
  avatarFrame: {
    width: 96, height: 96, borderRadius: RADIUS.lg, borderWidth: 1,
    borderColor: T.darkBorder, overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  avatarImage: { width: '100%', height: '100%' },
  userInfoCenter: { alignItems: 'center' },
  userName: { color: T.text, ...TYPOGRAPHY.heading, marginBottom: SPACING.sm },
  roleBadge: {
    backgroundColor: T.darkSurface,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: T.darkBorder,
  },
  roleText: { color: T.primary, ...TYPOGRAPHY.badge },
  contentArea: { paddingHorizontal: SPACING.xl, paddingBottom: 160 },
  sectionLabel: { color: T.textSecondary, ...TYPOGRAPHY.sectionLabel, marginBottom: SPACING.md, marginLeft: SPACING.xs },
  profileItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.darkSurface, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg,
    minHeight: 64,
    borderRadius: RADIUS.lg, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: T.darkBorder,
  },
  profileItemText: { flex: 1 },
  profileItemLabel: { color: T.textSecondary, ...TYPOGRAPHY.caption, marginBottom: 2 },
  profileItemValue: { color: T.text, ...TYPOGRAPHY.bodySecondary },
  preferencesSection: { marginTop: SPACING.xxxl },
  logoutSection: { marginTop: SPACING.xxxl },
  logoutButton: {
    height: BUTTON.primary.height,
    backgroundColor: T.darkSurface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: T.darkBorder,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  logoutText: { color: T.rose, ...TYPOGRAPHY.subheading },
  footerText: { color: T.textTertiary, textAlign: 'center', ...TYPOGRAPHY.badge, marginTop: SPACING.xl },
});
