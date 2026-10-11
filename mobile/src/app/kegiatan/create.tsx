import React, { useState, useEffect, useCallback, useRef } from 'react';
import { KeyboardAvoidingView, Platform, Alert, Dimensions, Modal, TextInput as RNTextInput, StatusBar, StyleSheet, Keyboard, ScrollView as RNScrollView } from 'react-native';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from '../../tw';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Camera, MapPin, Calendar, X, Plus, ChevronLeft, Map as MapIcon, Send, RefreshCcw, FileText } from 'lucide-react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useCreateKegiatan, useUpdateKegiatan, useKegiatanById } from '../../hooks/useKegiatan';
import { haptics } from '../../services/haptics';
import logger from '../../lib/logger';
import { Animated } from '../../tw/animated';
import { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { TYPOGRAPHY, BUTTON, COLORS, RADIUS, SPACING } from '../../tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

  const goBack = useCallback(() => {
    try { router.back(); } catch { router.replace('/(tabs)'); }
  }, []);
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ lokasi?: string; uraian?: string }>({});
  const submittingRef = useRef(false);
  const scrollRef = useRef<RNScrollView>(null);
  const uraianSectionY = useRef(0);

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
    if (errors.lokasi) setErrors(prev => ({ ...prev, lokasi: undefined }));
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
        logger.warn('Geocoding error');
      }
    } catch (e) {
      logger.warn('Detection failed:', e);
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
    if (submittingRef.current) return;
    const nextErrors: { lokasi?: string; uraian?: string } = {};
    if (!lokasi.trim()) nextErrors.lokasi = 'Lokasi wajib diisi.';
    if (!uraian.trim()) nextErrors.uraian = 'Uraian kegiatan wajib diisi.';
    setErrors(nextErrors);
    if (nextErrors.lokasi || nextErrors.uraian) {
      if (nextErrors.lokasi) {
        // Lokasi sits at the top, so jump back to it.
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      } else {
        scrollRef.current?.scrollTo({ y: uraianSectionY.current - 16, animated: true });
      }
      return;
    }
    submittingRef.current = true;
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
      goBack();
    } catch (e: any) {
      logger.error(e, 'Submit failed');
      Alert.alert('Gagal Menyimpan', 'Laporan belum terkirim. Periksa koneksi Anda lalu coba lagi.');
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (isEdit && isLoadingPrev) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={styles.loadingText}>Memuat...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.headerWrapper}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => goBack()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
          >
            <ChevronLeft color={COLORS.text} size={24} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerLabel}>{isEdit ? 'Ubah jurnal' : 'Jurnal kegiatan'}</Text>
            <Text style={styles.headerTitle}>{isEdit ? 'Ubah kegiatan' : 'Laporan baru'}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      {/* Date */}
      <View style={styles.pillWrapper}>
        <Animated.View entering={ZoomIn.delay(300)} style={styles.datePill}>
          <Calendar color={COLORS.textSecondary} size={16} style={{ marginRight: SPACING.md }} />
          <Text style={styles.datePillText}>{format(new Date(tanggal), 'EEEE, dd MMMM yyyy', { locale: localeId })}</Text>
        </Animated.View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <RNScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ paddingBottom: 150, paddingTop: SPACING.xxl, paddingHorizontal: SPACING.xxl }}
        >
          {/* Section 1: Lokasi */}
          <Animated.View entering={FadeInDown.delay(100)} style={[styles.section, { zIndex: 100 }]}>
            <Text style={styles.sectionTitle}>Di mana Anda bekerja?</Text>

            <View style={styles.formCard}>
              <View style={styles.gpsRow}>
                <TouchableOpacity
                  onPress={detectLocation}
                  disabled={isLocating}
                  style={styles.iconTapTarget}
                  accessibilityRole="button"
                  accessibilityLabel="Deteksi ulang lokasi"
                  accessibilityState={{ disabled: isLocating, busy: isLocating }}
                >
                  {isLocating ? <ActivityIndicator size="small" color={COLORS.primary} /> : <RefreshCcw color={COLORS.textSecondary} size={16} />}
                </TouchableOpacity>
              </View>

              {/* Image Preview Modal */}
              <Modal
                visible={!!previewImage}
                transparent
                animationType="fade"
                onRequestClose={() => setPreviewImage(null)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.previewModal}>
                    <View style={styles.previewHeader}>
                      <TouchableOpacity
                        onPress={() => setPreviewImage(null)}
                        style={styles.previewCloseBtn}
                        accessibilityRole="button"
                        accessibilityLabel="Tutup pratinjau"
                      >
                        <X color={COLORS.text} size={24} />
                      </TouchableOpacity>
                    </View>
                    <Image source={{ uri: previewImage ?? undefined }} style={styles.previewImage} resizeMode="contain" />
                  </View>
                </View>
              </Modal>

              <View style={{ position: 'relative' }}>
                <View style={styles.locationInputRow}>
                  <MapPin color={COLORS.textSecondary} size={20} style={{ marginRight: SPACING.md }} />
                  <RNTextInput
                    value={lokasi}
                    onChangeText={handleLocationChange}
                    placeholder="Cari lokasi atau ketik..."
                    placeholderTextColor={COLORS.textTertiary}
                    underlineColorAndroid="transparent"
                    style={styles.locationInput}
                    accessibilityLabel="Lokasi kegiatan"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                </View>
                {errors.lokasi && <Text style={styles.fieldError} accessibilityLiveRegion="polite">{errors.lokasi}</Text>}

                {suggestions.length > 0 && (
                  <Animated.View entering={FadeInUp} style={styles.suggestionsBox}>
                    {suggestions.map((p, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => selectPlace(p)}
                        style={styles.suggestionItem}
                        accessibilityRole="button"
                        accessibilityLabel={`Pilih lokasi ${p}`}
                      >
                        <MapIcon color={COLORS.textSecondary} size={16} style={{ marginRight: SPACING.md }} />
                        <Text style={styles.suggestionText} numberOfLines={1}>{p}</Text>
                      </TouchableOpacity>
                    ))}
                  </Animated.View>
                )}
              </View>
            </View>
          </Animated.View>

          {/* Section 2: Uraian */}
          <Animated.View
            entering={FadeInDown.delay(200)}
            style={[styles.section, { zIndex: 1 }]}
            onLayout={e => { uraianSectionY.current = e.nativeEvent.layout.y; }}
          >
            <Text style={styles.sectionTitle}>Apa yang dilakukan?</Text>

            <View style={styles.formCard}>
              <View style={styles.descLabelRow}>
                <FileText color={COLORS.textSecondary} size={16} style={{ marginRight: SPACING.md }} />
                <Text style={styles.descLabel}>Deskripsi rinci</Text>
              </View>
              <RNTextInput
                multiline
                numberOfLines={8}
                value={uraian}
                onChangeText={text => {
                  setUraian(text);
                  if (errors.uraian) setErrors(prev => ({ ...prev, uraian: undefined }));
                }}
                onFocus={() => {
                  // Keep the textarea above the keyboard once it opens.
                  setTimeout(() => scrollRef.current?.scrollTo({ y: uraianSectionY.current - 16, animated: true }), 250);
                }}
                placeholder="Ketik rincian pekerjaan Anda di sini..."
                placeholderTextColor={COLORS.textTertiary}
                textAlignVertical="top"
                underlineColorAndroid="transparent"
                style={styles.uraianInput}
                accessibilityLabel="Uraian kegiatan"
                autoCapitalize="sentences"
              />
              {errors.uraian && <Text style={styles.fieldError} accessibilityLiveRegion="polite">{errors.uraian}</Text>}
            </View>
          </Animated.View>

          {/* Section 3: Dokumentasi */}
          <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
            <View style={styles.sectionHeaderBetween}>
              <Text style={styles.sectionTitle}>Bukti lapangan</Text>
              <View style={styles.photoCountPill}>
                <Text style={styles.photoCountText}>{images.length}/5 foto</Text>
              </View>
            </View>

            <View style={styles.mediaGrid}>
              <TouchableOpacity
                onPress={takePhoto}
                style={styles.cameraBtn}
                accessibilityRole="button"
                accessibilityLabel="Ambil foto dengan kamera"
              >
                <Camera color={COLORS.primary} size={24} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={pickImage}
                style={styles.addPhotoBtn}
                accessibilityRole="button"
                accessibilityLabel="Pilih foto dari galeri"
              >
                <Plus color={COLORS.primary} size={24} />
              </TouchableOpacity>

              {images.map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setPreviewImage(img.uri)}
                  style={styles.imageThumb}
                  accessibilityRole="imagebutton"
                  accessibilityLabel={`Pratinjau foto ${idx + 1}`}
                >
                  <Image source={{ uri: img.uri }} style={styles.imageThumbImg} />
                  <TouchableOpacity
                    onPress={() => removeImage(idx)}
                    style={styles.removeImageBtn}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Hapus foto ${idx + 1}`}
                  >
                    <X color={COLORS.text} size={14} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Submit */}
          <Animated.View entering={FadeInUp.delay(500)} style={styles.submitSection}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={styles.submitBtn}
              accessibilityRole="button"
              accessibilityLabel={isEdit ? 'Simpan perubahan' : 'Kirim laporan'}
              accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
            >
              <View style={styles.submitBtnContent}>
                {isSubmitting ? (
                  <ActivityIndicator color="white" size="small" style={{ marginRight: SPACING.md }} />
                ) : null}
                <Text style={styles.submitBtnText}>
                  {isSubmitting ? 'Mengirim...' : isEdit ? 'Simpan perubahan' : 'Kirim laporan'}
                </Text>
                {!isSubmitting && <Send color="white" size={18} style={{ marginLeft: SPACING.md }} />}
              </View>
            </TouchableOpacity>
          </Animated.View>
        </RNScrollView>
      </KeyboardAvoidingView>

      {/* Full Screen Loading Overlay */}
      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator color={COLORS.primary} size="large" />
            <Text style={styles.loadingOverlayText}>Mengunggah data...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const ITEM_WIDTH = (SCREEN_WIDTH - 48 - 32) / 3; // 3 columns with gaps

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.darkBg },
  loadingScreen: { flex: 1, backgroundColor: COLORS.darkBg, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: COLORS.textSecondary, marginTop: SPACING.lg, ...TYPOGRAPHY.caption },
  headerWrapper: {
    paddingTop: 64, paddingHorizontal: SPACING.xxl, paddingBottom: SPACING.lg,
    backgroundColor: COLORS.darkBg, borderBottomWidth: 1, borderBottomColor: COLORS.darkBorder,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: {
    width: 44, height: 44, borderRadius: RADIUS.md,
    backgroundColor: COLORS.darkSurface, borderWidth: 1, borderColor: COLORS.darkBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center' },
  headerSpacer: { width: 44 },
  headerLabel: { color: COLORS.textSecondary, ...TYPOGRAPHY.caption, marginBottom: SPACING.xs },
  headerTitle: { color: COLORS.text, ...TYPOGRAPHY.subheading },
  pillWrapper: { paddingTop: SPACING.lg, paddingHorizontal: SPACING.xxl },
  datePill: {
    backgroundColor: COLORS.darkSurface, borderRadius: RADIUS.md, paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.darkBorder,
  },
  datePillText: { color: COLORS.text, ...TYPOGRAPHY.label },
  section: { marginBottom: SPACING.xxxl },
  sectionTitle: { color: COLORS.text, ...TYPOGRAPHY.subheading, marginBottom: SPACING.lg },
  sectionHeaderBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg },
  formCard: {
    backgroundColor: COLORS.darkSurface, padding: SPACING.lg,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.darkBorder,
  },
  gpsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginBottom: SPACING.sm },
  iconTapTarget: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  fieldError: { color: COLORS.rose, ...TYPOGRAPHY.caption, marginTop: SPACING.sm },
  locationInputRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.darkBg,
    paddingHorizontal: SPACING.lg, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.darkBorder, height: 52,
  },
  locationInput: { flex: 1, height: '100%', color: COLORS.text, ...TYPOGRAPHY.body },
  suggestionsBox: {
    position: 'absolute', top: 60, left: 0, right: 0, zIndex: 50,
    backgroundColor: COLORS.darkSurface, borderRadius: RADIUS.md, borderWidth: 1,
    borderColor: COLORS.darkBorder, overflow: 'hidden',
  },
  suggestionItem: {
    minHeight: 44, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.darkBorder, flexDirection: 'row', alignItems: 'center',
  },
  suggestionText: { flex: 1, color: COLORS.text, ...TYPOGRAPHY.bodySecondary },
  descLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  descLabel: { color: COLORS.textSecondary, ...TYPOGRAPHY.label },
  uraianInput: {
    backgroundColor: COLORS.darkBg, padding: SPACING.lg, borderRadius: RADIUS.md, color: COLORS.text,
    ...TYPOGRAPHY.body, height: 240, borderWidth: 1, borderColor: COLORS.darkBorder,
    textAlignVertical: 'top',
  },
  photoCountPill: {
    backgroundColor: COLORS.darkSurface, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.darkBorder,
  },
  photoCountText: { color: COLORS.textSecondary, ...TYPOGRAPHY.badge },
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.lg },
  cameraBtn: {
    width: ITEM_WIDTH, aspectRatio: 1, backgroundColor: COLORS.darkSurface, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.darkBorder, alignItems: 'center', justifyContent: 'center',
  },
  addPhotoBtn: {
    width: ITEM_WIDTH, aspectRatio: 1, backgroundColor: COLORS.darkSurface, borderRadius: RADIUS.md,
    borderWidth: 1, borderStyle: 'dashed', borderColor: COLORS.darkBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  imageThumb: {
    width: ITEM_WIDTH, aspectRatio: 1, borderRadius: RADIUS.md, overflow: 'hidden',
    backgroundColor: COLORS.darkSurface,
  },
  imageThumbImg: { width: '100%', height: '100%' },
  removeImageBtn: {
    position: 'absolute', top: SPACING.sm, right: SPACING.sm, backgroundColor: 'rgba(0,0,0,0.6)',
    width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
  },
  submitSection: { marginTop: SPACING.xxl },
  submitBtn: {
    height: BUTTON.primary.height, borderRadius: BUTTON.primary.borderRadius,
    backgroundColor: COLORS.primaryDeep, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  submitBtnContent: { flexDirection: 'row', alignItems: 'center' },
  submitBtnText: { color: 'white', fontSize: BUTTON.primary.fontSize, fontWeight: BUTTON.primary.fontWeight },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(2,6,23,0.9)', justifyContent: 'center' },
  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', zIndex: 100,
    backgroundColor: 'rgba(2,6,23,0.7)',
  },
  loadingCard: {
    backgroundColor: COLORS.darkSurface, paddingVertical: SPACING.xxl, paddingHorizontal: SPACING.xxxl,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.darkBorder, alignItems: 'center',
  },
  loadingOverlayText: { color: COLORS.text, marginTop: SPACING.lg, ...TYPOGRAPHY.bodySecondary },
  previewModal: { flex: 1, justifyContent: 'center' },
  previewHeader: { position: 'absolute', top: 40, right: SPACING.lg, zIndex: 10 },
  previewCloseBtn: {
    width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.darkSurface,
    borderWidth: 1, borderColor: COLORS.darkBorder, alignItems: 'center', justifyContent: 'center',
  },
  previewImage: { width: '100%', height: '80%' },
});
