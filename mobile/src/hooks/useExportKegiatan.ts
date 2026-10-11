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

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

/** Same pattern the server uses: "Laporan Kegiatan - {Nama} - {Bulan} - {Tahun}". */
function fallbackFilename({ format, month, year }: ExportKegiatanParams, name: string) {
  const bulan = month ? MONTHS[month - 1] : 'Semua Bulan';
  const tahun = year ? String(year) : 'Semua Tahun';
  return `Laporan Kegiatan - ${name} - ${bulan} - ${tahun}.${format}`;
}

function sanitize(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Reads the file name the server chose from Content-Disposition. */
function filenameFromHeaders(headers?: Record<string, string>): string | null {
  const value = headers?.['content-disposition'] ?? headers?.['Content-Disposition'];
  const match = value?.match(/filename="([^"]+)"/);
  return match ? sanitize(match[1]) : null;
}

/**
 * Downloads the current user's kegiatan report (PDF/DOCX) and opens the share sheet.
 * The backend scopes non-admin users to their own kegiatan and names the file.
 */
export function useExportKegiatan() {
  const { token, user } = useAuthStore();

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
      const fallbackName = user?.role === 'admin' ? 'Semua Karyawan' : sanitize(user?.name ?? 'Karyawan');

      if (Platform.OS === 'web') {
        const response = await fetch(url, { headers });
        if (!response.ok) {
          const body = await response.text();
          throw new Error(parseErrorMessage(body, response.status));
        }
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => { responseHeaders[key] = value; });
        const filename = filenameFromHeaders(responseHeaders) ?? fallbackFilename(params, fallbackName);

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

      // Download to a temporary name first, because the final name comes from the response headers
      const tempUri = `${FileSystem.cacheDirectory}export-${Date.now()}.${params.format}`;
      const result = await FileSystem.downloadAsync(url, tempUri, { headers });

      if (result.status !== 200) {
        const body = await FileSystem.readAsStringAsync(result.uri).catch(() => '');
        await FileSystem.deleteAsync(result.uri, { idempotent: true });
        throw new Error(parseErrorMessage(body, result.status));
      }

      const filename = filenameFromHeaders(result.headers) ?? fallbackFilename(params, fallbackName);
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
      await FileSystem.moveAsync({ from: result.uri, to: fileUri });

      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Fitur berbagi file tidak tersedia di perangkat ini');
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: MIME_TYPES[params.format],
        UTI: UTI_TYPES[params.format],
        dialogTitle: 'Simpan atau bagikan laporan',
      });

      return filename;
    },
  });
}

function parseErrorMessage(body: string, status: number) {
  try {
    return JSON.parse(body).message || `Export gagal (${status})`;
  } catch {
    return `Export gagal (${status})`;
  }
}
