import React, { useCallback } from 'react';
import { View, Text, ActivityIndicator, ScrollView, LinearGradient, BlurView, TouchableOpacity, Image } from '../../tw';
import { useAuthStore } from '../../stores/authStore';
import { FlashList } from '@shopify/flash-list';
import { Stack, useRouter } from 'expo-router';
import { useKegiatan } from '../../hooks/useKegiatan';
import { KegiatanCard } from '../../components/features/KegiatanCard';
import { Animated } from '../../tw/animated';
import { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { RefreshControl, StatusBar } from 'react-native';
import { ListTodo, Shield, Map as MapIcon, Image as ImageIcon, Bell, Search, LayoutGrid, CalendarDays, Plus, ArrowRight } from 'lucide-react-native';

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
      className="w-[47%] mb-4"
    >
      <BlurView intensity={10} tint="dark" className="p-6 rounded-[32px] border border-white/10 bg-white/5 items-center">
        <View className={`${color}/20 p-4 rounded-2xl border ${color}/30 mb-3 shadow-2xl ${color}/10`}>
          <Icon color={color.replace('bg-', '').replace('/20', '')} size={28} strokeWidth={2} />
        </View>
        <Text className="text-white font-black text-sm tracking-tighter uppercase">{title}</Text>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={['#020617', '#0F172A']}
        className="absolute inset-0"
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor="#38BDF8" />
        }
      >
        {/* Header Area */}
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row justify-between items-center mb-10">
            <Animated.View entering={FadeInDown.delay(100)} className="flex-row items-center">
              <View className="w-14 h-14 rounded-2xl border-2 border-sky-400/30 overflow-hidden shadow-2xl shadow-sky-500/20">
                <Image
                  source={{ uri: `https://ui-avatars.com/api/?name=${user?.name}&background=0EA5E9&color=fff&bold=true&size=128` }}
                  className="w-full h-full"
                />
              </View>
              <View className="ml-4">
                <Text className="text-slate-400 text-xs font-black uppercase tracking-[3px] mb-1">Status: Online</Text>
                <Text className="text-white text-2xl font-black tracking-tighter">Halo, {user?.name?.split(' ')[0]} 👋</Text>
              </View>
            </Animated.View>

            <TouchableOpacity className="bg-white/5 p-3 rounded-2xl border border-white/10">
              <Bell color="white" size={24} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          {/* Service Grid Section */}
          <Animated.View entering={FadeInDown.delay(200)} className="mb-10">
            <Text className="text-sky-400 font-black text-[10px] uppercase tracking-[4px] mb-6 px-1">Fitur Utama</Text>
            <View className="flex-row flex-wrap justify-between">
              <FeatureItem icon={ListTodo} title="Kegiatan" color="#38BDF8" route="/kegiatan/create" />
              <FeatureItem icon={MapIcon} title="Peta" color="#F472B6" route="/(tabs)/maps" />
            </View>
          </Animated.View>

          {/* Recent Activities Section */}
          <Animated.View entering={FadeInUp.delay(400)} className="flex-1 pb-32">
            <View className="flex-row items-center justify-between mb-6 px-1">
              <View>
                <Text className="text-white font-black text-2xl tracking-tighter">Kegiatan Terakhir</Text>
                <Text className="text-slate-500 text-xs font-bold leading-tight">Pantau progres pengerjaan harian Anda</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/kegiatan')}
                className="bg-white/5 px-4 py-2 rounded-xl flex-row items-center"
              >
                <Text className="text-sky-400 font-bold text-xs mr-2">Semua</Text>
                <ArrowRight color="#38BDF8" size={14} />
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View className="py-20 items-center">
                <ActivityIndicator color="#38BDF8" size="large" />
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
              <View className="py-20 items-center bg-white/5 rounded-[40px] border border-dashed border-white/10">
                <CalendarDays color="#1E293B" size={64} strokeWidth={1} />
                <Text className="text-slate-500 mt-4 font-medium">Bum ada kegiatan terbaru</Text>
              </View>
            )}
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}
