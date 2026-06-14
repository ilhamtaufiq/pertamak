import React, { useState, useCallback, useMemo } from 'react';
import { Alert, Modal, Dimensions, RefreshControl, StatusBar, TextInput as RNTextInput, StyleSheet } from 'react-native';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, TextInput, LinearGradient, BlurView } from '../../tw';
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
   Settings
} from 'lucide-react-native';
import { Animated } from '../../tw/animated';
import { FadeInDown, FadeInUp, ZoomIn, SlideInRight, SlideInLeft } from 'react-native-reanimated';
import { useMedia, useCreateFolder, useUploadMedia, useDeleteItem, useRenameItem, FileMedia, Folder as FolderType } from '../../hooks/useMedia';
import { haptics } from '../../services/haptics';
import * as ImagePicker from 'expo-image-picker';
import { format } from 'date-fns';
import { TYPOGRAPHY, BUTTON, COLORS as T, RADIUS, SHADOWS, SPACING } from '../../tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MediaTab() {
   const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
   const [searchQuery, setSearchQuery] = useState('');

   const { data, isLoading, refetch, isRefetching } = useMedia(currentFolderId);
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
      } catch (e: any) { Alert.alert('Gagal', e.message); }
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
         } catch (e: any) { Alert.alert('Gagal', e.message); } finally { setIsUploading(false); }
      }
   };

   const handleDelete = async () => {
      if (!selectedItem) return;
      Alert.alert('Hapus?', `Yakin ingin hapus ${selectedItem.name}?`, [
         { text: 'Batal', style: 'cancel' },
         {
            text: 'Hapus', style: 'destructive', onPress: async () => {
               try {
                  await deleteMutation.mutateAsync({ type: selectedItem.type, id: selectedItem.id });
                  setShowOptions(false);
                  haptics.impactHeavy();
               } catch (e: any) { Alert.alert('Gagal', e.message); }
            }
         }
      ]);
   };

   return (
      <View style={styles.container}>
         <StatusBar barStyle="light-content" />
         <LinearGradient colors={[COLORS.darkBg, COLORS.darkSurface]} style={StyleSheet.absoluteFill} />

         <ScrollView
            style={styles.scroll}
            contentContainerStyle={{ paddingTop: 64, paddingBottom: 150 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
         >
            {/* Consistent Header Pattern from Kegiatan List */}
            <View style={styles.header}>
               <Animated.View entering={FadeInDown} style={styles.headerTitleContainer}>
                  <View>
                     <Text style={styles.headerSubtitle}>ASET & BERKAS DIGITAL</Text>
                     <Text style={styles.headerTitle}>{currentFolderId ? 'Sub Direktori' : 'Cloud Drive'}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowCreateFolder(true)} style={styles.headerActionBtn}>
                     <Settings color="white" size={20} />
                  </TouchableOpacity>
               </Animated.View>
            </View>

            {/* Global Toolbar from Katalog Kerja */}
            <View style={styles.toolbarContainer}>
               <Animated.View entering={ZoomIn.delay(200)} style={styles.toolbar}>
                  <View style={styles.searchBox}>
                     <Search color={COLORS.primary} size={20} style={{ marginRight: 12 }} />
                     <RNTextInput
                        placeholder="Cari berkas atau folder..."
                        placeholderTextColor="#475569"
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                     />
                  </View>
                  <TouchableOpacity onPress={handleUpload} style={styles.uploadBtn}>
                     <Upload color="white" size={20} />
                  </TouchableOpacity>
               </Animated.View>
            </View>

            {/* Breadcrumbs - Pills Pattern */}
            <View style={styles.breadcrumbWrapper}>
               <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
                  <TouchableOpacity onPress={() => traverseFolder(null)} style={[styles.breadcrumbPill, !currentFolderId && styles.breadcrumbPillActive]}>
                     <Home color={!currentFolderId ? 'white' : COLORS.primary} size={14} style={{ marginRight: 8 }} />
                     <Text style={[styles.breadcrumbText, !currentFolderId && styles.breadcrumbTextActive]}>ROOT</Text>
                  </TouchableOpacity>

                  {data?.breadcrumbs.map((crumb: any) => (
                     <View key={crumb.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <ChevronRight color="#1E293B" size={14} style={{ marginHorizontal: 4 }} />
                        <TouchableOpacity onPress={() => traverseFolder(crumb.id)} style={[styles.breadcrumbPill, currentFolderId === crumb.id && styles.breadcrumbPillActive]}>
                           <Text style={[styles.breadcrumbText, currentFolderId === crumb.id && styles.breadcrumbTextActive]}>{crumb.name.toUpperCase()}</Text>
                        </TouchableOpacity>
                     </View>
                  ))}
               </ScrollView>
            </View>

            {!currentFolderId && (
               <Animated.View entering={FadeInDown.delay(400)} style={styles.statsContainer}>
                  <LinearGradient colors={['#0F172A', '#020617']} style={styles.statsCard}>
                     <View style={styles.statsHeader}>
                        <View style={styles.statsIconBox}><HardDrive color={COLORS.primary} size={16} /></View>
                        <Text style={styles.statsCaption}>PENGGUNAAN DRIVE</Text>
                     </View>
                     <Text style={styles.statsMainValue}>920.4 MB</Text>
                     <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: '65%' }]} />
                     </View>
                     <View style={styles.statsFooter}>
                        <Text style={styles.statsStatusText}>65% TERPAKAI</Text>
                        <TouchableOpacity style={styles.statsActionLink}>
                           <Text style={styles.statsActionText}>DETAIL</Text>
                        </TouchableOpacity>
                     </View>
                  </LinearGradient>
               </Animated.View>
            )}

            <View style={{ paddingHorizontal: 24 }}>
               {filteredFolders.length > 0 && (
                  <View style={{ marginBottom: 32 }}>
                     <Text style={styles.sectionTitle}>FOLDER UTAMA</Text>
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

               <Text style={styles.sectionTitle}>BERKAS & LAMPIRAN</Text>
               {filteredFiles.length > 0 ? (
                  <View style={{ gap: 12 }}>
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
                  <View style={styles.emptyBox}>
                     <Folder color="#1E293B" size={40} />
                     <Text style={styles.emptyText}>BELUM ADA BERKAS</Text>
                  </View>
               )}
            </View>
         </ScrollView>

         {/* Action Drawer */}
         <Modal visible={showOptions} transparent animationType="fade">
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)' }}>
               <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowOptions(false)} />
               <BlurView intensity={30} tint="dark" style={styles.drawerCard}>
                  <View style={styles.drawerHead}>
                     <View style={styles.drawerIcon}>
                        {selectedItem?.type === 'folder' ? <Folder color={COLORS.primary} size={24} /> : <File color={COLORS.primary} size={24} />}
                     </View>
                     <View style={{ flex: 1 }}>
                        <Text style={styles.drawerSubtitle}>{selectedItem?.type?.toUpperCase()}</Text>
                        <Text style={styles.drawerName} numberOfLines={1}>{selectedItem?.name}</Text>
                     </View>
                  </View>
                  <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
                     <Trash2 color={COLORS.rose} size={20} style={{ marginRight: 16 }} />
                     <Text style={styles.deleteBtnText}>Hapus Permanen</Text>
                  </TouchableOpacity>
               </BlurView>
            </View>
         </Modal>

         {/* Floating Action Button */}
         {/* <View style={styles.fabWrapper}>
         <TouchableOpacity onPress={() => setShowCreateFolder(true)} style={styles.fab}>
            <Plus color="white" size={32} />
         </TouchableOpacity>
      </View>
 */}
         {isUploading && (
            <BlurView intensity={20} tint="dark" style={styles.uploadModal}>
               <ActivityIndicator color={COLORS.primary} style={{ marginRight: 16 }} />
               <Text style={styles.uploadStatus}>MENGUNGGAH BERKAS...</Text>
            </BlurView>
         )}

         {/* Image Preview Modal */}
         <Modal
           visible={!!previewMedia}
           transparent
           animationType="fade"
           onRequestClose={() => setPreviewMedia(null)}
         >
           <View style={styles.previewOverlay}>
             <BlurView intensity={20} tint="dark" style={styles.previewModal}>
               <View style={styles.previewHeader}>
                 <TouchableOpacity onPress={() => setPreviewMedia(null)} style={{ padding: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24 }}>
                   <X color="white" size={24} />
                 </TouchableOpacity>
               </View>
               <Image source={{ uri: previewMedia }} style={styles.previewFullImage} resizeMode="contain" />
             </BlurView>
           </View>
         </Modal>

         {/* Create Folder Modal */}
         <Modal visible={showCreateFolder} transparent animationType="fade">
            <View style={styles.modalOverlay}>
               <BlurView intensity={40} tint="dark" style={styles.folderModal}>
                  <Text style={styles.modalHeading}>Folder Baru</Text>
                  <RNTextInput
                     style={styles.modalField}
                     placeholder="NAMA FOLDER"
                     placeholderTextColor="#64748B"
                     value={newFolderName}
                     onChangeText={setNewFolderName}
                     autoFocus
                  />
                  <View style={styles.modalActions}>
                     <TouchableOpacity onPress={() => setShowCreateFolder(false)} style={styles.btnSecondary}>
                        <Text style={styles.btnSecondaryText}>BATAL</Text>
                     </TouchableOpacity>
                     <TouchableOpacity onPress={handleCreateFolder} style={styles.btnPrimary}>
                        <Text style={styles.btnPrimaryText}>SIMPAN</Text>
                     </TouchableOpacity>
                  </View>
               </BlurView>
            </View>
         </Modal>
      </View>
   );
}

