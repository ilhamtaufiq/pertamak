import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Image } from '../../tw';
import { Kegiatan } from '../../types/kegiatan';
import { haptics } from '../../services/haptics';
import { MapPin, Calendar, ChevronRight, CheckCircle2, FileText, Image as ImageIcon } from 'lucide-react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LinearGradient, BlurView } from '../../tw';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
      className="mb-4 rounded-[32px] overflow-hidden border border-white/10 bg-slate-900/40 shadow-xl"
    >
      <BlurView intensity={10} tint="dark" className="p-5">
        <View className="flex-row">
          {/* Content Section */}
          <View className="flex-1 pr-4">
            <View className="flex-row items-center mb-3">
              <View className="bg-sky-500/20 px-3 py-1 rounded-full border border-sky-400/20 mr-3">
                <Text className="text-sky-300 font-black text-[10px] uppercase tracking-widest">{item.hari}</Text>
              </View>
              <View className="flex-row items-center">
                <Calendar color="#94A3B8" size={12} className="mr-1.5" />
                <Text className="text-slate-400 text-xs font-bold">
                  {new Date(item.tanggal).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            </View>

            <Text className="text-white font-bold text-lg leading-tight mb-3" numberOfLines={2}>
              {item.uraian_kegiatan}
            </Text>

            <View className="flex-row items-center mb-4">
              <MapPin color="#38BDF8" size={14} className="mr-2" />
              <Text className="text-slate-400 text-sm font-medium flex-1" numberOfLines={1}>
                {item.lokasi}
              </Text>
            </View>

            <View className="flex-row items-center justify-between pt-3 border-t border-white/5">
              <View className="flex-row items-center bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <CheckCircle2 color="#10B981" size={12} className="mr-1.5" />
                <Text className="text-emerald-400 text-[10px] font-black uppercase tracking-tighter">Terverifikasi</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-sky-400 text-xs font-bold mr-1">Detail</Text>
                <ChevronRight color="#38BDF8" size={16} strokeWidth={2.5} />
              </View>
            </View>
          </View>

          {/* Image/Icon Section */}
          <View className="w-24 items-center justify-center">
            {hasMedia ? (
              <View className="w-24 h-32 rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-slate-800">
                <Image 
                  source={{ uri: firstMedia!.replace('localhost', 'pertamak.cianjur.space') }} // Handle localhost in original_url if needed
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <View className="absolute bottom-2 right-2 bg-black/60 px-1.5 py-0.5 rounded-md flex-row items-center">
                  <ImageIcon color="white" size={10} className="mr-1" />
                  <Text className="text-white text-[9px] font-bold">{item.media?.length}</Text>
                </View>
              </View>
            ) : (
              <View className="w-24 h-32 rounded-2xl bg-white/5 border border-white/5 items-center justify-center">
                <FileText color="#475569" size={32} strokeWidth={1} />
                <Text className="text-slate-600 text-[9px] font-black uppercase tracking-widest mt-2">No Media</Text>
              </View>
            )}
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
});
