import React, { useState, useCallback } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, ActivityIndicator } from '../../tw';
import { Modal, Alert, StatusBar, StyleSheet, Linking } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useKegiatanById, useDeleteKegiatan } from '../../hooks/useKegiatan';
import { MapPin, Calendar, ChevronLeft, Trash2, ShieldAlert, Image as ImageIcon, Send, Pencil, AlertCircle, X } from 'lucide-react-native';
import { Animated } from '../../tw/animated';
import { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { haptics } from '../../services/haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TYPOGRAPHY, BUTTON, COLORS as T, RADIUS, SPACING } from '../../tokens';

// Destructive action fill: white label on this red passes WCAG AA
const DANGER_SOLID = '#E11D48';

export default function KegiatanDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: kegiatan, isLoading, error } = useKegiatanById(Number(id));
  const deleteMutation = useDeleteKegiatan();

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const goBack = useCallback(() => {
    try { router.back(); } catch { router.replace('/(tabs)'); }
  }, []);

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
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={T.primary} size="large" />
      </View>
    );
  }

  if (error || !kegiatan) {
    return (
      <View style={styles.errorScreen}>
        <ShieldAlert color="#FCA5A5" size={48} style={{ marginBottom: SPACING.lg }} />
        <Text style={styles.errorTitle}>Terjadi kesalahan</Text>
        <Text style={styles.errorDesc}>Data tidak ditemukan atau Anda tidak memiliki akses.</Text>
        <TouchableOpacity onPress={goBack} style={styles.errorBtn} accessibilityRole="button">
          <Text style={styles.errorBtnText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Helper to get correct image URL
  const getImageUrl = (url: string) => {
    if (!url) return '';
    // Already production domain
    if (url.includes('pertamak.cianjur.space')) return url;
    // Replace localhost with production domain
    if (url.includes('localhost')) {
      return url.replace('http://localhost:8000', 'https://pertamak.cianjur.space');
    }
    return url;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 120 }}
        scrollEventThrottle={16}
      >
        {/* Custom Header Sticky */}
        <View style={[styles.customHeader, { paddingTop: Math.max(insets.top, 16) + 8, paddingBottom: SPACING.lg }]}>
          <TouchableOpacity onPress={goBack} style={styles.headerBtn} accessibilityRole="button" accessibilityLabel="Kembali">
            <ChevronLeft color={T.text} size={22} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail laporan</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => router.push(`/kegiatan/create?id=${id}`)}
              style={styles.headerBtn}
              accessibilityRole="button"
              accessibilityLabel="Ubah laporan"
            >
              <Pencil color={T.primary} size={18} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                haptics.impactMedium();
                setShowConfirmDelete(true);
              }}
              style={styles.headerBtn}
              accessibilityRole="button"
              accessibilityLabel="Hapus laporan"
            >
              <Trash2 color={T.rose} size={18} />
            </TouchableOpacity>
          </View>
        </View>
        {/* Poster Image or Gallery */}
        <Animated.View entering={FadeInDown} style={styles.posterSection}>
          {kegiatan.media && kegiatan.media.length > 0 ? (
            <TouchableOpacity
              onPress={() => setPreviewImage(getImageUrl(kegiatan.media![0].original_url))}
              accessibilityRole="imagebutton"
              accessibilityLabel="Perbesar foto"
            >
              <View style={styles.posterFrame}>
                <Image
                  source={{ uri: getImageUrl(kegiatan.media[0].original_url) }}
                  style={styles.posterImage}
                  resizeMode="cover"
                />
                <View style={styles.photoCountBadge}>
                  <ImageIcon color="white" size={14} style={{ marginRight: 6 }} />
                  <Text style={styles.photoCountText}>{kegiatan.media.length} foto</Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.noPhotoBox}>
              <Text style={styles.noPhotoText}>Tidak ada dokumentasi foto</Text>
            </View>
          )}
        </Animated.View>

        {/* Content Section */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.contentSection}>
          <View style={styles.contentCard}>
            <View style={styles.dateRow}>
              <View style={{ flex: 1, paddingRight: SPACING.lg }}>
                <Text style={styles.sectionLabel}>Waktu kegiatan</Text>
                <View style={styles.dateValueRow}>
                  <Calendar color={T.textSecondary} size={18} style={{ marginRight: SPACING.md }} />
                  <Text style={[styles.dateValue, { flex: 1 }]} numberOfLines={1} adjustsFontSizeToFit>
                    {kegiatan.hari}, {new Date(kegiatan.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </Text>
                </View>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Terlapor</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.uraianSection}>
              <Text style={styles.sectionLabel}>Uraian laporan</Text>
              <Text style={styles.uraianText}>{kegiatan.uraian_kegiatan}</Text>
            </View>

            <View>
              <Text style={styles.sectionLabel}>Titik lokasi</Text>
              <View style={styles.locationCard}>
                <MapPin color={T.textSecondary} size={20} style={{ marginRight: SPACING.md }} />
                <View style={styles.locationInfo}>
                  <Text style={styles.locationName}>{kegiatan.lokasi}</Text>
                  {kegiatan.latitude && (
                    <Text style={styles.locationCoords}>
                      Lat: {kegiatan.latitude.toFixed(6)}, Lon: {kegiatan.longitude?.toFixed(6)}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.shareBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Buka lokasi di Google Maps"
                  onPress={() => {
                    if (kegiatan.latitude && kegiatan.longitude) {
                      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${kegiatan.latitude},${kegiatan.longitude}`);
                    } else {
                      Alert.alert('Lokasi Tidak Tersedia', 'Data koordinat (Lat/Lon) tidak ditemukan untuk titik lokasi ini.');
                    }
                  }}
                >
                  <Send color={T.primary} size={18} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Full Gallery Section */}
          {kegiatan.media && kegiatan.media.length > 1 && (
            <View style={styles.gallerySection}>
              <Text style={[styles.sectionLabel, { marginLeft: 2 }]}>Semua dokumentasi</Text>
              <View style={styles.galleryGrid}>
                {kegiatan.media.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.galleryItem}
                    accessibilityRole="imagebutton"
                    accessibilityLabel={`Perbesar foto ${idx + 1}`}
                    onPress={() => setPreviewImage(getImageUrl(item.original_url))}
                  >
                    <Image
                      source={{ uri: getImageUrl(item.original_url) }}
                      style={styles.galleryImage}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Image Preview Modal */}
      <Modal
        visible={!!previewImage}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <View style={styles.previewOverlay}>
          <View style={styles.previewModal}>
            <View style={styles.previewHeader}>
              <TouchableOpacity
                onPress={() => setPreviewImage(null)}
                style={styles.previewCloseBtn}
                accessibilityRole="button"
                accessibilityLabel="Tutup pratinjau"
              >
                <X color="white" size={22} />
              </TouchableOpacity>
            </View>
            <Image source={{ uri: previewImage ?? undefined }} style={styles.previewFullImage} resizeMode="contain" />
          </View>
        </View>
      </Modal>

      {/* Custom Confirmation Modal */}
      <Modal
        visible={showConfirmDelete}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmDelete(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModal}>
            <Animated.View entering={ZoomIn}>
              <AlertCircle color={DANGER_SOLID} size={40} strokeWidth={1.75} style={{ marginBottom: SPACING.lg }} />
            </Animated.View>

            <Text style={styles.deleteTitle}>Hapus laporan?</Text>
            <Text style={styles.deleteDesc}>Data yang sudah dihapus tidak dapat dipulihkan kembali. Lanjutkan?</Text>

            <View style={styles.deleteActions}>
              <TouchableOpacity onPress={() => setShowConfirmDelete(false)} style={styles.cancelBtn} accessibilityRole="button">
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDelete} disabled={isDeleting} style={styles.confirmDeleteBtn} accessibilityRole="button">
                {isDeleting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.confirmDeleteText}>Ya, hapus</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Back Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity onPress={goBack} activeOpacity={0.9} accessibilityRole="button" style={styles.backButton}>
          <ChevronLeft color="white" size={20} style={{ marginRight: SPACING.xs }} />
          <Text style={styles.backButtonText}>Kembali ke daftar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.darkBg },
  loadingScreen: { flex: 1, backgroundColor: T.darkBg, alignItems: 'center', justifyContent: 'center' },
  errorScreen: { flex: 1, backgroundColor: T.darkBg, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl },
  errorTitle: { color: T.text, ...TYPOGRAPHY.heading, textAlign: 'center', marginBottom: SPACING.sm },
  errorDesc: { color: T.textSecondary, ...TYPOGRAPHY.body, textAlign: 'center', marginBottom: SPACING.xxxl },
  errorBtn: {
    backgroundColor: T.primaryDeep, height: BUTTON.primary.height, minWidth: 140, paddingHorizontal: SPACING.xxl,
    borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center',
  },
  errorBtnText: { color: 'white', ...TYPOGRAPHY.bodySecondary },
  customHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    backgroundColor: T.darkBg,
    borderBottomWidth: 1, borderBottomColor: T.darkBorder,
  },
  headerTitle: { color: T.text, ...TYPOGRAPHY.subheading },
  headerBtn: {
    width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
    backgroundColor: T.darkSurface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: T.darkBorder,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  scrollView: { flex: 1 },
  posterSection: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl, marginTop: SPACING.lg },
  posterFrame: {
    borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: T.darkBorder, backgroundColor: T.darkSurface,
  },
  posterImage: { width: '100%', height: 260 },
  photoCountBadge: {
    position: 'absolute', bottom: SPACING.md, right: SPACING.md, backgroundColor: 'rgba(2,6,23,0.75)',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.sm,
    flexDirection: 'row', alignItems: 'center',
  },
  photoCountText: { color: 'white', ...TYPOGRAPHY.badge },
  noPhotoBox: {
    width: '100%', height: 120, backgroundColor: T.darkSurface, borderRadius: RADIUS.lg,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: T.darkBorder,
  },
  noPhotoText: { color: T.textSecondary, ...TYPOGRAPHY.caption },
  contentSection: { paddingHorizontal: SPACING.lg, paddingBottom: 160 },
  contentCard: {
    backgroundColor: T.darkSurface, borderRadius: RADIUS.lg, borderWidth: 1,
    borderColor: T.darkBorder, padding: SPACING.xl,
  },
  dateRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: SPACING.xl },
  sectionLabel: { color: T.textSecondary, ...TYPOGRAPHY.sectionLabel, marginBottom: SPACING.sm },
  dateValueRow: { flexDirection: 'row', alignItems: 'center' },
  dateValue: { color: T.text, ...TYPOGRAPHY.subheading },
  statusBadge: {
    backgroundColor: T.darkBg, paddingHorizontal: SPACING.md, paddingVertical: 4,
    borderRadius: RADIUS.sm, borderWidth: 1, borderColor: T.darkBorder,
  },
  statusText: { color: T.emerald, ...TYPOGRAPHY.badge, textAlign: 'center' },
  divider: { height: 1, backgroundColor: T.darkBorder, marginBottom: SPACING.xl },
  uraianSection: { marginBottom: SPACING.xl },
  uraianText: { color: '#CBD5E1', ...TYPOGRAPHY.body },
  locationCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: T.darkBg,
    padding: SPACING.lg, borderRadius: RADIUS.md, borderWidth: 1, borderColor: T.darkBorder,
  },
  locationInfo: { flex: 1 },
  locationName: { color: T.text, ...TYPOGRAPHY.bodySecondary, marginBottom: 2 },
  locationCoords: { color: T.textTertiary, ...TYPOGRAPHY.caption },
  shareBtn: {
    width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: T.darkBorder, marginLeft: SPACING.sm,
  },
  gallerySection: { marginTop: SPACING.xxl },
  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  galleryItem: {
    width: '47%', aspectRatio: 1, borderRadius: RADIUS.md, overflow: 'hidden',
    borderWidth: 1, borderColor: T.darkBorder,
  },
  galleryImage: { width: '100%', height: '100%' },
  modalOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(2,6,23,0.8)', paddingHorizontal: SPACING.xxl },
  deleteModal: {
    backgroundColor: T.darkSurface, borderRadius: RADIUS.lg, borderWidth: 1,
    borderColor: T.darkBorder, padding: SPACING.xxl, width: '100%', alignItems: 'center',
  },
  deleteTitle: { color: T.text, ...TYPOGRAPHY.heading, textAlign: 'center', marginBottom: SPACING.sm },
  deleteDesc: { color: T.textSecondary, ...TYPOGRAPHY.body, textAlign: 'center', marginBottom: SPACING.xxl },
  deleteActions: { flexDirection: 'row', gap: SPACING.md, width: '100%' },
  cancelBtn: {
    flex: 1, height: BUTTON.primary.height, backgroundColor: T.darkBg, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: T.darkBorder, alignItems: 'center', justifyContent: 'center',
  },
  cancelBtnText: { color: T.textSecondary, ...TYPOGRAPHY.bodySecondary },
  confirmDeleteBtn: {
    flex: 1, height: BUTTON.primary.height, backgroundColor: DANGER_SOLID, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  confirmDeleteText: { color: 'white', ...TYPOGRAPHY.bodySecondary },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg,
    backgroundColor: T.darkBg, borderTopWidth: 1, borderTopColor: T.darkBorder,
  },
  backButton: {
    height: BUTTON.primary.height, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', backgroundColor: T.primaryDeep,
  },
  backButtonText: { color: 'white', ...TYPOGRAPHY.subheading },

  previewOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' },
  previewModal: { flex: 1 },
  previewHeader: { position: 'absolute', top: 60, right: SPACING.lg, zIndex: 10 },
  previewCloseBtn: {
    width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: RADIUS.md,
  },
  previewFullImage: { width: '100%', height: '90%', marginTop: 80 },
});
