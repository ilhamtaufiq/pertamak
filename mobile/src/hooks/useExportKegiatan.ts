import { Platform } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { APP_CONFIG } from '../config';
import { useAuthStore } from '../stores/authStore';

export type ExportFormat = 'pdf' | 'docx';

export interface ExportKegiatanParams {
  format: ExportFormat;
  month?: number;
  year?: number;
}

const MIME_TYPES: Record<ExportFormat, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

const UTI_TYPES: Record<ExportFormat, string> = {
  pdf: 'com.adobe.pdf',
  docx: 'org.openxmlformats.wordprocessingml.document',
};

function buildFilename({ format, month, year }: ExportKegiatanParams) {
  let name = 'Laporan_Kegiatan';
  if (year) {
    name += `_${year}`;
    if (month) name += `_${String(month).padStart(2, '0')}`;
  }
  return `${name}.${format}`;
}

function parseErrorMessage(body: string, status: number) {
  try {
    return JSON.parse(body).message || `Export gagal (${status})`;
  } catch {
    return `Export gagal (${status})`;
  }
}

/**
 * Downloads the current user's kegiatan report (PDF/DOCX) and opens the share sheet.
 * The backend scopes non-admin users to their own kegiatan.
 */
export function useExportKegiatan() {
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: async (params: ExportKegiatanParams) => {
      const query = new URLSearchParams();
      if (params.month) query.append('month', String(params.month));
      if (params.year) query.append('year', String(params.year));

      const url = `${APP_CONFIG.API_URL}/kegiatans/export/${params.format}?${query.toString()}`;
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: `${MIME_TYPES[params.format]}, application/json`,
      };
      const filename = buildFilename(params);

      if (Platform.OS === 'web') {
        const response = await fetch(url, { headers });
        if (!response.ok) {
          throw new Error(parseErrorMessage(await response.text(), response.status));
        }
        const blobUrl = URL.createObjectURL(await response.blob());
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(blobUrl);
        return filename;
      }

      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      const result = await FileSystem.downloadAsync(url, fileUri, { headers });

      if (result.status !== 200) {
        const body = await FileSystem.readAsStringAsync(result.uri).catch(() => '');
        await FileSystem.deleteAsync(result.uri, { idempotent: true });
        throw new Error(parseErrorMessage(body, result.status));
      }

      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Fitur berbagi file tidak tersedia di perangkat ini');
      }

      await Sharing.shareAsync(result.uri, {
        mimeType: MIME_TYPES[params.format],
        UTI: UTI_TYPES[params.format],
        dialogTitle: 'Simpan atau bagikan laporan',
      });

      return filename;
    },
  });
}
