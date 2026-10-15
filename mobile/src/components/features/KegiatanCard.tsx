import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Image } from '../../tw';
import { COLORS, RADIUS, TYPOGRAPHY } from '../../tokens';
import { Kegiatan } from '../../types/kegiatan';
import { haptics } from '../../services/haptics';
import { MapPin, Calendar, ChevronRight, FileText, Image as ImageIcon } from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import { toSecureMediaUrl } from '../../lib/mediaUrl';

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
      accessibilityRole="button"
      accessibilityLabel={`${item.uraian_kegiatan}, ${item.lokasi}, ${item.hari}`}
    >
      <View style={styles.cardInner}>
        <View style={styles.contentRow}>
          {/* Content Section */}
          <View style={styles.textContent}>
            <View style={styles.metaRow}>
              <View style={styles.dayBadge}>
                <Text style={styles.dayText}>{item.hari}</Text>
              </View>
              <View style={styles.dateRow}>
                <Calendar color={COLORS.textSecondary} size={12} style={{ marginRight: 6 }} />
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
              <MapPin color={COLORS.textSecondary} size={14} style={{ marginRight: 8 }} />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.lokasi}
              </Text>
            </View>

            <View style={styles.footer}>
              <View style={styles.photoInfo}>
                <ImageIcon color={COLORS.textTertiary} size={12} style={{ marginRight: 6 }} />
                <Text style={styles.photoInfoText}>
                  {hasMedia ? `${item.media?.length} foto` : 'Tanpa foto'}
                </Text>
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
                  source={{ uri: toSecureMediaUrl(firstMedia) }}
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
                <FileText color={COLORS.textTertiary} size={28} strokeWidth={1.5} />
                <Text style={styles.noMediaText}>Tanpa foto</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    backgroundColor: COLORS.darkSurface,
  },
  cardInner: { padding: 16 },
  contentRow: { flexDirection: 'row' },
  textContent: { flex: 1, paddingRight: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dayBadge: { marginRight: 10 },
  dayText: { color: COLORS.textSecondary, ...TYPOGRAPHY.badge },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateText: { color: COLORS.textTertiary, fontSize: 12, fontWeight: '500' },
  title: { color: COLORS.text, fontWeight: '600', fontSize: 16, lineHeight: 22, marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  locationText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '500', flex: 1 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkBorder,
  },
  photoInfo: { flexDirection: 'row', alignItems: 'center' },
  photoInfoText: { color: COLORS.textTertiary, fontSize: 12, fontWeight: '500' },
  detailLink: { flexDirection: 'row', alignItems: 'center' },
  detailText: { color: COLORS.primary, fontSize: 13, fontWeight: '600', marginRight: 4 },
  mediaSection: { width: 88, alignItems: 'center', justifyContent: 'center' },
  mediaFrame: {
    width: 88,
    height: 116,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    backgroundColor: COLORS.darkBg,
  },
  mediaImage: { width: '100%', height: '100%' },
  mediaCountBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(2,6,23,0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mediaCountText: { color: 'white', fontSize: 11, fontWeight: '600' },
  noMediaFrame: {
    width: 88,
    height: 116,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.darkBg,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noMediaText: { color: COLORS.textTertiary, fontSize: 11, fontWeight: '500', marginTop: 6 },
});
