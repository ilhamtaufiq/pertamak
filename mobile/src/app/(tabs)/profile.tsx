import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, LinearGradient, BlurView, Image } from '../../tw';
import { useAuthStore } from '../../stores/authStore';
import { LogOut, User, Shield, Info, ChevronRight, Smartphone, Bell, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Animated } from '../../tw/animated';
import { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Alert, StatusBar, StyleSheet, TouchableOpacity as NativeTouchableOpacity, ActivityIndicator } from 'react-native';
import * as Updates from 'expo-updates';

const COLORS = {
  primary: '#38BDF8',
  primarySolid: '#0EA5E9',
  darkBg: '#020617',
  darkSurface: '#0F172A',
  text: '#FFFFFF',
  textSecondary: '#64748B',
  border: 'rgba(255,255,255,0.1)',
};

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

  const ProfileItem = ({ icon: Icon, title, value, color = COLORS.primary, onPress, isLoading = false }: { icon: any, title: string, value: string, color?: string, onPress?: () => void, isLoading?: boolean }) => (
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
      <StatusBar barStyle="light-content" />
      <LinearGradient 
        colors={[COLORS.darkBg, COLORS.darkSurface]} 
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
                  {user?.role} Enterprise
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
                Pertamak Mobile Hub
              </Text>
           </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  scroll: { flex: 1 },
  headerArea: { paddingTop: 96, paddingBottom: 48, alignItems: 'center' },
  avatarFrame: {
    width: 128, height: 128, borderRadius: 40, borderWidth: 4,
    borderColor: 'rgba(56, 189, 248, 0.3)', overflow: 'hidden',
    shadowColor: '#0EA5E9', shadowOpacity: 0.2, shadowRadius: 20, elevation: 10,
    marginBottom: 24,
  },
  avatarImage: { width: '100%', height: '100%' },
  userInfoCenter: { alignItems: 'center' },
  userName: { color: 'white', fontSize: 30, fontWeight: '900', letterSpacing: -0.5, marginBottom: 8 },
  roleBadge: {
    backgroundColor: 'rgba(14, 165, 233, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  roleText: { color: '#7DD3FC', fontWeight: '700', fontSize: 10, letterSpacing: 4, textTransform: 'uppercase' },
  contentArea: { paddingHorizontal: 24, paddingBottom: 160 },
  sectionLabel: { color: '#38BDF8', fontWeight: '900', fontSize: 10, letterSpacing: 4, marginBottom: 20, marginLeft: 8 },
  sectionLabelSecondary: { color: '#475569', fontWeight: '900', fontSize: 10, letterSpacing: 4, marginBottom: 20, marginLeft: 8 },
  profileItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)', padding: 20,
    borderRadius: 28, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  profileItemIcon: { padding: 12, borderRadius: 16, marginRight: 16 },
  profileItemText: { flex: 1 },
  profileItemLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 4, textTransform: 'uppercase' },
  profileItemValue: { color: 'white', fontSize: 16, fontWeight: '700' },
  preferencesSection: { marginTop: 32 },
  logoutSection: { marginTop: 48 },
  logoutButton: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    height: 64,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  logoutText: { color: '#FB7185', fontSize: 20, fontWeight: '900' },
  footerText: { color: '#334155', textAlign: 'center', fontSize: 10, fontWeight: '900', letterSpacing: 5, marginTop: 32, textTransform: 'uppercase' },
});