function FolderCard({ folder, delay, onPress, onLongPress }: any) {
   return (
      <Animated.View entering={FadeInUp.delay(delay)} style={{ width: '48%', marginBottom: 16 }}>
         <TouchableOpacity onPress={onPress} onLongPress={onLongPress} activeOpacity={0.7} style={styles.folderBox}>
            <View style={styles.folderIconWrapp}>
               <Folder color="white" size={28} fill="rgba(56, 189, 248, 0.4)" strokeWidth={1.5} />
            </View>
            <Text style={styles.folderTitle} numberOfLines={1}>{folder.name}</Text>
            <View style={styles.folderTag}>
               <Text style={styles.folderTagText}>DIR</Text>
            </View>
         </TouchableOpacity>
      </Animated.View>
   );
}

function FileItem({ file, delay, onPress, onPreview }: any) {
   const isImage = file.mime_type.startsWith('image/');
   return (
      <Animated.View entering={FadeInUp.delay(delay)}>
         <TouchableOpacity onPress={() => isImage && onPreview ? onPreview(file) : onPress?.()} style={styles.fileItemCard}>
            <View style={styles.fileIconFrame}>
               {isImage ? (
                  <Image source={{ uri: file.thumb || file.url.replace('localhost', 'pertamak.cianjur.space') }} style={{ width: '100%', height: '100%' }} />
               ) : (
                  <FileText color={COLORS.primary} size={24} />
               )}
            </View>
            <View style={{ flex: 1 }}>
               <Text style={styles.fileTitle} numberOfLines={1}>{file.name}</Text>
               <Text style={styles.fileInfo}>{file.human_size} • {format(new Date(file.created_at), 'dd/MM/yy')}</Text>
            </View>
            <ChevronRight color="#1E293B" size={16} />
         </TouchableOpacity>
      </Animated.View>
   );
}

