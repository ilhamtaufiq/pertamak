import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, LinearGradient, BlurView, Image } from '../../tw';
import { useAuthStore } from '../../stores/authStore';
import { LogOut, User, Shield, Info, ChevronRight, Settings, Smartphone, Bell, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Animated } from '../../tw/animated';
import { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Alert, StatusBar } from 'react-native';

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

  const ProfileItem = ({ icon: Icon, title, value, color = "#38BDF8" }: { icon: any, title: string, value: string, color?: string }) => (
    <TouchableOpacity className="flex-row items-center bg-white/5 p-5 rounded-[28px] mb-4 border border-white/10">
      <View className="bg-white/10 p-3 rounded-2xl mr-4">
        <Icon color={color} size={22} />
      </View>
      <View className="flex-1">
        <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</Text>
        <Text className="text-white text-base font-bold">{value}</Text>
      </View>
      <ChevronRight color="#475569" size={20} />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" />
      <LinearGradient 
        colors={['#020617', '#0F172A']} 
        className="absolute inset-0"
      />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header/Banner Area */}
        <View className="pt-24 pb-12 items-center">
            <Animated.View entering={FadeInDown.duration(800)}>
              <View className="w-32 h-32 rounded-[40px] border-4 border-sky-400/30 overflow-hidden shadow-2xl shadow-sky-500/20 mb-6">
                <Image 
                  source={{ uri: `https://ui-avatars.com/api/?name=${user?.name}&background=0EA5E9&color=fff&bold=true&size=256` }}
                  className="w-full h-full"
                />
              </View>
            </Animated.View>
            
            <Animated.View entering={FadeInUp.delay(200)} className="items-center">
              <Text className="text-white text-3xl font-black tracking-tight mb-2">{user?.name}</Text>
              <View className="bg-sky-500/20 px-4 py-1.5 rounded-full border border-sky-400/30">
                <Text className="text-sky-300 font-bold text-[10px] uppercase tracking-[4px]">
                  {user?.role} Enterprise
                </Text>
              </View>
            </Animated.View>
        </View>

        {/* Content Section */}
        <View className="px-6 pb-40">
           <Animated.View entering={FadeInUp.delay(400)}>
              <Text className="text-sky-400 font-black text-[10px] uppercase tracking-[4px] mb-5 ml-2">Akun Saya</Text>
              
              <ProfileItem icon={User} title="Nama Lengkap" value={user?.name || '-'} />
              <ProfileItem icon={Shield} title="Hak Akses" value={user?.role?.toUpperCase() || '-'} />
              <ProfileItem icon={Smartphone} title="Versi Aplikasi" value="1.0.0 (Alpha)" />
           </Animated.View>

           <Animated.View entering={FadeInUp.delay(600)} className="mt-8">
              <Text className="text-slate-500 font-black text-[10px] uppercase tracking-[4px] mb-5 ml-2">Preferensi</Text>
              
              <ProfileItem icon={Bell} title="Notifikasi" value="Aktif" color="#6366F1" />
              <ProfileItem icon={Heart} title="Bantuan & Dukungan" value="Hubungi Admin" color="#F43F5E" />
              <ProfileItem icon={Info} title="Tentang" value="PERTAMAK v1.0.0" color="#FACC15" />
           </Animated.View>

           {/* Logout Button */}
           <Animated.View entering={FadeInUp.delay(800)} className="mt-12">
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={handleLogout}
                className="bg-rose-500/10 h-16 rounded-[28px] border border-rose-500/20 items-center justify-center flex-row shadow-lg shadow-rose-950/20"
              >
                 <LogOut color="#FB7185" size={24} className="mr-3" />
                 <Text className="text-rose-400 text-xl font-black">Keluar Akun</Text>
              </TouchableOpacity>
              
              <Text className="text-slate-700 text-center text-[10px] font-black uppercase tracking-[5px] mt-8">
                Pertamak Mobile Hub
              </Text>
           </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}
