// Kegiatan Types for Jurnal Kegiatan SKP

export interface Dokumentasi {
    id: number;
    url: string;
    thumb: string;
    name: string;
}

export interface Kegiatan {
    id: number;
    user_id: number;
    user_name?: string;
    user?: {
        id: number;
        name: string;
        karyawan?: {
            nama: string;
            nip: string | null;
            jabatan: string;
        };
    };
    tanggal: string;
    hari: string;
    lokasi: string;
    latitude: number | null;
    longitude: number | null;
    uraian_kegiatan: string;
    dokumentasi: Dokumentasi[];
    created_at: string;
    updated_at: string;
}

export interface KegiatanFormData {
    tanggal: string;
    lokasi: string;
    latitude: number | null;
    longitude: number | null;
    uraian_kegiatan: string;
    dokumentasi?: File[];
    delete_dokumentasi?: number[];
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

export interface ApiResponse<T> {
    message: string;
    data: T;
}
