export interface MediaFile {
    id: number;
    name: string;
    size: number;
    mime_type: string;
    url: string;
    created_at: string;
    owner_name?: string;
}

export interface Folder {
    id: number;
    name: string;
    parent_id: number | null;
    user_id: number;
    created_at: string;
    updated_at: string;
    owner_name?: string;
}

export interface Breadcrumb {
    id: number | null;
    name: string;
}

export interface MediaExplorerResponse {
    folders: Folder[];
    files: MediaFile[];
    breadcrumbs: Breadcrumb[];
}
