import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Alert, Modal, Dimensions, RefreshControl, StatusBar, TextInput as RNTextInput, StyleSheet } from 'react-native';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, TextInput } from '../../tw';
import {
   Folder,
   HardDrive,
   Filter,
   Plus,
   Search,
   MoreVertical,
   LayoutGrid,
   Clock,
   ChevronRight,
   File,
   FileImage,
   FileText,
   FileVideo,
   Home,
   Download,
   Trash2,
   Type,
   MoveHorizontal,
   X,
   PlusCircle,
   Upload,
   ChevronLeft,
   CloudLightning,
   Settings2,
} from 'lucide-react-native';
import { Animated } from '../../tw/animated';
import { FadeInDown, FadeInUp, ZoomIn, SlideInRight, SlideInLeft } from 'react-native-reanimated';
import { useMedia, useCreateFolder, useUploadMedia, useDeleteItem, useRenameItem, FileMedia, Folder as FolderType } from '../../hooks/useMedia';
import { haptics } from '../../services/haptics';
import { getMediaUrl } from '../../config';
import * as ImagePicker from 'expo-image-picker';
import { format } from 'date-fns';
import { TYPOGRAPHY, BUTTON, COLORS, RADIUS, SPACING } from '../../tokens';
import { confirmAction } from '../../services/dialogs';
import { toSecureMediaUrl } from '../../lib/mediaUrl';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/** Pesan galat yang ramah pengguna, dengan detail teknis bila tersedia */
const describeError = (e: any) =>
   e?.message
      ? `${e.message}\n\nPeriksa koneksi internet, lalu coba lagi.`
      : 'Periksa koneksi internet, lalu coba lagi.';

