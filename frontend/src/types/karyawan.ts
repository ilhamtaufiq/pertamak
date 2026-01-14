// Karyawan Types

export interface Karyawan {
    id: number;
    nama: string;
    jabatan: string;
    nip: string | null;
    no_hp: string | null;
    foto: {
        id: number;
        url: string;
        thumb: string;
    } | null;
    created_at: string;
    updated_at: string;
}

export interface KaryawanFormData {
    nama: string;
    jabatan: string;
    nip?: string;
    no_hp?: string;
    foto?: File;
    delete_foto?: boolean;
}
