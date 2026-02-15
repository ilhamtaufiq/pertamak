import React, { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../lib/api';
import type { MediaExplorerResponse, MediaFile, Folder } from '../types/media';

interface MediaContextType {
    data: MediaExplorerResponse | null;
    loading: boolean;
    uploadingFiles: { name: string; progress: number }[];
    currentFolderId: number | null;
    setCurrentFolderId: (id: number | null) => void;
    fetchDirectory: (parentId?: number | null) => Promise<void>;
    uploadFile: (file: File, folderId?: number | null) => Promise<MediaFile>;
    createFolder: (name: string, parentId?: number | null) => Promise<Folder>;
    renameItem: (type: 'folder' | 'file', id: number, newName: string) => Promise<void>;
    deleteItem: (type: 'folder' | 'file', id: number) => Promise<void>;
    moveItem: (type: 'folder' | 'file', id: number, targetFolderId: number | null) => Promise<void>;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export function MediaProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<MediaExplorerResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
    const [uploadingFiles, setUploadingFiles] = useState<{ name: string; progress: number }[]>([]);

    const fetchDirectory = useCallback(async (parentId: number | null = currentFolderId) => {
        setLoading(true);
        try {
            const response = await api.get<MediaExplorerResponse>('/v1/media', {
                parent_id: parentId || ''
            });
            setData(response);
            setCurrentFolderId(parentId);
        } catch (err) {
            console.error('Failed to fetch media', err);
        } finally {
            setLoading(false);
        }
    }, [currentFolderId]);

    const uploadFile = async (file: File, folderId: number | null = currentFolderId) => {
        const fileObj = { name: file.name, progress: 0 };
        setUploadingFiles(prev => [...prev, fileObj]);

        const formData = new FormData();
        formData.append('file', file);
        if (folderId) formData.append('folder_id', String(folderId));

        try {
            // Simplified progress: start at 10%
            setUploadingFiles(prev => prev.map(f => f.name === file.name ? { ...f, progress: 10 } : f));

            const response = await api.post<MediaFile>('/v1/media/upload', formData);

            setUploadingFiles(prev => prev.map(f => f.name === file.name ? { ...f, progress: 100 } : f));
            setTimeout(() => {
                setUploadingFiles(prev => prev.filter(f => f.name !== file.name));
            }, 1000);

            await fetchDirectory(folderId);
            return response;
        } catch (err) {
            setUploadingFiles(prev => prev.filter(f => f.name !== file.name));
            throw err;
        }
    };

    const createFolder = async (name: string, parentId: number | null = currentFolderId) => {
        const response = await api.post<Folder>('/v1/media/folders', { name, parent_id: parentId });
        await fetchDirectory(parentId);
        return response;
    };

    const renameItem = async (type: 'folder' | 'file', id: number, newName: string) => {
        await api.patch(`/v1/media/${type}/${id}`, { name: newName });
        await fetchDirectory(currentFolderId);
    };

    const deleteItem = async (type: 'folder' | 'file', id: number) => {
        await api.delete(`/v1/media/${type}/${id}`);
        await fetchDirectory(currentFolderId);
    };

    const moveItem = async (type: 'folder' | 'file', id: number, targetFolderId: number | null) => {
        const payload = type === 'folder' ? { parent_id: targetFolderId } : { folder_id: targetFolderId };
        await api.patch(`/v1/media/${type}/${id}`, payload);
        await fetchDirectory(currentFolderId);
    };

    return (
        <MediaContext.Provider value={{
            data,
            loading,
            uploadingFiles,
            currentFolderId,
            setCurrentFolderId,
            fetchDirectory,
            uploadFile,
            createFolder,
            renameItem,
            deleteItem,
            moveItem
        }}>
            {children}
        </MediaContext.Provider>
    );
}

export const useMedia = () => {
    const context = useContext(MediaContext);
    if (!context) throw new Error('useMedia must be used within MediaProvider');
    return context;
};