export default function MediaTab() {
   const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
   const [searchQuery, setSearchQuery] = useState('');

   const { data, isLoading, isError, refetch, isRefetching } = useMedia(currentFolderId);
   const createFolderMutation = useCreateFolder();
   const uploadMutation = useUploadMedia();
   const deleteMutation = useDeleteItem();
   const renameMutation = useRenameItem();

   const [showCreateFolder, setShowCreateFolder] = useState(false);
   const [newFolderName, setNewFolderName] = useState('');
   const [selectedItem, setSelectedItem] = useState<{ type: 'folder' | 'file'; id: number; name: string } | null>(null);
   const [showOptions, setShowOptions] = useState(false);
   const [isUploading, setIsUploading] = useState(false);
   const [previewMedia, setPreviewMedia] = useState<string | null>(null);

   const filteredFolders = useMemo(() =>
      data?.folders.filter((f: FolderType) => f.name.toLowerCase().includes(searchQuery.toLowerCase())) || [],
      [data, searchQuery]);

   const filteredFiles = useMemo(() =>
      data?.files.filter((f: FileMedia) => f.name.toLowerCase().includes(searchQuery.toLowerCase())) || [],
      [data, searchQuery]);

   const handleCreateFolder = async () => {
      if (!newFolderName.trim()) return;
      try {
         await createFolderMutation.mutateAsync({ name: newFolderName, parentId: currentFolderId });
         setNewFolderName('');
         setShowCreateFolder(false);
         haptics.success();
      } catch (e: any) { Alert.alert('Gagal membuat folder', describeError(e)); }
   };

   const traverseFolder = (id: number | null) => {
      haptics.impactLight();
      setCurrentFolderId(id);
   };

   const handleUpload = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], quality: 0.8 });
      if (!result.canceled && result.assets.length > 0) {
         setIsUploading(true);
         try {
            const asset = result.assets[0];
            const formData = new FormData();
            const filename = asset.fileName || `upload_${Date.now()}.jpg`;
            formData.append('file', { uri: asset.uri, name: filename, type: asset.mimeType || 'image/jpeg' } as any);
            if (currentFolderId) formData.append('folder_id', currentFolderId.toString());
            await uploadMutation.mutateAsync({ formData });
            haptics.success();
         } catch (e: any) { Alert.alert('Gagal mengunggah berkas', describeError(e)); } finally { setIsUploading(false); }
      }
   };

   const handleDelete = async () => {
      if (!selectedItem) return;
      const kind = selectedItem.type === 'folder' ? 'folder' : 'berkas';
      const confirmed = await confirmAction({
         title: `Hapus ${kind} permanen?`,
         message: `"${selectedItem.name}" akan dihapus permanen dan tidak bisa dikembalikan.`,
         confirmText: 'Hapus permanen',
         destructive: true,
      });
      if (!confirmed) return;

      try {
         await deleteMutation.mutateAsync({ type: selectedItem.type, id: selectedItem.id });
         setShowOptions(false);
         haptics.impactHeavy();
      } catch (e: any) { Alert.alert(`Gagal menghapus ${kind}`, describeError(e)); }
   };

   const isSearching = searchQuery.trim().length > 0;
   const hasNoResults = filteredFolders.length === 0 && filteredFiles.length === 0;

   return (
      <View style={styles.container}>
         <StatusBar barStyle="light-content" />

         <ScrollView
            style={styles.scroll}
            contentContainerStyle={{ paddingTop: 64, paddingBottom: 150 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
         >
            <View style={styles.header}>
               <Animated.View entering={FadeInDown} style={styles.headerTitleContainer}>
                  <View>
                     <Text style={styles.headerSubtitle}>Aset dan berkas digital</Text>
                     <Text style={styles.headerTitle}>{currentFolderId ? 'Isi folder' : 'Cloud drive'}</Text>
                  </View>
                  <TouchableOpacity
                     onPress={() => setShowCreateFolder(true)}
                     style={styles.headerActionBtn}
                     accessibilityRole="button"
                     accessibilityLabel="Buat folder baru"
                  >
                     <Plus color={COLORS.primary} size={20} />
                  </TouchableOpacity>
               </Animated.View>
            </View>

            {/* Search and upload */}
            <View style={styles.toolbarContainer}>
               <Animated.View entering={ZoomIn.delay(200)} style={styles.toolbar}>
                  <View style={styles.searchBox}>
                     <Search color={COLORS.textSecondary} size={18} style={{ marginRight: SPACING.md }} />
                     <RNTextInput
                        placeholder="Cari berkas atau folder..."
                        placeholderTextColor={COLORS.textTertiary}
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        accessibilityLabel="Cari berkas atau folder"
                        returnKeyType="search"
                     />
                  </View>
                  <TouchableOpacity
                     onPress={handleUpload}
                     style={styles.uploadBtn}
                     accessibilityRole="button"
                     accessibilityLabel="Unggah foto atau video"
                  >
                     <Upload color="white" size={20} />
                  </TouchableOpacity>
               </Animated.View>
            </View>

            {/* Breadcrumbs */}
            <View style={styles.breadcrumbWrapper}>
               <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.xxl }}>
                  <TouchableOpacity
                     onPress={() => traverseFolder(null)}
                     style={[styles.breadcrumbPill, !currentFolderId && styles.breadcrumbPillActive]}
                     accessibilityRole="button"
                     accessibilityLabel="Buka folder utama"
                     accessibilityState={{ selected: !currentFolderId }}
                  >
                     <Home color={!currentFolderId ? 'white' : COLORS.textSecondary} size={14} style={{ marginRight: SPACING.sm }} />
                     <Text style={[styles.breadcrumbText, !currentFolderId && styles.breadcrumbTextActive]}>Beranda</Text>
                  </TouchableOpacity>

                  {data?.breadcrumbs.map((crumb: any) => (
                     <View key={crumb.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <ChevronRight color={COLORS.textInactive} size={14} style={{ marginHorizontal: SPACING.xs }} />
                        <TouchableOpacity
                           onPress={() => traverseFolder(crumb.id)}
                           style={[styles.breadcrumbPill, currentFolderId === crumb.id && styles.breadcrumbPillActive]}
                           accessibilityRole="button"
                           accessibilityLabel={`Buka folder ${crumb.name}`}
                           accessibilityState={{ selected: currentFolderId === crumb.id }}
                        >
                           <Text style={[styles.breadcrumbText, currentFolderId === crumb.id && styles.breadcrumbTextActive]}>{crumb.name}</Text>
                        </TouchableOpacity>
                     </View>
                  ))}
               </ScrollView>
            </View>

            {!currentFolderId && (
               <Animated.View entering={FadeInDown.delay(400)} style={styles.statsContainer}>
                  <View style={styles.statsCard}>
                     <View style={styles.statsHeader}>
                        <HardDrive color={COLORS.textSecondary} size={16} style={{ marginRight: SPACING.sm }} />
                        <Text style={styles.statsCaption}>Penggunaan drive</Text>
                     </View>
                     <Text style={styles.statsMainValue}>920.4 MB</Text>
                     <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: '65%' }]} />
                     </View>
                     <View style={styles.statsFooter}>
                        <Text style={styles.statsStatusText}>65% terpakai</Text>
                        <TouchableOpacity
                           style={styles.statsActionLink}
                           accessibilityRole="button"
                           accessibilityLabel="Lihat detail penggunaan drive"
                        >
                           <Text style={styles.statsActionText}>Detail</Text>
                        </TouchableOpacity>
                     </View>
                  </View>
               </Animated.View>
            )}

            <View style={{ paddingHorizontal: SPACING.xxl }}>
               {filteredFolders.length > 0 && (
                  <View style={{ marginBottom: SPACING.xxl }}>
                     <Text style={styles.sectionTitle}>Folder</Text>
                     <View style={styles.folderGrid}>
                        {filteredFolders.map((f: any, idx: number) => (
                           <FolderCard
                              key={f.id}
                              folder={f}
                              delay={idx * 50}
                              onPress={() => traverseFolder(f.id)}
                              onLongPress={() => {
                                 setSelectedItem({ type: 'folder', id: f.id, name: f.name });
                                 setShowOptions(true);
                              }}
                           />
                        ))}
                     </View>
                  </View>
               )}

               <Text style={styles.sectionTitle}>Berkas</Text>
               {isLoading && !data ? (
                  <View style={styles.emptyBox} accessibilityLiveRegion="polite">
                     <ActivityIndicator color={COLORS.primary} />
                     <Text style={styles.emptyText}>Memuat berkas...</Text>
                  </View>
               ) : isError && !data ? (
                  <View style={styles.emptyBox} accessibilityLiveRegion="polite">
                     <Folder color={COLORS.textTertiary} size={40} />
                     <Text style={styles.emptyText}>Gagal memuat berkas</Text>
                     <Text style={styles.emptySubtext}>Periksa koneksi internet, lalu coba lagi.</Text>
                     <TouchableOpacity
                        onPress={() => refetch()}
                        style={styles.retryBtn}
                        accessibilityRole="button"
                        accessibilityLabel="Coba muat ulang berkas"
                     >
                        <Text style={styles.retryBtnText}>Coba lagi</Text>
                     </TouchableOpacity>
                  </View>
               ) : filteredFiles.length > 0 ? (
                  <View style={{ gap: SPACING.md }}>
                     {filteredFiles.map((file: any, idx: number) => (
                        <FileItem
                           key={file.id}
                           file={file}
                           delay={idx * 50 + 200}
                           onPress={() => {
                              setSelectedItem({ type: 'file', id: file.id, name: file.name });
                              setShowOptions(true);
                           }}
                           onPreview={(f: any) => setPreviewMedia(getMediaUrl(f.url))}
                        />
                     ))}
                  </View>
               ) : (
                  <View style={styles.emptyBox} accessibilityLiveRegion="polite">
                     <Folder color={COLORS.textTertiary} size={40} />
                     {isSearching && hasNoResults ? (
                        <>
                           <Text style={styles.emptyText}>Tidak ada hasil</Text>
                           <Text style={styles.emptySubtext}>Tidak ada yang cocok dengan "{searchQuery.trim()}". Coba kata kunci lain.</Text>
                        </>
                     ) : (
                        <>
                           <Text style={styles.emptyText}>Belum ada berkas di sini</Text>
                           <Text style={styles.emptySubtext}>Ketuk ikon unggah untuk menambahkan foto atau video.</Text>
                        </>
                     )}
                  </View>
               )}
            </View>
         </ScrollView>

         {/* Action Drawer */}
         <Modal visible={showOptions} transparent animationType="fade" onRequestClose={() => setShowOptions(false)}>
            <View style={styles.scrim}>
               <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => setShowOptions(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Tutup menu"
               />
               <View style={styles.drawerCard}>
                  <View style={styles.drawerHead}>
                     <View style={styles.drawerIcon}>
                        {selectedItem?.type === 'folder' ? <Folder color={COLORS.textSecondary} size={24} /> : <File color={COLORS.textSecondary} size={24} />}
                     </View>
                     <View style={{ flex: 1 }}>
                        <Text style={styles.drawerSubtitle}>{selectedItem?.type === 'folder' ? 'Folder' : 'Berkas'}</Text>
                        <Text style={styles.drawerName} numberOfLines={1}>{selectedItem?.name}</Text>
                     </View>
                  </View>
                  <TouchableOpacity
                     onPress={handleDelete}
                     style={styles.deleteBtn}
                     accessibilityRole="button"
                     accessibilityLabel={`Hapus permanen ${selectedItem?.name ?? ''}`}
                  >
                     <Trash2 color={COLORS.rose} size={18} style={{ marginRight: SPACING.md }} />
                     <Text style={styles.deleteBtnText}>Hapus permanen</Text>
                  </TouchableOpacity>
               </View>
            </View>
         </Modal>

         {isUploading && (
            <View style={styles.uploadModal} accessibilityLiveRegion="polite">
               <ActivityIndicator color={COLORS.primary} style={{ marginRight: SPACING.md }} />
               <Text style={styles.uploadStatus}>Mengunggah berkas...</Text>
            </View>
         )}

         {/* Image Preview Modal */}
         <Modal
           visible={!!previewMedia}
           transparent
           animationType="fade"
           onRequestClose={() => setPreviewMedia(null)}
         >
           <View style={styles.previewOverlay}>
             <View style={styles.previewModal}>
               <View style={styles.previewHeader}>
                 <TouchableOpacity
                   onPress={() => setPreviewMedia(null)}
                   style={styles.previewCloseBtn}
                   accessibilityRole="button"
                   accessibilityLabel="Tutup pratinjau"
                 >
                   <X color="white" size={24} />
                 </TouchableOpacity>
               </View>
               <Image
                 source={{ uri: previewMedia ?? undefined }}
                 style={styles.previewFullImage}
                 resizeMode="contain"
                 accessibilityLabel="Pratinjau berkas"
               />
             </View>
           </View>
         </Modal>

         {/* Create Folder Modal */}
         <Modal visible={showCreateFolder} transparent animationType="fade" onRequestClose={() => setShowCreateFolder(false)}>
            <View style={styles.modalOverlay}>
               <View style={styles.folderModal}>
                  <Text style={styles.modalHeading}>Folder baru</Text>
                  <RNTextInput
                     style={styles.modalField}
                     placeholder="Nama folder"
                     placeholderTextColor={COLORS.textTertiary}
                     value={newFolderName}
                     onChangeText={setNewFolderName}
                     autoFocus
                     accessibilityLabel="Nama folder baru"
                     returnKeyType="done"
                     onSubmitEditing={handleCreateFolder}
                  />
                  <View style={styles.modalActions}>
                     <TouchableOpacity
                        onPress={() => setShowCreateFolder(false)}
                        style={styles.btnSecondary}
                        accessibilityRole="button"
                        accessibilityLabel="Batal membuat folder"
                     >
                        <Text style={styles.btnSecondaryText}>Batal</Text>
                     </TouchableOpacity>
                     <TouchableOpacity
                        onPress={handleCreateFolder}
                        style={styles.btnPrimary}
                        accessibilityRole="button"
                        accessibilityLabel="Simpan folder baru"
                     >
                        <Text style={styles.btnPrimaryText}>Simpan</Text>
                     </TouchableOpacity>
                  </View>
               </View>
            </View>
         </Modal>
      </View>
   );
}

