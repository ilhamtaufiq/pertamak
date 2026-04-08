export interface Kegiatan {
  id: number;
  user_id: number;
  tanggal: string;
  hari: string;
  lokasi: string;
  uraian_kegiatan: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
  media?: Media[];
  user?: {
    id: number;
    name: string;
    karyawan?: {
      jabatan?: string;
    };
  };
}

export interface Media {
  id: number;
  model_id: number;
  collection_name: string;
  name: string;
  file_name: string;
  mime_type: string;
  size: number;
  original_url: string;
  preview_url?: string;
  order_column: number;
  created_at: string;
  updated_at: string;
}
