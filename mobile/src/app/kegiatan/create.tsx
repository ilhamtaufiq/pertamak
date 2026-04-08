import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Dimensions, TextInput as RNTextInput, StatusBar, StyleSheet } from 'react-native';
import { View, Text, TextInput, TouchableOpacity, LinearGradient, BlurView, Image } from '../../tw';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Camera, MapPin, Calendar, X, Plus, Save, ChevronLeft, Image as ImageIcon, Map as MapIcon, Send, LocateFixed, Search, RefreshCcw, FileText, LayoutList } from 'lucide-react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useCreateKegiatan, useUpdateKegiatan, useKegiatanById } from '../../hooks/useKegiatan';
import { haptics } from '../../services/haptics';
import { Animated } from '../../tw/animated';
import { FadeInDown, FadeInUp, SlideInRight, ZoomIn } from 'react-native-reanimated';
import { format } from 'date-fns';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MOCK_PLACES = [
  "Masjid Agung Cianjur, Pamoyanan, Cianjur",
  "Taman Prawatasari, Joglo, Cianjur",
  "Kantor Bupati Cianjur, Sirnagalih, Cianjur",
  "Pasar Induk Cianjur, Pasirhayam, Cianjur",
  "Alun-alun Cianjur, Pamoyanan, Cianjur",
  "Terminal Pasirhayam, Cilaku, Cianjur",
  "RSUD Sayang Cianjur, Siti Jenab, Cianjur"
];

