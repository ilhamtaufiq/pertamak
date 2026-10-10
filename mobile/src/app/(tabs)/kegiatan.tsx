import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { StatusBar, Dimensions, RefreshControl, Modal, Alert, Platform as RNPlatform, TextInput as RNTextInput } from 'react-native';
import { View, Text, ActivityIndicator, TouchableOpacity, LinearGradient, BlurView, StyleSheet, Platform } from '../../tw';
import { useAuthStore } from '../../stores/authStore';
import { FlashList } from '@shopify/flash-list';
import { Stack, useRouter, Redirect, useFocusEffect } from 'expo-router';
import { useKegiatan } from '../../hooks/useKegiatan';
import { useExportKegiatan, ExportFormat } from '../../hooks/useExportKegiatan';
import { haptics } from '../../services/haptics';
import { KegiatanCard } from '../../components/features/KegiatanCard';
import { Animated } from '../../tw/animated';
import { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Search, ListFilter, SlidersHorizontal, FileText, History, X, Check, Calendar, Download } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { TYPOGRAPHY, BUTTON, COLORS as T, RADIUS, SHADOWS, SPACING } from '../../tokens';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR];

const EXPORT_FORMATS: { format: ExportFormat; label: string; description: string }[] = [
  { format: 'pdf', label: 'PDF', description: 'Siap cetak & dibagikan' },
  { format: 'docx', label: 'Word (DOCX)', description: 'Bisa diedit kembali' },
];

