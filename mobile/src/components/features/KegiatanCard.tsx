import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Image, BlurView } from '../../tw';
import { Kegiatan } from '../../types/kegiatan';
import { haptics } from '../../services/haptics';
import { MapPin, Calendar, ChevronRight, CheckCircle2, FileText, Image as ImageIcon } from 'lucide-react-native';
import { StyleSheet } from 'react-native';

const COLORS = {
  primary: '#38BDF8',
  primarySolid: '#0EA5E9',
  darkBg: '#020617',
  darkSurface: '#0F172A',
  text: '#FFFFFF',
  textSecondary: '#64748B',
  textTertiary: '#475569',
  emerald: '#10B981',
  border: 'rgba(255,255,255,0.1)',
};

interface KegiatanCardProps {
  item: Kegiatan;
  onPress?: (id: number) => void;
}

export const KegiatanCard = memo(function KegiatanCard({ item, onPress }: KegiatanCardProps) {
  const handlePress = () => {
    haptics.impactLight();
    onPress?.(item.id);
  };

  const hasMedia = item.media && item.media.length > 0;
  const firstMedia = hasMedia ? item.media![0].original_url : null;

  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={handlePress}
      style={styles.card}
    >
      <BlurView intensity={10} tint="dark" style={styles.cardInner}>
        <View style={styles.contentRow}>
          {/* Content Section */}
          <View style={styles.textContent}>
            <View style={styles.metaRow}>
              <View style={styles.dayBadge}>
                <Text style={styles.dayText}>{item.hari}</Text>
              </View>
              <View style={styles.dateRow}>
                <Calendar color="#94A3B8" size={12} style={{ marginRight: 6 }} />
                <Text style={styles.dateText}>
                  {new Date(item.tanggal).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            </View>

            <Text style={styles.title} numberOfLines={2}>
              {item.uraian_kegiatan}
            </Text>

            <View style={styles.locationRow}>
              <MapPin color={COLORS.primary} size={14} style={{ marginRight: 8 }} />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.lokasi}
              </Text>
            </View>

            <View style={styles.footer}>
              <View style={styles.statusBadge}>
                <CheckCircle2 color={COLORS.emerald} size={12} style={{ marginRight: 6 }} />
                <Text style={styles.statusText}>Terverifikasi</Text>
              </View>
              <View style={styles.detailLink}>
                <Text style={styles.detailText}>Detail</Text>
                <ChevronRight color={COLORS.primary} size={16} strokeWidth={2.5} />
              </View>
            </View>
          </View>

          {/* Image/Icon Section */}
          <View style={styles.mediaSection}>
            {hasMedia ? (
              <View style={styles.mediaFrame}>
                <Image 
                  source={{ uri: firstMedia!.replace('localhost', 'pertamak.cianjur.space') }}
                  style={styles.mediaImage}
                  resizeMode="cover"
                />
                <View style={styles.mediaCountBadge}>
                  <ImageIcon color="white" size={10} style={{ marginRight: 4 }} />
                  <Text style={styles.mediaCountText}>{item.media?.length}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.noMediaFrame}>
                <FileText color={COLORS.textTertiary} size={32} strokeWidth={1} />
                <Text style={styles.noMediaText}>No Media</Text>
              </View>
            )}
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  cardInner: { padding: 20 },
  contentRow: { flexDirection: 'row' },
  textContent: { flex: 1, paddingRight: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dayBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    marginRight: 12,
  },
  dayText: { color: '#7DD3FC', fontWeight: '900', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateText: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  title: { color: 'white', fontWeight: '700', fontSize: 18, lineHeight: 24, marginBottom: 12 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  locationText: { color: '#94A3B8', fontSize: 14, fontWeight: '500', flex: 1 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusText: { color: '#34D399', fontSize: 10, fontWeight: '900', letterSpacing: -0.3, textTransform: 'uppercase' },
  detailLink: { flexDirection: 'row', alignItems: 'center' },
  detailText: { color: COLORS.primary, fontSize: 12, fontWeight: '700', marginRight: 4 },
  mediaSection: { width: 96, alignItems: 'center', justifyContent: 'center' },
  mediaFrame: {
    width: 96,
    height: 128,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.darkSurface,
  },
  mediaImage: { width: '100%', height: '100%' },
  mediaCountBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mediaCountText: { color: 'white', fontSize: 9, fontWeight: '700' },
  noMediaFrame: {
    width: 96,
    height: 128,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noMediaText: { color: '#475569', fontSize: 9, fontWeight: '900', letterSpacing: 2, marginTop: 8, textTransform: 'uppercase' },
});
