import React, { useState, useEffect, useCallback } from 'react';
import { KeyboardAvoidingView, Platform, Alert, Dimensions, TextInput as RNTextInput, StatusBar, StyleSheet } from 'react-native';
import { View, Text, TouchableOpacity, LinearGradient, BlurView, Image, ScrollView, ActivityIndicator } from '../../tw';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Camera, MapPin, Calendar, X, Plus, ChevronLeft, Map as MapIcon, Send, RefreshCcw, FileText } from 'lucide-react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useCreateKegiatan, useUpdateKegiatan, useKegiatanById } from '../../hooks/useKegiatan';
import { haptics } from '../../services/haptics';
import { Animated } from '../../tw/animated';
import { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { format } from 'date-fns';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#38BDF8',
  primarySolid: '#0EA5E9',
  darkBg: '#020617',
  darkSurface: '#0F172A',
  emerald: '#10B981',
  amber: '#F59E0B',
};

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
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={COLORS.primarySolid} size="large" />
        <Text style={styles.loadingText}>Draf di Sinkronkan...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={[COLORS.darkBg, COLORS.darkSurface]} style={StyleSheet.absoluteFill} />

      {/* Premium Header */}
      <View style={styles.headerWrapper}>
        <LinearGradient colors={[COLORS.darkBg, COLORS.darkSurface]} style={styles.headerGradient}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ChevronLeft color="white" size={24} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerLabel}>{isEdit ? 'Ubah Jurnal' : 'Entri Laporan'}</Text>
              <Text style={styles.headerTitle}>{isEdit ? 'Update Kegiatan' : 'Laporan Baru'}</Text>
            </View>
            <View style={{ width: 56 }} />
          </View>
        </LinearGradient>
      </View>

      {/* Floating Info Pill */}
      <View style={styles.pillWrapper}>
        <Animated.View entering={ZoomIn.delay(300)} style={styles.datePill}>
          <Calendar color={COLORS.primary} size={16} style={{ marginRight: 12 }} />
          <Text style={styles.datePillText}>{format(new Date(tanggal), 'EEEE, dd MMMM yyyy')}</Text>
        </Animated.View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 150, paddingTop: 40, paddingHorizontal: 24 }}
        >
          {/* Section 1: Lokasi */}
          <Animated.View entering={FadeInDown.delay(100)} style={[styles.section, { zIndex: 100 }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: COLORS.primarySolid }]} />
              <Text style={styles.sectionTitle}>Dimana Anda bekerja?</Text>
            </View>

            <View style={styles.formCard}>
              <View style={styles.gpsRow}>
                <View style={styles.gpsBadge}>
                  <Text style={styles.gpsBadgeText}>AUTOMATIC GPS</Text>
                </View>
                <TouchableOpacity onPress={detectLocation} disabled={isLocating}>
                  {isLocating ? <ActivityIndicator size="small" color={COLORS.primary} /> : <RefreshCcw color="#64748B" size={14} />}
                </TouchableOpacity>
              </View>

              <View style={{ position: 'relative' }}>
                <View style={styles.locationInputRow}>
                  <MapPin color={COLORS.primarySolid} size={24} style={{ marginRight: 24 }} />
                  <RNTextInput
                    value={lokasi}
                    onChangeText={handleLocationChange}
                    placeholder="Cari lokasi atau ketik..."
                    placeholderTextColor="#475569"
                    underlineColorAndroid="transparent"
                    style={styles.locationInput}
                  />
                </View>

                {suggestions.length > 0 && (
                  <Animated.View entering={FadeInUp} style={styles.suggestionsBox}>
                    {suggestions.map((p, idx) => (
                      <TouchableOpacity key={idx} onPress={() => selectPlace(p)} style={styles.suggestionItem}>
                        <MapIcon color={COLORS.primary} size={16} style={{ marginRight: 16 }} />
                        <Text style={styles.suggestionText} numberOfLines={1}>{p}</Text>
                      </TouchableOpacity>
                    ))}
                  </Animated.View>
                )}
              </View>
            </View>
          </Animated.View>

          {/* Section 2: Uraian */}
          <Animated.View entering={FadeInDown.delay(200)} style={[styles.section, { zIndex: 1 }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: COLORS.emerald }]} />
              <Text style={styles.sectionTitle}>Apa yang dilakukan?</Text>
            </View>

            <View style={styles.formCard}>
              <View style={styles.descLabelRow}>
                <FileText color={COLORS.emerald} size={20} style={{ marginRight: 16 }} />
                <Text style={styles.descLabel}>DESKRIPSI RINCI</Text>
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
                style={styles.uraianInput}
              />
            </View>
          </Animated.View>

          {/* Section 3: Dokumentasi */}
          <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
            <View style={styles.sectionHeaderBetween}>
              <View style={styles.sectionHeaderLeft}>
                <View style={[styles.sectionDot, { backgroundColor: COLORS.amber }]} />
                <Text style={styles.sectionTitle}>Bukti Lapangan</Text>
              </View>
              <View style={styles.photoCountPill}>
                <Text style={styles.photoCountText}>{images.length}/5 FOTO</Text>
              </View>
            </View>

            <View style={styles.mediaGrid}>
              <TouchableOpacity onPress={takePhoto} style={styles.cameraBtn}>
                <Camera color="white" size={32} />
              </TouchableOpacity>

              <TouchableOpacity onPress={pickImage} style={styles.addPhotoBtn}>
                <Plus color={COLORS.primary} size={32} />
              </TouchableOpacity>

              {images.map((img, idx) => (
                <View key={idx} style={styles.imageThumb}>
                  <Image source={{ uri: img.uri }} style={styles.imageThumbImg} />
                  <TouchableOpacity onPress={() => removeImage(idx)} style={styles.removeImageBtn}>
                    <X color="white" size={14} />
                  </TouchableOpacity>
                  {img.isExisting && (
                    <View style={styles.cloudAssetBadge}>
                      <Text style={styles.cloudAssetText}>CLOUD ASSET</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Final Action Button */}
          <Animated.View entering={FadeInUp.delay(500)} style={styles.submitSection}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={styles.submitBtnWrapper}
            >
              <LinearGradient
                colors={[COLORS.primarySolid, '#0284C7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitBtnGradient}
              />
              <View style={styles.submitBtnContent}>
                <Text style={styles.submitBtnText}>
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
        <BlurView intensity={30} tint="dark" style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator color={COLORS.primary} size="large" />
            <Text style={styles.loadingOverlayText}>Mengunggah Data...</Text>
          </View>
        </BlurView>
      )}
    </View>
  );
}

const ITEM_WIDTH = (SCREEN_WIDTH - 48 - 32) / 3; // 3 columns with gaps

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.darkBg },
  loadingScreen: { flex: 1, backgroundColor: COLORS.darkBg, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#94A3B8', marginTop: 16, fontWeight: '900', fontSize: 10, letterSpacing: 4, textTransform: 'uppercase' },
  headerWrapper: { height: 192, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
  headerGradient: { flex: 1, paddingTop: 64, paddingHorizontal: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)', padding: 16, borderRadius: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  headerCenter: { alignItems: 'center' },
  headerLabel: { color: COLORS.primary, fontWeight: '900', fontSize: 10, letterSpacing: 4, marginBottom: 8, textTransform: 'uppercase' },
  headerTitle: { color: 'white', fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
  pillWrapper: { marginTop: -32, paddingHorizontal: 32, zIndex: 10 },
  datePill: {
    backgroundColor: COLORS.darkSurface, borderRadius: 32, paddingVertical: 16, paddingHorizontal: 32,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 15, elevation: 8,
  },
  datePillText: { color: 'white', fontWeight: '900', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' },
  section: { marginBottom: 40 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingLeft: 8 },
  sectionHeaderBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingLeft: 8, paddingRight: 16 },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  sectionDot: { width: 6, height: 24, borderRadius: 3, marginRight: 16 },
  sectionTitle: { color: 'white', fontWeight: '900', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' },
  formCard: {
    backgroundColor: COLORS.darkSurface, paddingHorizontal: 12, paddingVertical: 32,
    borderRadius: 48, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 15, elevation: 5,
  },
  gpsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, paddingHorizontal: 16 },
  gpsBadge: {
    backgroundColor: 'rgba(56,189,248,0.1)', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(56,189,248,0.2)',
  },
  gpsBadgeText: { color: '#0284C7', fontWeight: '900', fontSize: 9, letterSpacing: 2 },
  locationInputRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.darkBg,
    paddingHorizontal: 32, borderRadius: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', height: 96,
  },
  locationInput: { flex: 1, height: '100%', color: 'white', fontWeight: '900', fontSize: 20 },
  suggestionsBox: {
    position: 'absolute', top: 88, left: 0, right: 0, zIndex: 50,
    backgroundColor: COLORS.darkSurface, borderRadius: 32, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  suggestionItem: { padding: 24, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', flexDirection: 'row', alignItems: 'center' },
  suggestionText: { color: 'white', fontWeight: '700' },
  descLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  descLabel: { color: '#94A3B8', fontWeight: '900', fontSize: 10, letterSpacing: 2 },
  uraianInput: {
    backgroundColor: COLORS.darkBg, padding: 24, borderRadius: 32, color: 'white',
    fontWeight: '700', fontSize: 18, height: 240, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    textAlignVertical: 'top',
  },
  photoCountPill: {
    backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  photoCountText: { color: COLORS.primary, fontWeight: '900', fontSize: 9, letterSpacing: -0.3 },
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, paddingHorizontal: 8 },
  cameraBtn: {
    width: ITEM_WIDTH, aspectRatio: 1, backgroundColor: COLORS.primarySolid, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primarySolid, shadowOpacity: 0.4, shadowRadius: 15, elevation: 8,
  },
  addPhotoBtn: {
    width: ITEM_WIDTH, aspectRatio: 1, backgroundColor: COLORS.darkSurface, borderRadius: 32,
    borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  imageThumb: {
    width: ITEM_WIDTH, aspectRatio: 1, borderRadius: 32, overflow: 'hidden',
    backgroundColor: COLORS.darkSurface,
  },
  imageThumbImg: { width: '100%', height: '100%' },
  removeImageBtn: {
    position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)',
    width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
  },
  cloudAssetBadge: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.primarySolid, paddingVertical: 4, alignItems: 'center',
  },
  cloudAssetText: { fontSize: 7, color: 'white', fontWeight: '900', letterSpacing: -0.3, textTransform: 'uppercase' },
  submitSection: { marginTop: 32 },
  submitBtnWrapper: {
    backgroundColor: COLORS.darkSurface, paddingVertical: 32, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  submitBtnGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 48 },
  submitBtnContent: { flexDirection: 'row', alignItems: 'center' },
  submitBtnText: { color: 'white', fontWeight: '900', fontSize: 20, letterSpacing: 4, marginRight: 16 },
  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', zIndex: 100,
  },
  loadingCard: {
    backgroundColor: 'rgba(15,23,42,0.9)', padding: 48, borderRadius: 56,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center',
  },
  loadingOverlayText: { color: 'white', marginTop: 24, fontWeight: '900', fontSize: 10, letterSpacing: 6, textTransform: 'uppercase' },
});