export default function CreateKegiatanScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isEdit = !!id;

  const createMutation = useCreateKegiatan();
  const updateMutation = useUpdateKegiatan(Number(id));
  const { data: existingData, isLoading: isLoadingPrev } = useKegiatanById(Number(id));

  // Form State
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [lokasi, setLokasi] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [uraian, setUraian] = useState('');
  const [images, setImages] = useState<any[]>([]);

  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing data for Edit Mode
  useEffect(() => {
    if (isEdit && existingData) {
      setTanggal(existingData.tanggal || new Date().toISOString().split('T')[0]);
      setLokasi(existingData.lokasi || '');
      setLatitude(existingData.latitude || null);
      setLongitude(existingData.longitude || null);
      setUraian(existingData.uraian_kegiatan || '');

      if (existingData.media && existingData.media.length > 0) {
        setImages(existingData.media.map(m => ({
          uri: m.original_url.replace('localhost', 'pertamak.cianjur.space'),
          isExisting: true,
          id: m.id
        })));
      }
    }
  }, [isEdit, existingData]);

  useEffect(() => {
    if (!isEdit) detectLocation();
  }, [isEdit]);

  const handleLocationChange = (text: string) => {
    setLokasi(text);
    if (text.length > 2) {
      const filtered = MOCK_PLACES.filter(p => p.toLowerCase().includes(text.toLowerCase()));
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const selectPlace = (place: string) => {
    setLokasi(place);
    setSuggestions([]);
    haptics.impactLight();
  };

  const detectLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);

      try {
        const reverse = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        if (reverse && reverse.length > 0) {
          const addr = reverse[0];
          const readable = [addr.street, addr.district, addr.city].filter(Boolean).join(', ');
          if (readable && (!lokasi || locationsIsDefault(lokasi))) setLokasi(readable);
        }
      } catch (e) {
        console.warn('Geocoding error');
      }
    } catch (e) {
      console.warn('Detection failed:', e);
    } finally {
      setIsLocating(false);
    }
  };

  const locationsIsDefault = (loc: string) => loc.includes('Lat:') || loc === '';

  const pickImage = async () => {
    haptics.impactLight();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) setImages([...images, ...result.assets]);
  };

  const takePhoto = async () => {
    haptics.impactLight();
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) setImages([...images, ...result.assets]);
  };

  const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!uraian || !lokasi) {
      Alert.alert('Data Belum Lengkap', 'Silakan isi uraian kegiatan dan lokasi.');
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('tanggal', tanggal);
      formData.append('lokasi', lokasi);
      if (latitude) formData.append('latitude', latitude.toString());
      if (longitude) formData.append('longitude', longitude.toString());
      formData.append('uraian_kegiatan', uraian);

      images.forEach((img, idx) => {
        if (!img.isExisting) {
          const filename = img.fileName || `photo_${idx}.jpg`;
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image/jpeg`;
          formData.append('dokumentasi[]', {
            uri: img.uri,
            name: filename,
            type: type,
          } as any);
        }
      });

      if (isEdit) {
        await updateMutation.mutateAsync(formData);
      } else {
        await createMutation.mutateAsync(formData);
      }

      haptics.success();
      router.back();
    } catch (e: any) {
      Alert.alert('Gagal', e.message || 'Gagal mengirim laporan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEdit && isLoadingPrev) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator color="#0EA5E9" size="large" />
        <Text className="text-slate-400 mt-4 font-black uppercase tracking-[4px]">Draf di Sinkronkan...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-[#020617]">
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#020617', '#0F172A']} style={StyleSheet.absoluteFill} />

      {/* Premium Header - Matching Media & Home Pattern */}
      <View className="h-48 border-b border-white/5 overflow-hidden">
        <LinearGradient
          colors={['#020617', '#0F172A']}
          style={{ flex: 1, paddingTop: 64, paddingHorizontal: 24 }}
        >
          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-white/20 p-4 rounded-[24px] border border-white/30 shadow-sm"
            >
              <ChevronLeft color="white" size={24} />
            </TouchableOpacity>
            <View className="items-center">
              <Text className="text-[#38BDF8] font-black text-[10px] uppercase tracking-[4px] mb-2">{isEdit ? 'Ubah Jurnal' : 'Entri Laporan'}</Text>
              <Text className="text-white text-3xl font-black tracking-tight">{isEdit ? 'Update Kegiatan' : 'Laporan Baru'}</Text>
            </View>
            <View className="w-14" />
          </View>
        </LinearGradient>
      </View>

      {/* Floating Info Pill */}
      <View style={{ marginTop: -32, paddingHorizontal: 32, zIndex: 10 }}>
        <Animated.View
          entering={ZoomIn.delay(300)}
          className="bg-slate-900 rounded-full py-4 px-8 flex-row items-center justify-center border border-white/10 shadow-2xl shadow-slate-950/50"
        >
          <Calendar color="#38BDF8" size={16} className="mr-3" />
          <Text className="text-white font-black text-[10px] uppercase tracking-[2px]">{format(new Date(tanggal), 'EEEE, dd MMMM yyyy')}</Text>
        </Animated.View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 150, paddingTop: 40, paddingHorizontal: 24 }}
        >
          {/* Section 1: Lokasi */}
          <Animated.View entering={FadeInDown.delay(100)} className="mb-10" style={{ zIndex: 100 }}>
            <View className="flex-row items-center mb-6 pl-2">
              <View className="w-1.5 h-6 bg-sky-500 rounded-full mr-4" />
              <Text className="text-white font-black text-xs uppercase tracking-widest">Dimana Anda bekerja?</Text>
            </View>

            <View className="bg-[#0F172A] px-3 py-8 rounded-[48px] border border-white/5 shadow-2xl">
              <View className="flex-row items-center justify-between mb-8 px-4">
                <View className="bg-sky-500/10 px-4 py-2 rounded-full border border-sky-500/20">
                  <Text className="text-sky-600 font-black text-[9px] uppercase tracking-widest">AUTOMATIC GPS</Text>
                </View>
                <TouchableOpacity
                  onPress={detectLocation}
                  disabled={isLocating}
                  className="flex-row items-center"
                >
                    {isLocating ? <ActivityIndicator size="small" color="#38BDF8" /> : <RefreshCcw color="#64748B" size={14} />}
                </TouchableOpacity>
              </View>

              <View className="relative">
                <View className="flex-row items-center bg-[#020617] px-8 rounded-[40px] border border-white/10 shadow-inner h-24">
                  <MapPin color="#0EA5E9" size={24} className="mr-6" />
                  <RNTextInput
                    value={lokasi}
                    onChangeText={handleLocationChange}
                    placeholder="Cari lokasi atau ketik..."
                    placeholderTextColor="#475569"
                    className="flex-1 text-white font-black text-xl"
                    underlineColorAndroid="transparent"
                    style={{ flex: 1, height: '100%', color: 'white' }}
                  />
                </View>

                {suggestions.length > 0 && (
                  <Animated.View entering={FadeInUp} className="absolute top-[88px] left-0 right-0 z-50 bg-[#0F172A] rounded-[32px] shadow-2xl border border-white/10 overflow-hidden">
                    {suggestions.map((p, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => selectPlace(p)}
                        className="p-6 border-b border-slate-50 flex-row items-center"
                      >
                        <MapIcon color="#38BDF8" size={16} className="mr-4" />
                        <Text className="text-white font-bold" numberOfLines={1}>{p}</Text>
                      </TouchableOpacity>
                    ))}
                  </Animated.View>
                )}
              </View>
            </View>
          </Animated.View>

          {/* Section 2: Uraian */}
          <Animated.View entering={FadeInDown.delay(200)} className="mb-10" style={{ zIndex: 1 }}>
            <View className="flex-row items-center mb-6 pl-2">
              <View className="w-1.5 h-6 bg-emerald-500 rounded-full mr-4" />
              <Text className="text-white font-black text-xs uppercase tracking-widest">Apa yang dilakukan?</Text>
            </View>

            <View className="bg-[#0F172A] px-3 py-8 rounded-[48px] border border-white/5 shadow-2xl">
              <View className="flex-row items-center mb-6">
                <FileText color="#10B981" size={20} className="mr-4" />
                <Text className="text-slate-400 font-black text-[10px] uppercase tracking-[2px]">DESKRIPSI RINCI</Text>
              </View>
              <RNTextInput
                multiline
                numberOfLines={8}
                value={uraian}
                onChangeText={setUraian}
                placeholder="Ketik rincian pekerjaan Anda di sini..."
                placeholderTextColor="#475569"
                textAlignVertical="top"
                underlineColorAndroid="transparent"
                className="bg-[#020617] p-8 rounded-[32px] text-white font-bold text-lg h-60 border border-white/10 shadow-inner"
                style={{ padding: 24, color: 'white' }}
              />
            </View>
          </Animated.View>

          {/* Section 3: Dokumentasi */}
          <Animated.View entering={FadeInDown.delay(300)} className="mb-10">
            <View className="flex-row items-center justify-between mb-6 pl-2 pr-4">
              <View className="flex-row items-center">
                <View className="w-1.5 h-6 bg-amber-500 rounded-full mr-4" />
                <Text className="text-white font-black text-xs uppercase tracking-widest">Bukti Lapangan</Text>
              </View>
              <View className="bg-white/5 px-3 py-1 rounded-full border border-white/10">
                <Text className="text-[#38BDF8] font-black text-[9px] uppercase tracking-tighter">{images.length}/5 FOTO</Text>
              </View>
            </View>

            <View className="flex-row flex-wrap gap-4 px-2">
              <TouchableOpacity
                onPress={takePhoto}
                className="w-[30%] aspect-square bg-sky-500 rounded-[32px] items-center justify-center shadow-lg shadow-sky-500/40"
              >
                <Camera color="white" size={32} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={pickImage}
                className="w-[30%] aspect-square bg-[#0F172A] rounded-[32px] border border-dashed border-white/10 items-center justify-center"
              >
                <Plus color="#38BDF8" size={32} />
              </TouchableOpacity>

              {images.map((img, idx) => (
                <View key={idx} className="w-[30%] aspect-square rounded-[32px] overflow-hidden shadow-md bg-[#0F172A]">
                  <Image source={{ uri: img.uri }} className="w-full h-full" />
                  <TouchableOpacity
                    onPress={() => removeImage(idx)}
                    className="absolute top-2 right-2 bg-black/60 w-8 h-8 rounded-full items-center justify-center"
                  >
                    <X color="white" size={14} />
                  </TouchableOpacity>
                  {img.isExisting && (
                    <View className="absolute bottom-0 inset-x-0 bg-sky-500 py-1 items-center">
                      <Text className="text-[7px] text-white font-black uppercase tracking-tighter">CLOUD ASSET</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Final Action Button */}
          <Animated.View entering={FadeInUp.delay(500)} className="mt-8">
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleSubmit}
              disabled={isSubmitting}
              className="bg-slate-900 py-8 rounded-[48px] items-center justify-center shadow-2xl shadow-slate-950/50"
            >
              <LinearGradient
                colors={['#0EA5E9', '#0284C7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="absolute inset-0 rounded-[48px]"
              />
              <View className="flex-row items-center">
                <Text className="text-white font-black text-xl uppercase tracking-[4px] mr-4">
                  {isEdit ? 'SIMPAN PERUBAHAN' : 'KIRIM LAPORAN'}
                </Text>
                <Send color="white" size={24} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Full Screen Loading Overlay */}
      {isSubmitting && (
        <BlurView intensity={30} tint="dark" className="absolute inset-0 items-center justify-center z-[100]">
          <View className="bg-slate-900/90 p-12 rounded-[56px] border border-white/10 items-center">
            <ActivityIndicator color="#38BDF8" size="large" />
            <Text className="text-white mt-6 font-black text-[10px] uppercase tracking-[6px]">Mengunggah Data...</Text>
          </View>
        </BlurView>
      )}
    </View>
  );
}
