import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import type { Kegiatan, Media } from '../types/kegiatan';
import { toSecureMediaUrl } from '../lib/mediaUrl';

const MAX_CAPTION = 2000; // Instagram caption limit is 2,200 characters

/**
 * Instagram does not accept a pre-filled caption from another app, so the caption is
 * copied to the clipboard and pasted by the user when creating the post.
 */
export function buildCaption(kegiatan: Kegiatan): string {
  const tanggal = new Date(kegiatan.tanggal).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const uraian = kegiatan.uraian_kegiatan.trim().slice(0, MAX_CAPTION - 200);

  return [
    uraian,
    '',
    `Lokasi: ${kegiatan.lokasi}`,
    `Tanggal: ${kegiatan.hari}, ${tanggal}`,
    '',
    '#PertamakHub #KabupatenCianjur #LaporanKegiatan',
  ].join('\n');
}

function extensionFor(mime: string) {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/gif') return 'gif';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}

/**
 * Shares one photo of a kegiatan through the system share sheet (Instagram is in the list),
 * and copies the caption to the clipboard. Returns the caption that was copied.
 */
export async function shareKegiatanPhoto(kegiatan: Kegiatan, photo: Media): Promise<string> {
  const caption = buildCaption(kegiatan);

  if (Platform.OS === 'web') {
    const response = await fetch(toSecureMediaUrl(photo.original_url));
    if (!response.ok) throw new Error('Foto tidak bisa diunduh.');
    const blob = await response.blob();
    const file = new File([blob], `pertamak-${kegiatan.id}-${photo.id}.${extensionFor(photo.mime_type)}`, { type: photo.mime_type });

    await navigator.clipboard?.writeText(caption).catch(() => {});

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text: caption });
    } else {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }
    return caption;
  }

  const uri = `${FileSystem.cacheDirectory}pertamak-${kegiatan.id}-${photo.id}.${extensionFor(photo.mime_type)}`;
  const result = await FileSystem.downloadAsync(toSecureMediaUrl(photo.original_url), uri);
  if (result.status !== 200) {
    await FileSystem.deleteAsync(uri, { idempotent: true });
    throw new Error('Foto tidak bisa diunduh. Periksa koneksi, lalu coba lagi.');
  }

  await Clipboard.setStringAsync(caption);

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Fitur berbagi tidak tersedia di perangkat ini.');
  }

  await Sharing.shareAsync(uri, {
    mimeType: photo.mime_type,
    UTI: photo.mime_type === 'image/png' ? 'public.png' : 'public.jpeg',
    dialogTitle: 'Bagikan foto',
  });

  return caption;
}
