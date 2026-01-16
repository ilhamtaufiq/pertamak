export interface Role {
    id: number;
    name: string;
    guard_name: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    last_seen: string | null;
    latitude: number | null;
    longitude: number | null;
    roles: Role[];
    karyawan?: {
        nama: string;
        jabatan: string;
        foto?: {
            thumb: string;
            url: string;
        };
    };
    created_at: string;
    updated_at: string;
}
