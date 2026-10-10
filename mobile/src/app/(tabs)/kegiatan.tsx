import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { StatusBar, Dimensions, RefreshControl, Modal, Alert, Platform as RNPlatform, TextInput as RNTextInput } from 'react-native';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, Platform } from '../../tw';
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
import { TYPOGRAPHY, COLORS as T, RADIUS, SHADOWS, SPACING } from '../../tokens';

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

  // Refresh in the background when the tab is focused. Unlike resetQueries, this keeps
  // the current list on screen instead of flashing the loading state and jumping to top.
  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['kegiatans'] });
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
    <View style={{ paddingTop: 64, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm }}>
      <Text style={{ color: T.textSecondary, ...TYPOGRAPHY.caption }}>Jurnal kegiatan</Text>
      <Text style={{ color: T.text, ...TYPOGRAPHY.title, marginTop: 2 }}>Laporan</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.md }}>
        <View style={{ backgroundColor: T.darkSurface, paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.sm, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: T.darkBorder }}>
          <History color={T.textSecondary} size={14} style={{ marginRight: SPACING.sm }} />
          <Text style={{ color: T.textSecondary, ...TYPOGRAPHY.badge }}>{processedKegiatan.length} entri ditemukan</Text>
        </View>

        {(selectedMonth || selectedYear) && (
          <TouchableOpacity
            onPress={resetFilters}
            accessibilityRole="button"
            style={{ marginLeft: SPACING.sm, minHeight: 44, justifyContent: 'center', paddingHorizontal: SPACING.sm }}
          >
            <Text style={{ color: T.rose, ...TYPOGRAPHY.badge }}>Hapus filter</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: T.darkSurface,
        borderRadius: RADIUS.md,
        height: 52,
        paddingLeft: SPACING.lg,
        paddingRight: SPACING.sm,
        marginTop: SPACING.lg,
        borderWidth: 1,
        borderColor: T.darkBorder,
      }}>
        <Search color={T.textSecondary} size={18} style={{ marginRight: SPACING.md }} />
        <RNTextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Cari deskripsi atau lokasi..."
          placeholderTextColor={T.textTertiary}
          style={{ flex: 1, color: T.text, fontWeight: '500', fontSize: 15, height: '100%' }}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {searchQuery !== '' && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Hapus pencarian"
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
            >
              <X color={T.textTertiary} size={18} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => setShowFilterModal(true)}
            accessibilityRole="button"
            accessibilityLabel="Filter periode"
            style={{ height: 44, width: 44, backgroundColor: T.darkBg, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: T.darkBorder }}
          >
            <ListFilter color={T.primary} size={18} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowExportModal(true)}
            accessibilityRole="button"
            accessibilityLabel="Export laporan"
            style={{ height: 44, width: 44, marginLeft: SPACING.sm, backgroundColor: T.darkBg, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: T.darkBorder }}
          >
            <Download color={T.primary} size={18} />
          </TouchableOpacity>
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

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={T.primary} size="large" />
          <Text style={{ color: T.textSecondary, marginTop: SPACING.lg, ...TYPOGRAPHY.caption }}>Memuat kegiatan...</Text>
        </View>
      ) : (
        <FlashList
          data={processedKegiatan}
          renderItem={renderItem}
          estimatedItemSize={140}
          contentContainerStyle={{ paddingBottom: 150, paddingHorizontal: SPACING.lg }}
          showsVerticalScrollIndicator={true}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor={T.primary}
              progressViewOffset={20}
            />
          }
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={{ marginTop: SPACING.xxxl }}>
              <View style={{ backgroundColor: T.darkSurface, padding: SPACING.xxl, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: T.darkBorder, alignItems: 'center' }}>
                <FileText color={T.textTertiary} size={44} strokeWidth={1.5} />
                <Text style={{ color: T.textSecondary, marginTop: SPACING.lg, ...TYPOGRAPHY.caption, textAlign: 'center' }}>Belum ditemukan catatan penugasan untuk periode ini.</Text>
              </View>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator color={T.primary} size="small" />
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
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(2,6,23,0.7)' }}>
          <View style={{ backgroundColor: T.darkSurface, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg, borderTopWidth: 1, borderColor: T.darkBorder, padding: SPACING.xxl, paddingBottom: 40 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xxl }}>
              <View>
                <Text style={{ color: T.text, ...TYPOGRAPHY.heading }}>Filter jurnal</Text>
                <Text style={{ color: T.textSecondary, ...TYPOGRAPHY.caption, marginTop: 2 }}>Pilih periode untuk memfilter data</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                accessibilityRole="button"
                accessibilityLabel="Tutup filter"
                style={{ width: 44, height: 44, backgroundColor: T.darkBg, borderRadius: RADIUS.md, borderWidth: 1, borderColor: T.darkBorder, alignItems: 'center', justifyContent: 'center' }}
              >
                <X color={T.text} size={20} />
              </TouchableOpacity>
            </View>

            <Text style={{ color: T.textSecondary, ...TYPOGRAPHY.sectionLabel, marginBottom: SPACING.md }}>Pilih bulan</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xxl }}>
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
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    style={{
                      minHeight: 44,
                      justifyContent: 'center',
                      paddingHorizontal: SPACING.lg,
                      borderRadius: RADIUS.md,
                      backgroundColor: isActive ? T.primaryDeep : T.darkBg,
                      borderWidth: 1,
                      borderColor: isActive ? T.primaryDeep : T.darkBorder
                    }}
                  >
                    <Text style={{ color: isActive ? 'white' : T.textSecondary, ...TYPOGRAPHY.caption, fontWeight: '600' }}>{name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={{ color: T.textSecondary, ...TYPOGRAPHY.sectionLabel, marginBottom: SPACING.md }}>Pilih tahun</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xxl }}>
              {YEAR_OPTIONS.map((year) => {
                const isActive = selectedYear === year;
                return (
                  <TouchableOpacity
                    key={year}
                    onPress={() => setSelectedYear(year)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    style={{
                      minHeight: 44,
                      justifyContent: 'center',
                      paddingHorizontal: SPACING.lg,
                      borderRadius: RADIUS.md,
                      backgroundColor: isActive ? T.primaryDeep : T.darkBg,
                      borderWidth: 1,
                      borderColor: isActive ? T.primaryDeep : T.darkBorder
                    }}
                  >
                    <Text style={{ color: isActive ? 'white' : T.textSecondary, ...TYPOGRAPHY.caption, fontWeight: '600' }}>{year}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ flexDirection: 'row', gap: SPACING.md }}>
              <TouchableOpacity
                onPress={resetFilters}
                style={{ flex: 1, height: 52, backgroundColor: T.darkBg, borderRadius: RADIUS.md, borderWidth: 1, borderColor: T.darkBorder, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: T.textSecondary, ...TYPOGRAPHY.bodySecondary }}>Hapus semua</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowFilterModal(false);
                  refetch();
                }}
                style={{ flex: 2, height: 52, backgroundColor: T.primaryDeep, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', ...SHADOWS.floating }}
              >
                <Text style={{ color: 'white', ...TYPOGRAPHY.bodySecondary }}>Terapkan filter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Export Modal */}
      <Modal
        visible={showExportModal}
        transparent
        animationType="slide"
        onRequestClose={() => !exportMutation.isPending && setShowExportModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(2,6,23,0.7)' }}>
          <View style={{ backgroundColor: T.darkSurface, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg, borderTopWidth: 1, borderColor: T.darkBorder, padding: SPACING.xxl, paddingBottom: 40 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: T.text, ...TYPOGRAPHY.heading }}>Export laporan</Text>
                <Text style={{ color: T.textSecondary, ...TYPOGRAPHY.caption, marginTop: 2 }}>Unduh kegiatan Anda untuk periode terpilih</Text>
              </View>
              <TouchableOpacity
                disabled={exportMutation.isPending}
                onPress={() => setShowExportModal(false)}
                accessibilityRole="button"
                accessibilityLabel="Tutup export"
                style={{ width: 44, height: 44, backgroundColor: T.darkBg, borderRadius: RADIUS.md, borderWidth: 1, borderColor: T.darkBorder, alignItems: 'center', justifyContent: 'center' }}
              >
                <X color={T.text} size={20} />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: T.darkBg, borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.xl, borderWidth: 1, borderColor: T.darkBorder }}>
              <Calendar color={T.textSecondary} size={18} style={{ marginRight: SPACING.md }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: T.text, ...TYPOGRAPHY.bodySecondary }}>Periode: {exportPeriodLabel}</Text>
                <Text style={{ color: T.textSecondary, ...TYPOGRAPHY.caption, marginTop: 2 }}>
                  {selectedMonth || selectedYear ? 'Mengikuti filter aktif' : 'Bulan berjalan — ubah lewat filter'}
                </Text>
              </View>
            </View>

            <Text style={{ color: T.textSecondary, ...TYPOGRAPHY.sectionLabel, marginBottom: SPACING.md }}>Pilih format</Text>
            <View style={{ gap: SPACING.sm, marginBottom: SPACING.xxl }}>
              {EXPORT_FORMATS.map(({ format, label, description }) => {
                const isActive = exportFormat === format;
                return (
                  <TouchableOpacity
                    key={format}
                    disabled={exportMutation.isPending}
                    onPress={() => setExportFormat(format)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      minHeight: 64,
                      padding: SPACING.lg,
                      borderRadius: RADIUS.md,
                      backgroundColor: T.darkBg,
                      borderWidth: 1,
                      borderColor: isActive ? T.primary : T.darkBorder
                    }}
                  >
                    <FileText color={isActive ? T.primary : T.textSecondary} size={20} style={{ marginRight: SPACING.md }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: isActive ? T.text : T.textSecondary, ...TYPOGRAPHY.bodySecondary }}>{label}</Text>
                      <Text style={{ color: T.textSecondary, ...TYPOGRAPHY.caption }}>{description}</Text>
                    </View>
                    {isActive && <Check color={T.primary} size={20} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              disabled={exportMutation.isPending}
              onPress={handleExport}
              style={{ flexDirection: 'row', justifyContent: 'center', backgroundColor: T.primaryDeep, opacity: exportMutation.isPending ? 0.7 : 1, height: 52, borderRadius: RADIUS.md, alignItems: 'center', ...SHADOWS.floating }}
            >
              {exportMutation.isPending ? (
                <>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={{ color: 'white', ...TYPOGRAPHY.bodySecondary, marginLeft: SPACING.sm }}>Menyiapkan laporan...</Text>
                </>
              ) : (
                <>
                  <Download color="white" size={18} />
                  <Text style={{ color: 'white', ...TYPOGRAPHY.bodySecondary, marginLeft: SPACING.sm }}>Export {exportFormat.toUpperCase()}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