function FolderCard({ folder, delay, onPress, onLongPress }: any) {
   return (
      <Animated.View entering={FadeInUp.delay(delay)} style={{ width: '48%', marginBottom: SPACING.lg }}>
         <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
            style={styles.folderBox}
            accessibilityRole="button"
            accessibilityLabel={`Folder ${folder.name}`}
         >
            <Folder color={COLORS.textSecondary} size={28} strokeWidth={1.5} />
            <Text style={styles.folderTitle} numberOfLines={1}>{folder.name}</Text>
         </TouchableOpacity>
      </Animated.View>
   );
}

function FileItem({ file, delay, onPress, onPreview }: any) {
   const isImage = file.mime_type.startsWith('image/');
   return (
      <Animated.View entering={FadeInUp.delay(delay)}>
         <TouchableOpacity
            onPress={() => isImage && onPreview ? onPreview(file) : onPress?.()}
            style={styles.fileItemCard}
            accessibilityRole="button"
            accessibilityLabel={`${isImage ? 'Berkas gambar' : 'Berkas'} ${file.name}`}
         >
            <View style={styles.fileIconFrame}>
               {isImage ? (
                  <Image source={{ uri: toSecureMediaUrl(file.thumb || file.url) }} style={{ width: '100%', height: '100%' }} />
               ) : (
                  <FileText color={COLORS.textSecondary} size={24} />
               )}
            </View>
            <View style={{ flex: 1 }}>
               <Text style={styles.fileTitle} numberOfLines={1}>{file.name}</Text>
               <Text style={styles.fileInfo}>{file.human_size} • {format(new Date(file.created_at), 'dd/MM/yy')}</Text>
            </View>
            <ChevronRight color={COLORS.textTertiary} size={16} />
         </TouchableOpacity>
      </Animated.View>
   );
}

