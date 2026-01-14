// Jadwal Piket Types

import type { Karyawan } from './karyawan';

export type Hari = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
export type Shift = 'Pagi' | 'Siang' | 'Malam';

export interface JadwalPiket {
    id: number;
    hari: Hari;
    tanggal: string;
    shift: Shift;
    karyawan_id: number;
    karyawan: Karyawan;
    created_at: string;
    updated_at: string;
}

export interface JadwalPiketFormData {
    hari: Hari;
    tanggal: string;
    shift: Shift;
    karyawan_id: number;
}

export interface JadwalPiketResponse {
    data: JadwalPiket[];
    grouped: Record<Hari, Record<Shift, { id: number; karyawan_id: number; karyawan: Karyawan }[]>>;
}

export const HARI_LIST: Hari[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
export const SHIFT_LIST: Shift[] = ['Pagi', 'Siang', 'Malam'];
