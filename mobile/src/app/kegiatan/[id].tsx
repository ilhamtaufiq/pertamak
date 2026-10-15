import React, { useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from '../../tw';
import { ScrollView, Modal, Alert, StatusBar, StyleSheet, Linking, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useKegiatanById, useDeleteKegiatan } from '../../hooks/useKegiatan';
import { ChevronLeft, Trash2, Pencil, ShieldAlert, MapPin, Map as MapIcon, X, User, Share2 } from 'lucide-react-native';
import { haptics } from '../../services/haptics';
import { confirmAction } from '../../services/dialogs';
import { shareKegiatanPhoto } from '../../services/share';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TYPOGRAPHY, BUTTON, COLORS as T, RADIUS, SPACING } from '../../tokens';
import { toSecureMediaUrl } from '../../lib/mediaUrl';

const DANGER = '#E11D48';
// Keeps photos from stretching too wide on tablets and desktop web
const MAX_CONTENT_WIDTH = 640;

const toPublicUrl = toSecureMediaUrl;

export default function KegiatanDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = Math.min(windowWidth, MAX_CONTENT_WIDTH);
  const photoWidth = contentWidth - SPACING.xl * 2;
  const { data: kegiatan, isLoading, error } = useKegiatanById(Number(id));
  const deleteMutation = useDeleteKegiatan();

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isSharing, setIsSharing] = useState(false);

  const goBack = useCallback(() => {
    try { router.back(); } catch { router.replace('/(tabs)/kegiatan'); }
  }, [router]);

  const confirmDelete = async () => {
    setIsDeleting(true);
    haptics.impactHeavy();
    try {
      await deleteMutation.mutateAsync(Number(id));
      setShowConfirmDelete(false);
      router.replace('/(tabs)/kegiatan');
    } catch (e: any) {
      Alert.alert('Gagal menghapus', e.message || 'Laporan belum bisa dihapus. Periksa koneksi, lalu coba lagi.');
    } finally {
      setIsDeleting(false);
    }
  };

  const header = (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 4 }]}>
      <TouchableOpacity onPress={goBack} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Kembali">
        <ChevronLeft color={T.text} size={22} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Detail kegiatan</Text>
      {kegiatan ? (
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => router.push(`/kegiatan/create?id=${id}`)}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Ubah kegiatan"
          >
            <Pencil color={T.text} size={18} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              haptics.impactMedium();
              setShowConfirmDelete(true);
            }}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Hapus kegiatan"
          >
            <Trash2 color={DANGER} size={18} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.iconSpacer} />
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <StatusBar barStyle="light-content" />
        <Stack.Screen options={{ headerShown: false }} />
        {header}
        <View style={styles.centered}>
          <ActivityIndicator color={T.primary} />
        </View>
      </View>
    );
  }

  if (error || !kegiatan) {
    return (
      <View style={styles.centered}>
        <StatusBar barStyle="light-content" />
        <Stack.Screen options={{ headerShown: false }} />
        {header}
        <View style={styles.errorBox}>
          <ShieldAlert color={T.rose} size={40} />
          <Text style={styles.errorTitle}>Kegiatan tidak bisa dibuka</Text>
          <Text style={styles.errorDesc}>Data tidak ditemukan atau Anda tidak memiliki akses.</Text>
          <TouchableOpacity onPress={goBack} style={styles.primaryBtn} accessibilityRole="button">
            <Text style={styles.primaryBtnText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const photos = kegiatan.media ?? [];
  const tanggal = new Date(kegiatan.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const hasCoords = kegiatan.latitude != null && kegiatan.longitude != null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />
      {header}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 16 }}
      >
        {/* Photos: swipeable gallery */}
        {photos.length > 0 ? (
          <View style={styles.galleryWrap}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={photoWidth + SPACING.md}
              onMomentumScrollEnd={(e) => setPhotoIndex(Math.round(e.nativeEvent.contentOffset.x / (photoWidth + SPACING.md)))}
              decelerationRate="fast"
              contentContainerStyle={styles.galleryContent}
            >
              {photos.map((photo, idx) => (
                <TouchableOpacity
                  key={photo.id ?? idx}
                  onPress={() => setPreviewIndex(idx)}
                  accessibilityRole="imagebutton"
                  accessibilityLabel={`Perbesar foto ${idx + 1} dari ${photos.length}`}
                  style={[styles.photo, { width: photoWidth }]}
                >
                  <Image source={{ uri: toPublicUrl(photo.original_url) }} style={styles.photoImage} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </ScrollView>
            {photos.length > 1 && (
              <Text style={styles.photoCount}>Foto {photoIndex + 1} dari {photos.length} · geser untuk melihat</Text>
            )}
          </View>
        ) : (
          <View style={styles.noPhoto}>
            <Text style={styles.noPhotoText}>Belum ada foto dokumentasi</Text>
          </View>
        )}

        {/* Headline */}
        <View style={styles.section}>
          <Text style={styles.meta}>{kegiatan.hari}, {tanggal}</Text>
          <Text style={styles.headline}>{kegiatan.lokasi}</Text>
          <Text style={styles.body}>{kegiatan.uraian_kegiatan}</Text>
        </View>

        {/* Details as label-value rows */}
        <View style={styles.rows}>
          {kegiatan.user?.name && (
            <Row
              icon={User}
              label="Dicatat oleh"
              value={kegiatan.user.karyawan?.jabatan ? `${kegiatan.user.name} · ${kegiatan.user.karyawan.jabatan}` : kegiatan.user.name}
              last={!hasCoords}
            />
          )}
          {hasCoords && (
            <Row
              icon={MapPin}
              label="Koordinat"
              value={`${kegiatan.latitude!.toFixed(6)}, ${kegiatan.longitude!.toFixed(6)}`}
              last
            />
          )}
        </View>

        <TouchableOpacity
          onPress={async () => {
            const photo = photos[photoIndex];
            if (!photo) return;
            const ok = await confirmAction({
              title: 'Bagikan foto?',
              message: 'Foto yang sedang terlihat akan dibagikan. Caption disalin ke papan klip, tempel saat membuat postingan.',
              confirmText: 'Lanjut',
            });
            if (!ok) return;
            setIsSharing(true);
            try {
              await shareKegiatanPhoto(kegiatan, photo);
            } catch (e: any) {
              Alert.alert('Gagal membagikan', e.message || 'Coba lagi.');
            } finally {
              setIsSharing(false);
            }
          }}
          disabled={photos.length === 0 || isSharing}
          style={[styles.shareBtn, (photos.length === 0 || isSharing) && { opacity: 0.5 }]}
          accessibilityRole="button"
          accessibilityLabel="Bagikan foto"
        >
          {isSharing ? <ActivityIndicator color="white" /> : <Share2 color="white" size={18} />}
          <Text style={styles.shareBtnText}>{isSharing ? 'Menyiapkan...' : 'Bagikan'}</Text>
        </TouchableOpacity>
        {photos.length === 0 && (
          <Text style={styles.shareHint}>Tambahkan foto dokumentasi untuk membagikan kegiatan ini.</Text>
        )}

        {hasCoords && (
          <TouchableOpacity
            onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${kegiatan.latitude},${kegiatan.longitude}`)}
            style={styles.secondaryBtn}
            accessibilityRole="button"
            accessibilityLabel="Buka lokasi di Google Maps"
          >
            <MapIcon color={T.primary} size={18} />
            <Text style={styles.secondaryBtnText}>Buka di Google Maps</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Photo preview */}
      <Modal
        visible={previewIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewIndex(null)}
      >
        <View style={styles.previewOverlay}>
          <TouchableOpacity
            onPress={() => setPreviewIndex(null)}
            style={[styles.previewClose, { top: Math.max(insets.top, 16) + 8 }]}
            accessibilityRole="button"
            accessibilityLabel="Tutup pratinjau"
          >
            <X color="white" size={22} />
          </TouchableOpacity>
          {previewIndex !== null && photos[previewIndex] && (
            <Image
              source={{ uri: toPublicUrl(photos[previewIndex].original_url) }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        visible={showConfirmDelete}
        transparent
        animationType="fade"
        onRequestClose={() => !isDeleting && setShowConfirmDelete(false)}
      >
        <View style={styles.dialogOverlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Hapus kegiatan ini?</Text>
            <Text style={styles.dialogDesc}>Kegiatan dan foto dokumentasinya akan dihapus dan tidak bisa dipulihkan.</Text>
            <View style={styles.dialogActions}>
              <TouchableOpacity
                onPress={() => setShowConfirmDelete(false)}
                disabled={isDeleting}
                style={styles.dialogCancel}
                accessibilityRole="button"
              >
                <Text style={styles.dialogCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDelete}
                disabled={isDeleting}
                style={styles.dialogDelete}
                accessibilityRole="button"
              >
                {isDeleting ? <ActivityIndicator color="white" /> : <Text style={styles.dialogDeleteText}>Hapus</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Row({ icon: Icon, label, value, last }: { icon: any; label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Icon color={T.textSecondary} size={18} style={{ marginRight: SPACING.md, marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.darkBg },
  centered: { flex: 1, backgroundColor: T.darkBg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
  },
  headerTitle: { color: T.text, ...TYPOGRAPHY.subheading },
  headerActions: { flexDirection: 'row', gap: SPACING.sm },
  iconBtn: {
    width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: T.darkBorder, backgroundColor: T.darkSurface,
  },
  iconSpacer: { width: 44, height: 44 },

  galleryWrap: { marginBottom: SPACING.xl },
  galleryContent: { paddingHorizontal: SPACING.xl },
  photo: { aspectRatio: 4 / 3, borderRadius: RADIUS.lg, overflow: 'hidden', marginRight: SPACING.md, backgroundColor: T.darkSurface },
  photoImage: { width: '100%', height: '100%' },
  photoCount: { color: T.textSecondary, ...TYPOGRAPHY.caption, marginTop: SPACING.sm, marginLeft: SPACING.xl },
  noPhoto: {
    marginHorizontal: SPACING.xl, marginBottom: SPACING.xl, height: 120, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: T.darkBorder, backgroundColor: T.darkSurface, alignItems: 'center', justifyContent: 'center',
  },
  noPhotoText: { color: T.textSecondary, ...TYPOGRAPHY.caption },

  section: { paddingHorizontal: SPACING.xl, marginBottom: SPACING.xl },
  meta: { color: T.textSecondary, ...TYPOGRAPHY.caption, marginBottom: SPACING.xs },
  headline: { color: T.text, ...TYPOGRAPHY.title, marginBottom: SPACING.md },
  body: { color: '#CBD5E1', ...TYPOGRAPHY.body },

  rows: {
    marginHorizontal: SPACING.xl, borderTopWidth: 1, borderBottomWidth: 1, borderColor: T.darkBorder,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: SPACING.lg },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: T.darkBorder },
  rowLabel: { color: T.textSecondary, ...TYPOGRAPHY.caption },
  rowValue: { color: T.text, ...TYPOGRAPHY.bodySecondary, marginTop: 2 },

  secondaryBtn: {
    height: BUTTON.secondary.height, marginHorizontal: SPACING.xl, marginTop: SPACING.xl, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: T.darkBorder, backgroundColor: T.darkSurface,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
  },
  secondaryBtnText: { color: T.primary, ...TYPOGRAPHY.bodySecondary },

  shareBtn: {
    height: BUTTON.primary.height, marginHorizontal: SPACING.xl, marginTop: SPACING.xl, borderRadius: RADIUS.md,
    backgroundColor: T.primaryDeep, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
  },
  shareBtnText: { color: 'white', ...TYPOGRAPHY.bodySecondary },
  shareHint: { color: T.textSecondary, ...TYPOGRAPHY.caption, marginHorizontal: SPACING.xl, marginTop: SPACING.sm, textAlign: 'center' },

  errorBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl },
  errorTitle: { color: T.text, ...TYPOGRAPHY.heading, marginTop: SPACING.lg, textAlign: 'center' },
  errorDesc: { color: T.textSecondary, ...TYPOGRAPHY.body, textAlign: 'center', marginTop: SPACING.sm, marginBottom: SPACING.xxl },
  primaryBtn: {
    height: BUTTON.primary.height, minWidth: 160, paddingHorizontal: SPACING.xxl, borderRadius: RADIUS.md,
    backgroundColor: T.primaryDeep, alignItems: 'center', justifyContent: 'center',
  },
  primaryBtnText: { color: 'white', ...TYPOGRAPHY.bodySecondary },

  previewOverlay: { flex: 1, backgroundColor: 'rgba(2,6,23,0.97)', justifyContent: 'center' },
  previewClose: {
    position: 'absolute', right: SPACING.lg, zIndex: 10, width: 44, height: 44,
    alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md, backgroundColor: T.darkSurface,
  },
  previewImage: { width: '100%', height: '85%' },

  dialogOverlay: { flex: 1, backgroundColor: 'rgba(2,6,23,0.8)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xxl },
  dialog: {
    width: '100%', backgroundColor: T.darkSurface, borderRadius: RADIUS.lg, borderWidth: 1,
    borderColor: T.darkBorder, padding: SPACING.xl,
  },
  dialogTitle: { color: T.text, ...TYPOGRAPHY.heading },
  dialogDesc: { color: T.textSecondary, ...TYPOGRAPHY.body, marginTop: SPACING.sm, marginBottom: SPACING.xl },
  dialogActions: { flexDirection: 'row', gap: SPACING.md },
  dialogCancel: {
    flex: 1, height: BUTTON.primary.height, borderRadius: RADIUS.md, borderWidth: 1, borderColor: T.darkBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  dialogCancelText: { color: T.text, ...TYPOGRAPHY.bodySecondary },
  dialogDelete: {
    flex: 1, height: BUTTON.primary.height, borderRadius: RADIUS.md, backgroundColor: DANGER,
    alignItems: 'center', justifyContent: 'center',
  },
  dialogDeleteText: { color: 'white', ...TYPOGRAPHY.bodySecondary },
});
