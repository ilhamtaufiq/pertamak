import React, { useState, useCallback } from 'react';
import { ScrollView, View, Text, Image, LinearGradient, BlurView, TouchableOpacity, ActivityIndicator } from '../../tw';
import { Modal, Alert, StatusBar, Dimensions, StyleSheet, Linking } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useKegiatanById, useDeleteKegiatan } from '../../hooks/useKegiatan';
import { MapPin, Calendar, ChevronLeft, Trash2, ShieldAlert, Image as ImageIcon, Send, Pencil, AlertCircle, CheckCircle2, X } from 'lucide-react-native';
import { Animated } from '../../tw/animated';
import { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { haptics } from '../../services/haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#38BDF8',
  primarySolid: '#0EA5E9',
  darkBg: '#020617',
  darkSurface: '#0F172A',
  emerald: '#10B981',
  rose: '#FB7185',
};

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
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (error || !kegiatan) {
    return (
      <View style={styles.errorScreen}>
        <ShieldAlert color="#F87171" size={64} style={{ marginBottom: 16 }} />
        <Text style={styles.errorTitle}>Terjadi Kesalahan</Text>
        <Text style={styles.errorDesc}>Data tidak ditemukan atau Anda tidak memiliki akses.</Text>
        <TouchableOpacity onPress={goBack} style={styles.errorBtn}>
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

      <LinearGradient
        colors={[COLORS.darkBg, COLORS.darkSurface]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 120 }}
        scrollEventThrottle={16}
      >
        {/* Custom Header Sticky */}
        <View style={[styles.customHeader, { paddingTop: Math.max(insets.top, 16) + 8, paddingBottom: 16 }]}>
          <TouchableOpacity onPress={goBack} style={styles.headerBtn}>
            <ChevronLeft color="white" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Laporan</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => router.push(`/kegiatan/create?id=${id}`)}
              style={styles.headerEditBtn}
            >
              <Pencil color={COLORS.primary} size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                haptics.impactMedium();
                setShowConfirmDelete(true);
              }}
              style={styles.headerDeleteBtn}
            >
              <Trash2 color={COLORS.rose} size={20} />
            </TouchableOpacity>
          </View>
        </View>
        {/* Poster Image or Gallery */}
        <Animated.View entering={FadeInDown} style={styles.posterSection}>
          {kegiatan.media && kegiatan.media.length > 0 ? (
            <TouchableOpacity onPress={() => setPreviewImage(getImageUrl(kegiatan.media[0].original_url))}>
            <View style={styles.posterShadow}>
              <Image
                source={{ uri: getImageUrl(kegiatan.media[0].original_url) }}
                style={styles.posterImage}
                resizeMode="cover"
              />
              <View style={styles.photoCountBadge}>
                <ImageIcon color="white" size={16} style={{ marginRight: 8 }} />
                <Text style={styles.photoCountText}>{kegiatan.media.length} Foto</Text>
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
              <View style={{ flex: 1, paddingRight: 16 }}>
                <Text style={styles.sectionLabel}>WAKTU KEGIATAN</Text>
                <View style={styles.dateValueRow}>
                  <Calendar color="white" size={20} style={{ marginRight: 12 }} />
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
              <Text style={styles.sectionLabel}>URAIAN LAPORAN</Text>
              <Text style={styles.uraianText}>{kegiatan.uraian_kegiatan}</Text>
            </View>

            <View>
              <Text style={styles.sectionLabel}>TITIK LOKASI</Text>
              <View style={styles.locationCard}>
                <MapPin color={COLORS.primary} size={24} style={{ marginRight: 16 }} />
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
                  onPress={() => {
                    if (kegiatan.latitude && kegiatan.longitude) {
                      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${kegiatan.latitude},${kegiatan.longitude}`);
                    } else {
                      Alert.alert('Lokasi Tidak Tersedia', 'Data koordinat (Lat/Lon) tidak ditemukan untuk titik lokasi ini.');
                    }
                  }}
                >
                  <Send color={COLORS.primary} size={20} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Full Gallery Section */}
          {kegiatan.media && kegiatan.media.length > 1 && (
            <View style={styles.gallerySection}>
              <Text style={styles.galleryLabel}>SEMUA DOKUMENTASI</Text>
              <View style={styles.galleryGrid}>
                {kegiatan.media.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.galleryItem}
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
          <BlurView intensity={20} tint="dark" style={styles.previewModal}>
            <View style={styles.previewHeader}>
              <TouchableOpacity onPress={() => setPreviewImage(null)} style={styles.previewCloseBtn}>
                <X color="white" size={24} />
              </TouchableOpacity>
            </View>
            <Image source={{ uri: previewImage }} style={styles.previewFullImage} resizeMode="contain" />
          </BlurView>
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
          <BlurView intensity={20} tint="dark" style={styles.deleteModal}>
            <Animated.View entering={ZoomIn}>
              <View style={styles.deleteIconBox}>
                <AlertCircle color={COLORS.rose} size={48} />
              </View>
            </Animated.View>

            <Text style={styles.deleteTitle}>Hapus Laporan?</Text>
            <Text style={styles.deleteDesc}>Data yang sudah dihapus tidak dapat dipulihkan kembali. Lanjutkan?</Text>

            <View style={styles.deleteActions}>
              <TouchableOpacity onPress={() => setShowConfirmDelete(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDelete} disabled={isDeleting} style={styles.confirmDeleteBtn}>
                {isDeleting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.confirmDeleteText}>Ya, Hapus</Text>
                )}
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>

      {/* Floating Back Button */}
      <BlurView intensity={20} tint="dark" style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <TouchableOpacity onPress={goBack} activeOpacity={0.9}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primarySolid]}
            style={styles.backButton}
          >
            <ChevronLeft color="white" size={24} style={{ marginRight: 8 }} />
            <Text style={styles.backButtonText}>Kembali ke Daftar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  loadingScreen: { flex: 1, backgroundColor: '#020617', alignItems: 'center', justifyContent: 'center' },
  errorScreen: { flex: 1, backgroundColor: '#020617', alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorTitle: { color: 'white', fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  errorDesc: { color: '#94A3B8', textAlign: 'center', marginBottom: 32 },
  errorBtn: { backgroundColor: '#0EA5E9', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 20 },
  errorBtnText: { color: 'white', fontWeight: '700' },
  customHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 16,
    backgroundColor: COLORS.darkBg,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: { color: 'white', fontWeight: '900', fontSize: 18 },
  headerBtn: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerEditBtn: { backgroundColor: 'rgba(56,189,248,0.1)', padding: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(56,189,248,0.2)' },
  headerDeleteBtn: { backgroundColor: 'rgba(244,63,94,0.1)', padding: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(244,63,94,0.2)' },
  scrollView: { flex: 1 },
  posterSection: { paddingHorizontal: 24, marginBottom: 32 },
  posterShadow: { boxShadow: '0px 0px 20px rgba(14, 165, 233, 0.2)', elevation: 10 },
  posterImage: { width: '100%', height: 320, borderRadius: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  photoCountBadge: {
    position: 'absolute', bottom: 24, right: 24, backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)', flexDirection: 'row', alignItems: 'center',
  },
  photoCountText: { color: 'white', fontWeight: '700' },
  noPhotoBox: {
    width: '100%', height: 160, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  noPhotoText: { color: '#475569', fontWeight: '700' },
  contentSection: { paddingHorizontal: 24, paddingBottom: 160 },
  contentCard: {
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 40, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)', padding: 32,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  sectionLabel: { color: '#38BDF8', fontWeight: '900', fontSize: 10, letterSpacing: 4, marginBottom: 12, textTransform: 'uppercase' },
  dateValueRow: { flexDirection: 'row', alignItems: 'center' },
  dateValue: { color: 'white', fontSize: 20, fontWeight: '700' },
  statusBadge: {
    backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
  },
  statusText: { color: '#34D399', fontWeight: '900', fontSize: 10, letterSpacing: -0.3, textTransform: 'uppercase', textAlign: 'center' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 32 },
  uraianSection: { marginBottom: 32 },
  uraianText: { color: '#CBD5E1', fontSize: 18, lineHeight: 28, fontWeight: '500' },
  locationCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.5)',
    padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  locationInfo: { flex: 1 },
  locationName: { color: 'white', fontWeight: '700', fontSize: 16, marginBottom: 4 },
  locationCoords: { color: '#475569', fontSize: 12, fontWeight: '500' },
  shareBtn: {
    backgroundColor: 'rgba(56,189,248,0.1)', padding: 12, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(56,189,248,0.2)', marginLeft: 8,
  },
  gallerySection: { marginTop: 32 },
  galleryLabel: { color: '#38BDF8', fontWeight: '900', fontSize: 10, letterSpacing: 4, marginBottom: 16, marginLeft: 8 },
  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  galleryItem: {
    width: '47%', aspectRatio: 1, borderRadius: 32, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  galleryImage: { width: '100%', height: '100%' },
  modalOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 32 },
  deleteModal: {
    backgroundColor: 'rgba(15,23,42,0.9)', borderRadius: 48, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)', padding: 40, width: '100%', alignItems: 'center',
  },
  deleteIconBox: {
    width: 96, height: 96, backgroundColor: 'rgba(244,63,94,0.2)', borderRadius: 48,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  deleteTitle: { color: 'white', fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  deleteDesc: { color: '#94A3B8', textAlign: 'center', marginBottom: 40, lineHeight: 24 },
  deleteActions: { flexDirection: 'row', gap: 16, width: '100%' },
  cancelBtn: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 20, borderRadius: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center',
  },
  cancelBtnText: { color: '#94A3B8', fontWeight: '900', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' },
  confirmDeleteBtn: {
    flex: 2, backgroundColor: '#EF4444', paddingVertical: 20, borderRadius: 24, alignItems: 'center',
    boxShadow: '0px 0px 15px rgba(239, 68, 68, 0.4)', elevation: 8,
  },
  confirmDeleteText: { color: 'white', fontWeight: '900', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24, paddingTop: 24,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    height: 64, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
    boxShadow: '0px 0px 15px rgba(14, 165, 233, 0.4)', elevation: 8,
  },
  backButtonText: { color: 'white', fontSize: 20, fontWeight: '900' },

  previewOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' },
  previewModal: { flex: 1 },
  previewHeader: { position: 'absolute', top: 60, right: 20, zIndex: 10 },
  previewCloseBtn: { padding: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24 },
  previewFullImage: { width: '100%', height: '90%', marginTop: 80 },
});