function showMessage(title: string, message: string) {
  if (RNPlatform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function KegiatanListTab() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter States
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);

  // Export States
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const exportMutation = useExportKegiatan();

  const queryClient = useQueryClient();
  const {
    data: infiniteData,
    isLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching
  } = useKegiatan({ month: selectedMonth, year: selectedYear });

  // Reset to first page (7 items) when screen is focused
  useFocusEffect(
    useCallback(() => {
      // Use a subtle check to see if we should reset (e.g. if we have more than 7 items)
      // We don't include infiniteData in deps to avoid the fetch-reset-fetch loop
      queryClient.resetQueries({ queryKey: ['kegiatans'] });
    }, [queryClient])
  );

  if (!token) return <Redirect href="/(auth)/login" />;

  const kegiatanItems = useMemo(() => {
    return infiniteData?.pages.flatMap(page => page.data) || [];
  }, [infiniteData]);

  // Client-side search only (Date filters are server-side via hook params)
  const processedKegiatan = useMemo(() => {
    let items = [...kegiatanItems];
    items.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
    if (searchQuery) {
      items = items.filter(item =>
        item.uraian_kegiatan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lokasi?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return items;
  }, [kegiatanItems, searchQuery]);

  const handleRefresh = useCallback(() => refetch(), [refetch]);

  // Export uses the active filter; without one, default to the current month
  const exportPeriod = useMemo(() => {
    if (!selectedMonth && !selectedYear) {
      return { month: new Date().getMonth() + 1, year: CURRENT_YEAR };
    }
    return { month: selectedMonth, year: selectedYear ?? CURRENT_YEAR };
  }, [selectedMonth, selectedYear]);

  const exportPeriodLabel = exportPeriod.month
    ? `${MONTH_NAMES[exportPeriod.month - 1]} ${exportPeriod.year}`
    : `Tahun ${exportPeriod.year}`;

  const handleExport = () => {
    haptics.impactMedium();
    exportMutation.mutate(
      { format: exportFormat, ...exportPeriod },
      {
        onSuccess: () => {
          haptics.success();
          setShowExportModal(false);
        },
        onError: (error) => {
          haptics.error();
          showMessage('Export Gagal', error.message);
        },
      }
    );
  };

  const resetFilters = () => {
    setSelectedMonth(undefined);
    setSelectedYear(undefined);
    setShowFilterModal(false);
  };

  const renderHeader = () => (
    <View style={{ marginBottom: 10 }}>
      {/* Banner */}
      <View style={{ height: 260, marginTop: -60, backgroundColor: T.primarySolid, borderBottomLeftRadius: 48, borderBottomRightRadius: 48, overflow: 'hidden' }}>
        <LinearGradient
          colors={[T.darkBg, '#0369A1']}
          style={{ flex: 1, paddingHorizontal: 32, paddingTop: 100 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: T.primary, fontWeight: '900', fontSize: 11, textTransform: 'uppercase', letterSpacing: 3, marginBottom: 4 }}>Audit Lapangan</Text>
              <Text style={{ color: 'white', fontSize: 32, fontWeight: '900', letterSpacing: -1 }}>Laporan</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <View style={{ backgroundColor: 'rgba(56, 189, 248, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' }}>
              <History color="#38BDF8" size={14} style={{ marginRight: 8 }} />
              <Text style={{ color: 'white', fontWeight: '900', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{processedKegiatan.length} Entri Ditemukan</Text>
            </View>

            {(selectedMonth || selectedYear) && (
              <TouchableOpacity
                onPress={resetFilters}
                style={{ marginLeft: 8, backgroundColor: 'rgba(244, 63, 94, 0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(244, 63, 94, 0.2)' }}
              >
                <Text style={{ color: '#FB7185', fontWeight: '900', fontSize: 10, textTransform: 'uppercase' }}>Hapus Filter X</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </View>

      {/* Floating Search Bar */}
      <View style={{ marginTop: -35, paddingHorizontal: 24 }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: T.darkSurface,
          borderRadius: 24,
          height: 64,
          paddingHorizontal: 20,
          borderWidth: 1,
          borderColor: T.darkBorder,
          boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.3)',
          elevation: 10
        }}>
          <Search color="#38BDF8" size={20} style={{ marginRight: 12 }} />
          <RNTextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cari deskripsi atau lokasi..."
            placeholderTextColor={T.textTertiary}
            style={{ flex: 1, color: 'white', fontWeight: '600', fontSize: 15, height: '100%' }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 8 }}>
                <X color={T.textTertiary} size={20} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => setShowFilterModal(true)}
              style={{ height: 40, width: 40, backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' }}
            >
              <ListFilter color="#38BDF8" size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowExportModal(true)}
              accessibilityLabel="Export laporan"
              style={{ height: 40, width: 40, marginLeft: 8, backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' }}
            >
              <Download color="#38BDF8" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderItem = useCallback(({ item }: { item: any }) => (
    <KegiatanCard
      item={item}
      onPress={(id) => router.push(`/kegiatan/${id}`)}
    />
  ), [router]);

  return (
    <View style={{ flex: 1, backgroundColor: T.darkBg }}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient colors={[T.darkBg, T.darkSurface]} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#38BDF8" size="large" />
          <Text style={{ color: T.textSecondary, marginTop: 16, fontWeight: '900', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2 }}>Membangun Katalog...</Text>
        </View>
      ) : (
        <FlashList
          data={processedKegiatan}
          renderItem={renderItem}
          estimatedItemSize={140}
          contentContainerStyle={{ paddingBottom: 150 }}
          showsVerticalScrollIndicator={true}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor="#38BDF8"
              progressViewOffset={60}
            />
          }
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={{ paddingHorizontal: 32, marginTop: 40 }}>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 40, borderRadius: 40, borderStyle: 'dashed', borderWidth: 1, borderColor: T.darkBorder, alignItems: 'center' }}>
                <FileText color="rgba(255,255,255,0.1)" size={64} strokeWidth={1} />
                <Text style={{ color: T.textSecondary, marginTop: 16, fontWeight: '500', textAlign: 'center' }}>Belum ditemukan catatan penugasan untuk periode ini.</Text>
              </View>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator color="#38BDF8" size="small" />
              </View>
            ) : null
          }
          removeClippedSubviews={false}
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <BlurView intensity={80} tint="dark" style={{ borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, paddingBottom: 60 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <View>
                <Text style={{ color: 'white', fontSize: 24, fontWeight: '900' }}>Filter Jurnal</Text>
                <Text style={{ color: T.textSecondary, fontSize: 13, fontWeight: '500' }}>Pilih periode untuk memfilter data</Text>
              </View>
              <TouchableOpacity onPress={() => setShowFilterModal(false)} style={{ backgroundColor: T.darkBorder, padding: 8, borderRadius: 12 }}>
                <X color="white" size={24} />
              </TouchableOpacity>
            </View>

            <Text style={{ color: T.primary, fontWeight: '900', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>Pilih Bulan</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 }}>
              {MONTH_NAMES.map((name, index) => {
                const monthIdx = index + 1;
                const isActive = selectedMonth === monthIdx;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setSelectedMonth(monthIdx);
                      setSelectedYear(y => y ?? CURRENT_YEAR);
                    }}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 16,
                      backgroundColor: isActive ? T.primarySolid : 'rgba(255,255,255,0.05)',
                      borderWidth: 1,
                      borderColor: isActive ? T.primary : T.darkBorder
                    }}
                  >
                    <Text style={{ color: isActive ? 'white' : '#94A3B8', fontWeight: '700', fontSize: 13 }}>{name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={{ color: T.primary, fontWeight: '900', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>Pilih Tahun</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 }}>
              {YEAR_OPTIONS.map((year) => {
                const isActive = selectedYear === year;
                return (
                  <TouchableOpacity
                    key={year}
                    onPress={() => setSelectedYear(year)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 16,
                      backgroundColor: isActive ? T.primarySolid : 'rgba(255,255,255,0.05)',
                      borderWidth: 1,
                      borderColor: isActive ? T.primary : T.darkBorder
                    }}
                  >
                    <Text style={{ color: isActive ? 'white' : '#94A3B8', fontWeight: '700', fontSize: 13 }}>{year}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity
                onPress={resetFilters}
                style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 18, borderRadius: 20, alignItems: 'center' }}
              >
                <Text style={{ color: '#94A3B8', fontWeight: '900', fontSize: 13, textTransform: 'uppercase' }}>Hapus Semua</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowFilterModal(false);
                  refetch();
                }}
                style={{ flex: 2, backgroundColor: T.primarySolid, paddingVertical: 18, borderRadius: 20, alignItems: 'center', boxShadow: '0px 10px 15px rgba(14, 165, 233, 0.3)', elevation: 8 }}
              >
                <Text style={{ color: 'white', fontWeight: '900', fontSize: 13, textTransform: 'uppercase' }}>Terapkan Filter</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>

      {/* Export Modal */}
      <Modal
        visible={showExportModal}
        transparent
        animationType="slide"
        onRequestClose={() => !exportMutation.isPending && setShowExportModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <BlurView intensity={80} tint="dark" style={{ borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, paddingBottom: 60 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: 'white', fontSize: 24, fontWeight: '900' }}>Export Laporan</Text>
                <Text style={{ color: T.textSecondary, fontSize: 13, fontWeight: '500' }}>Unduh kegiatan Anda untuk periode terpilih</Text>
              </View>
              <TouchableOpacity
                disabled={exportMutation.isPending}
                onPress={() => setShowExportModal(false)}
                style={{ backgroundColor: T.darkBorder, padding: 8, borderRadius: 12 }}
              >
                <X color="white" size={24} />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: 16, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' }}>
              <Calendar color="#38BDF8" size={18} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 14 }}>Periode: {exportPeriodLabel}</Text>
                <Text style={{ color: T.textSecondary, fontSize: 12, marginTop: 2 }}>
                  {selectedMonth || selectedYear ? 'Mengikuti filter aktif' : 'Bulan berjalan — ubah lewat filter'}
                </Text>
              </View>
            </View>

            <Text style={{ color: T.primary, fontWeight: '900', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>Pilih Format</Text>
            <View style={{ gap: 10, marginBottom: 32 }}>
              {EXPORT_FORMATS.map(({ format, label, description }) => {
                const isActive = exportFormat === format;
                return (
                  <TouchableOpacity
                    key={format}
                    disabled={exportMutation.isPending}
                    onPress={() => setExportFormat(format)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                      borderRadius: 16,
                      backgroundColor: isActive ? 'rgba(14, 165, 233, 0.2)' : 'rgba(255,255,255,0.05)',
                      borderWidth: 1,
                      borderColor: isActive ? T.primary : T.darkBorder
                    }}
                  >
                    <FileText color={isActive ? '#38BDF8' : '#94A3B8'} size={22} style={{ marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: isActive ? 'white' : '#CBD5E1', fontWeight: '800', fontSize: 14 }}>{label}</Text>
                      <Text style={{ color: T.textSecondary, fontSize: 12 }}>{description}</Text>
                    </View>
                    {isActive && <Check color="#38BDF8" size={20} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              disabled={exportMutation.isPending}
              onPress={handleExport}
              style={{ flexDirection: 'row', justifyContent: 'center', backgroundColor: T.primarySolid, opacity: exportMutation.isPending ? 0.7 : 1, paddingVertical: 18, borderRadius: 20, alignItems: 'center', boxShadow: '0px 10px 15px rgba(14, 165, 233, 0.3)', elevation: 8 }}
            >
              {exportMutation.isPending ? (
                <>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={{ color: 'white', fontWeight: '900', fontSize: 13, textTransform: 'uppercase', marginLeft: 10 }}>Menyiapkan Laporan...</Text>
                </>
              ) : (
                <>
                  <Download color="white" size={18} />
                  <Text style={{ color: 'white', fontWeight: '900', fontSize: 13, textTransform: 'uppercase', marginLeft: 10 }}>Export {exportFormat.toUpperCase()}</Text>
                </>
              )}
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}