const styles = StyleSheet.create({
   container: { flex: 1, backgroundColor: '#020617' },
   scroll: { flex: 1 },
   header: { paddingHorizontal: 24, marginBottom: 32 },
   headerTitleContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
   headerSubtitle: { color: COLORS.primary, fontWeight: '900', fontSize: 10, textTransform: 'uppercase', letterSpacing: 4, marginBottom: 8 },
   headerTitle: { color: 'white', fontSize: 36, fontWeight: '900', letterSpacing: -1 },
   headerActionBtn: { backgroundColor: '#0F172A', padding: 12, borderRadius: 20, borderWidth: 1, borderColor: '#1E293B' },
   toolbarContainer: { paddingHorizontal: 24, marginBottom: 32 },
   toolbar: { backgroundColor: '#0F172A', padding: 8, borderRadius: 32, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.1)' },
   searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: 16 },
   searchInput: { flex: 1, color: 'white', fontWeight: '700', fontSize: 16 },
   uploadBtn: { backgroundColor: COLORS.primarySolid, width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
   breadcrumbWrapper: { marginBottom: 32 },
   breadcrumbPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#1E293B', marginRight: 8 },
   breadcrumbPillActive: { backgroundColor: COLORS.primarySolid, borderColor: COLORS.primarySolid },
   breadcrumbText: { color: COLORS.primary, fontWeight: '900', fontSize: 9, letterSpacing: 1 },
   breadcrumbTextActive: { color: 'white' },
   statsContainer: { paddingHorizontal: 24, marginBottom: 40 },
   statsCard: { padding: 32, borderRadius: 48, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.1)' },
   statsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
   statsIconBox: { backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: 8, borderRadius: 12, marginRight: 12 },
   statsCaption: { color: COLORS.primary, fontWeight: '900', fontSize: 10, letterSpacing: 4 },
   statsMainValue: { color: 'white', fontSize: 32, fontWeight: '900', marginBottom: 20 },
   progressTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden', marginBottom: 16 },
   progressFill: { height: '100%', backgroundColor: COLORS.primarySolid },
   statsFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
   statsStatusText: { color: '#64748B', fontWeight: '900', fontSize: 10 },
   statsActionLink: { paddingHorizontal: 12, paddingVertical: 6 },
   statsActionText: { color: COLORS.primary, fontWeight: '900', fontSize: 10 },
   sectionTitle: { color: '#64748B', fontWeight: '900', fontSize: 10, letterSpacing: 2, marginBottom: 20, paddingLeft: 8 },
   folderGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
   folderBox: { backgroundColor: '#0F172A', padding: 24, borderRadius: 40, alignItems: 'center', borderWidth: 1, borderColor: '#1E293B' },
   folderIconWrapp: { backgroundColor: 'rgba(56, 189, 248, 0.1)', width: 64, height: 64, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
   folderTitle: { color: 'white', fontWeight: '900', fontSize: 14, marginBottom: 8, textAlign: 'center' },
   folderTag: { backgroundColor: 'rgba(255,255,255,0.03)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
   folderTagText: { color: '#64748B', fontWeight: '900', fontSize: 8 },
   fileItemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', padding: 16, borderRadius: 32, borderWidth: 1, borderColor: '#1E293B' },
   fileIconFrame: { width: 56, height: 56, borderRadius: 20, backgroundColor: '#020617', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
   fileTitle: { color: 'white', fontWeight: '900', fontSize: 14, marginBottom: 4 },
   fileInfo: { color: '#475569', fontWeight: '900', fontSize: 9 },
   emptyBox: { paddingVertical: 60, alignItems: 'center', borderRadius: 40, borderStyle: 'dashed', borderWidth: 1, borderColor: '#1E293B' },
   emptyText: { color: '#1E293B', fontWeight: '900', fontSize: 10, marginTop: 16 },
   fabWrapper: { position: 'absolute', bottom: 40, alignSelf: 'center' },
   fab: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primarySolid, alignItems: 'center', justifyContent: 'center', boxShadow: '0px 0px 20px rgba(14, 165, 233, 0.5)', elevation: 20 },
   drawerCard: { backgroundColor: 'rgba(15,23,42,0.95)', padding: 40, borderTopLeftRadius: 56, borderTopRightRadius: 56, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
   drawerHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
   drawerIcon: { width: 64, height: 64, backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 20 },
   drawerSubtitle: { color: COLORS.primary, fontWeight: '900', fontSize: 10, letterSpacing: 4, marginBottom: 4 },
   drawerName: { color: 'white', fontSize: 24, fontWeight: '900' },
   deleteBtn: { backgroundColor: 'rgba(244,63,94,0.1)', paddingVertical: 24, paddingHorizontal: 32, borderRadius: 24, flexDirection: 'row', alignItems: 'center' },
   deleteBtnText: { color: COLORS.rose, fontWeight: '900', fontSize: 16 },
   uploadModal: { position: 'absolute', bottom: 120, alignSelf: 'center', flexDirection: 'row', padding: 20, borderRadius: 24, backgroundColor: 'rgba(15,23,42,0.9)' },
   uploadStatus: { color: 'white', fontWeight: '900', fontSize: 10 },
   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', alignItems: 'center', justifyContent: 'center', padding: 32 },
   folderModal: { width: '100%', padding: 40, borderRadius: 48, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' },
   modalHeading: { color: 'white', fontSize: 28, fontWeight: '900', marginBottom: 32 },
   modalField: { backgroundColor: '#0F172A', padding: 24, borderRadius: 24, color: 'white', fontWeight: '700', fontSize: 18, marginBottom: 32, borderWidth: 1, borderColor: '#1E293B' },
   modalActions: { flexDirection: 'row', gap: 12 },
   btnSecondary: { flex: 1, paddingVertical: 20, alignItems: 'center' },
   btnSecondaryText: { color: '#64748B', fontWeight: '900', fontSize: 12 },
   btnPrimary: { flex: 1, backgroundColor: COLORS.primarySolid, paddingVertical: 20, borderRadius: 20, alignItems: 'center' },
   btnPrimaryText: { color: 'white', fontWeight: '900', fontSize: 12 },
   previewOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' },
   previewModal: { flex: 1 },
   previewHeader: { position: 'absolute', top: 60, right: 20, zIndex: 10 },
   previewFullImage: { width: '100%', height: '90%', marginTop: 80 },
});
