import React, { useState } from 'react';
import { ScrollView, View, Text, Image, LinearGradient, BlurView, TouchableOpacity, ActivityIndicator } from '../../tw';
import { Modal, Alert, StatusBar, Dimensions } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useKegiatanById, useDeleteKegiatan } from '../../hooks/useKegiatan';
import { MapPin, Calendar, Clock, ChevronLeft, Trash2, ShieldAlert, Image as ImageIcon, Share2, Pencil, AlertCircle, X, CheckCircle2 } from 'lucide-react-native';
import { Animated } from '../../tw/animated';
import { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { haptics } from '../../services/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function KegiatanDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: kegiatan, isLoading, error } = useKegiatanById(Number(id));
  const deleteMutation = useDeleteKegiatan();
  
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    setIsDeleting(true);
    haptics.impactHeavy();
    try {
      await deleteMutation.mutateAsync(Number(id));
      setShowConfirmDelete(false);
      router.replace('/(tabs)/kegiatan');
    } catch (e: any) {
      Alert.alert('Gagal', e.message || 'Gagal menghapus laporan.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <ActivityIndicator color="#38BDF8" size="large" />
      </View>
    );
  }

  if (error || !kegiatan) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center p-6">
        <ShieldAlert color="#F87171" size={64} className="mb-4" />
        <Text className="text-white text-xl font-black text-center mb-2">Terjadi Kesalahan</Text>
        <Text className="text-slate-400 text-center mb-8">Data tidak ditemukan atau Anda tidak memiliki akses.</Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-sky-500 px-8 py-3 rounded-full">
           <Text className="text-white font-bold">Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" />
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          title: 'Detail Laporan',
          headerTransparent: true,
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: '900', fontSize: 18 },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="bg-white/10 p-2 rounded-xl ml-2">
              <ChevronLeft color="white" size={24} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View className="flex-row items-center gap-2 mr-2">
               <TouchableOpacity 
                 onPress={() => router.push(`/kegiatan/create?id=${id}`)} 
                 className="bg-sky-500/10 p-2 rounded-xl border border-sky-500/20"
               >
                 <Pencil color="#38BDF8" size={20} />
               </TouchableOpacity>
               <TouchableOpacity 
                 onPress={() => {
                   haptics.impactMedium();
                   setShowConfirmDelete(true);
                 }} 
                 className="bg-rose-500/10 p-2 rounded-xl border border-rose-500/20"
               >
                 <Trash2 color="#FB7185" size={20} />
               </TouchableOpacity>
            </View>
          )
        }} 
      />

      <LinearGradient 
        colors={['#020617', '#0F172A']} 
        className="absolute inset-0"
      />

      <ScrollView className="flex-1 pt-32" showsVerticalScrollIndicator={false}>
        {/* Poster Image or Gallery */}
        <Animated.View entering={FadeInDown} className="px-6 mb-8">
           {kegiatan.media && kegiatan.media.length > 0 ? (
             <View className="shadow-2xl shadow-sky-500/20">
               <Image 
                 source={{ uri: kegiatan.media[0].original_url.replace('localhost', 'pertamak.cianjur.space') }}
                 className="w-full h-80 rounded-[40px] border border-white/10"
                 resizeMode="cover"
               />
               <View className="absolute bottom-6 right-6 bg-black/60 px-4 py-2 rounded-2xl border border-white/20 flex-row items-center">
                  <ImageIcon color="white" size={16} className="mr-2" />
                  <Text className="text-white font-bold">{kegiatan.media.length} Foto</Text>
               </View>
             </View>
           ) : (
             <View className="w-full h-40 bg-white/5 rounded-[40px] items-center justify-center border border-dashed border-white/10">
               <Text className="text-slate-500 font-bold">Tidak ada dokumentasi foto</Text>
             </View>
           )}
        </Animated.View>

        {/* Content Section */}
        <Animated.View entering={FadeInUp.delay(200)} className="px-6 pb-40">
          <View className="bg-white/5 rounded-[40px] border border-white/10 p-8">
            <View className="flex-row items-center justify-between mb-8">
              <View>
                <Text className="text-sky-400 font-black text-[10px] uppercase tracking-[4px] mb-2">Waktu Kegiatan</Text>
                <View className="flex-row items-center">
                   <Calendar color="white" size={20} className="mr-3" />
                   <Text className="text-white text-xl font-bold">{kegiatan.hari}, {kegiatan.tanggal}</Text>
                </View>
              </View>
              <View className="bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                <Text className="text-emerald-400 font-black text-[10px] uppercase tracking-tighter text-center">Terlapor</Text>
              </View>
            </View>

            <View className="h-px bg-white/5 mb-8" />

            <View className="mb-8">
              <Text className="text-sky-400 font-black text-[10px] uppercase tracking-[4px] mb-3">Uraian Laporan</Text>
              <Text className="text-slate-200 text-lg leading-7 font-medium">
                {kegiatan.uraian_kegiatan}
              </Text>
            </View>

            <View className="mb-0">
              <Text className="text-sky-400 font-black text-[10px] uppercase tracking-[4px] mb-4">Titik Lokasi</Text>
              <View className="flex-row items-center bg-slate-900/50 p-5 rounded-3xl border border-white/5">
                <MapPin color="#38BDF8" size={24} className="mr-4" />
                <View className="flex-1">
                  <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>{kegiatan.lokasi}</Text>
                  {kegiatan.latitude && (
                    <Text className="text-slate-500 text-xs font-medium">
                      Lat: {kegiatan.latitude.toFixed(6)}, Lon: {kegiatan.longitude?.toFixed(6)}
                    </Text>
                  )}
                </View>
                <TouchableOpacity className="bg-sky-500/10 p-3 rounded-2xl border border-sky-500/20 ml-2">
                  <Share2 color="#38BDF8" size={20} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Full Gallery Section */}
          {kegiatan.media && kegiatan.media.length > 1 && (
            <View className="mt-8">
               <Text className="text-sky-400 font-black text-[10px] uppercase tracking-[4px] mb-4 ml-2">Semua Dokumentasi</Text>
               <View className="flex-row flex-wrap gap-4">
                  {kegiatan.media.map((item, idx) => (
                    <View key={idx} className="w-[47%] aspect-square rounded-[32px] overflow-hidden border border-white/5 shadow-lg">
                       <Image 
                         source={{ uri: item.original_url.replace('localhost', 'pertamak.cianjur.space') }}
                         className="w-full h-full"
                       />
                    </View>
                  ))}
               </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Custom Confirmation Modal */}
      <Modal
        visible={showConfirmDelete}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmDelete(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/80 px-8">
           <BlurView intensity={20} tint="dark" className="bg-slate-900/90 rounded-[48px] border border-white/10 p-10 w-full items-center shadow-2xl">
              <Animated.View entering={ZoomIn}>
                 <View className="w-24 h-24 bg-rose-500/20 rounded-full items-center justify-center mb-6">
                    <AlertCircle color="#FB7185" size={48} />
                 </View>
              </Animated.View>

              <Text className="text-white text-2xl font-black text-center mb-2">Hapus Laporan?</Text>
              <Text className="text-slate-400 text-center mb-10 leading-6">Data yang sudah dihapus tidak dapat dipulihkan kembali. Lanjutkan?</Text>

              <View className="flex-row gap-4 w-full">
                 <TouchableOpacity 
                   onPress={() => setShowConfirmDelete(false)}
                   className="flex-1 bg-white/5 py-5 rounded-3xl border border-white/10 items-center"
                 >
                    <Text className="text-slate-400 font-black text-xs uppercase tracking-widest">Batal</Text>
                 </TouchableOpacity>
                 <TouchableOpacity 
                   onPress={confirmDelete}
                   disabled={isDeleting}
                   className="flex-2 bg-rose-500 py-5 rounded-3xl items-center shadow-lg shadow-rose-500/40"
                 >
                    {isDeleting ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-black text-xs uppercase tracking-widest">Ya, Hapus</Text>
                    )}
                 </TouchableOpacity>
              </View>
           </BlurView>
        </View>
      </Modal>

      {/* Floating Back Button */}
      <BlurView intensity={20} tint="dark" className="absolute bottom-0 inset-x-0 p-8 border-t border-white/10">
        <TouchableOpacity 
          onPress={() => router.back()}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#38BDF8', '#0EA5E9']}
            className="h-16 rounded-[24px] items-center justify-center flex-row shadow-2xl shadow-sky-500/40"
          >
             <ChevronLeft color="white" size={24} className="mr-2" />
             <Text className="text-white text-xl font-black">Kembali ke Daftar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
}