const styles = StyleSheet.create({
   container: { flex: 1, backgroundColor: COLORS.darkBg },
   scroll: { flex: 1 },
   header: { paddingHorizontal: SPACING.xxl, marginBottom: SPACING.xxl },
   headerTitleContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
   headerSubtitle: { color: COLORS.textSecondary, ...TYPOGRAPHY.caption, marginBottom: SPACING.xs },
   headerTitle: { color: COLORS.text, ...TYPOGRAPHY.title },
   headerActionBtn: {
      backgroundColor: COLORS.darkSurface, width: 44, height: 44, borderRadius: RADIUS.md,
      borderWidth: 1, borderColor: COLORS.darkBorder, alignItems: 'center', justifyContent: 'center',
   },
   toolbarContainer: { paddingHorizontal: SPACING.xxl, marginBottom: SPACING.xxl },
   toolbar: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
   searchBox: {
      flex: 1, flexDirection: 'row', alignItems: 'center', height: BUTTON.primary.height,
      backgroundColor: COLORS.darkSurface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.darkBorder,
      paddingLeft: SPACING.lg,
   },
   searchInput: { flex: 1, height: '100%', color: COLORS.text, ...TYPOGRAPHY.body },
   uploadBtn: {
      backgroundColor: COLORS.primaryDeep, width: BUTTON.primary.height, height: BUTTON.primary.height,
      borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center',
   },
   breadcrumbWrapper: { marginBottom: SPACING.xxl },
   breadcrumbPill: {
      flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingHorizontal: SPACING.lg,
      borderRadius: RADIUS.sm, backgroundColor: COLORS.darkSurface, borderWidth: 1, borderColor: COLORS.darkBorder,
      marginRight: SPACING.sm,
   },
   breadcrumbPillActive: { backgroundColor: COLORS.primaryDeep, borderColor: COLORS.primaryDeep },
   breadcrumbText: { color: COLORS.textSecondary, ...TYPOGRAPHY.badge },
   breadcrumbTextActive: { color: 'white' },
   statsContainer: { paddingHorizontal: SPACING.xxl, marginBottom: SPACING.xxxl },
   statsCard: {
      padding: SPACING.lg, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.darkBorder,
      backgroundColor: COLORS.darkSurface,
   },
   statsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
   statsCaption: { color: COLORS.textSecondary, ...TYPOGRAPHY.caption },
   statsMainValue: { color: COLORS.text, ...TYPOGRAPHY.title, marginBottom: SPACING.lg },
   progressTrack: { height: 8, backgroundColor: COLORS.darkBg, borderRadius: 4, overflow: 'hidden', marginBottom: SPACING.md },
   progressFill: { height: '100%', backgroundColor: COLORS.primary },
   statsFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
   statsStatusText: { color: COLORS.textSecondary, ...TYPOGRAPHY.caption },
   statsActionLink: { minWidth: 44, minHeight: 44, paddingHorizontal: SPACING.md, alignItems: 'center', justifyContent: 'center' },
   statsActionText: { color: COLORS.primary, ...TYPOGRAPHY.badge },
   sectionTitle: { color: COLORS.textSecondary, ...TYPOGRAPHY.sectionLabel, marginBottom: SPACING.md },
   folderGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
   folderBox: {
      backgroundColor: COLORS.darkSurface, padding: SPACING.lg, borderRadius: RADIUS.lg,
      alignItems: 'center', borderWidth: 1, borderColor: COLORS.darkBorder,
   },
   folderTitle: { color: COLORS.text, ...TYPOGRAPHY.bodySecondary, marginTop: SPACING.md, textAlign: 'center' },
   fileItemCard: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.darkSurface, padding: SPACING.md,
      borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.darkBorder,
   },
   fileIconFrame: {
      width: 56, height: 56, borderRadius: RADIUS.sm, backgroundColor: COLORS.darkBg, overflow: 'hidden',
      alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md,
   },
   fileTitle: { color: COLORS.text, ...TYPOGRAPHY.bodySecondary, marginBottom: SPACING.xs },
   fileInfo: { color: COLORS.textSecondary, ...TYPOGRAPHY.caption },
   emptyBox: {
      paddingVertical: SPACING.xxxl, paddingHorizontal: SPACING.xxl, alignItems: 'center',
      borderRadius: RADIUS.lg, backgroundColor: COLORS.darkSurface, borderWidth: 1, borderColor: COLORS.darkBorder,
   },
   emptyText: { color: COLORS.text, ...TYPOGRAPHY.bodySecondary, marginTop: SPACING.lg, textAlign: 'center' },
   emptySubtext: { color: COLORS.textSecondary, ...TYPOGRAPHY.caption, marginTop: SPACING.sm, textAlign: 'center' },
   retryBtn: {
      marginTop: SPACING.lg, minHeight: BUTTON.pill.height, minWidth: 120, paddingHorizontal: SPACING.xl,
      borderRadius: RADIUS.md, backgroundColor: COLORS.primaryDeep, alignItems: 'center', justifyContent: 'center',
   },
   retryBtnText: { color: 'white', fontSize: BUTTON.pill.fontSize, fontWeight: BUTTON.pill.fontWeight },
   scrim: { flex: 1, backgroundColor: 'rgba(2,6,23,0.7)' },
   drawerCard: {
      backgroundColor: COLORS.darkSurface, paddingHorizontal: SPACING.xxl, paddingTop: SPACING.xxl, paddingBottom: 40,
      borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg, borderTopWidth: 1, borderColor: COLORS.darkBorder,
   },
   drawerHead: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xl },
   drawerIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
   drawerSubtitle: { color: COLORS.textSecondary, ...TYPOGRAPHY.caption, marginBottom: SPACING.xs },
   drawerName: { color: COLORS.text, ...TYPOGRAPHY.subheading },
   deleteBtn: {
      flexDirection: 'row', alignItems: 'center', minHeight: BUTTON.primary.height, paddingHorizontal: SPACING.lg,
      borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.darkBorder, backgroundColor: COLORS.darkBg,
   },
   deleteBtnText: { color: COLORS.rose, ...TYPOGRAPHY.bodySecondary },
   uploadModal: {
      position: 'absolute', bottom: 120, alignSelf: 'center', flexDirection: 'row', alignItems: 'center',
      paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, borderRadius: RADIUS.md,
      backgroundColor: COLORS.darkSurface, borderWidth: 1, borderColor: COLORS.darkBorder,
   },
   uploadStatus: { color: COLORS.text, ...TYPOGRAPHY.bodySecondary },
   modalOverlay: { flex: 1, backgroundColor: 'rgba(2,6,23,0.7)', alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl },
   folderModal: {
      width: '100%', padding: SPACING.xxl, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.darkBorder,
      backgroundColor: COLORS.darkSurface,
   },
   modalHeading: { color: COLORS.text, ...TYPOGRAPHY.heading, marginBottom: SPACING.lg },
   modalField: {
      backgroundColor: COLORS.darkBg, paddingHorizontal: SPACING.lg, height: BUTTON.primary.height, borderRadius: RADIUS.md,
      color: COLORS.text, ...TYPOGRAPHY.body, marginBottom: SPACING.xl, borderWidth: 1, borderColor: COLORS.darkBorder,
   },
   modalActions: { flexDirection: 'row', gap: SPACING.md },
   btnSecondary: {
      flex: 1, height: BUTTON.primary.height, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.darkBorder,
      backgroundColor: COLORS.darkBg, alignItems: 'center', justifyContent: 'center',
   },
   btnSecondaryText: { color: COLORS.textSecondary, ...TYPOGRAPHY.bodySecondary },
   btnPrimary: {
      flex: 1, height: BUTTON.primary.height, backgroundColor: COLORS.primaryDeep, borderRadius: RADIUS.md,
      alignItems: 'center', justifyContent: 'center',
   },
   btnPrimaryText: { color: 'white', ...TYPOGRAPHY.bodySecondary },
   previewOverlay: { flex: 1, backgroundColor: 'rgba(2,6,23,0.95)', justifyContent: 'center' },
   previewModal: { flex: 1 },
   previewHeader: { position: 'absolute', top: 60, right: SPACING.lg, zIndex: 10 },
   previewCloseBtn: {
      width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.darkSurface,
      borderWidth: 1, borderColor: COLORS.darkBorder, alignItems: 'center', justifyContent: 'center',
   },
   previewFullImage: { width: '100%', height: '90%', marginTop: 80 },
});
