import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface Folder {
  id: number;
  name: string;
  parent_id: number | null;
  user_id: number;
  owner_name?: string;
  created_at: string;
}

export interface FileMedia {
  id: number;
  name: string;
  size: number;
  human_size: string;
  mime_type: string;
  url: string;
  original_url: string;
  thumb: string | null;
  created_at: string;
  owner_name: string;
}

export interface DirectoryResponse {
  folders: Folder[];
  files: FileMedia[];
  breadcrumbs: { id: number; name: string }[];
}

export function useMedia(parentId: number | null = null) {
  return useQuery({
    queryKey: ['media', parentId],
    queryFn: async () => {
      const response = await api.get<DirectoryResponse>('/v1/media', {
        params: { parent_id: parentId }
      });
      return response.data;
    }
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, parentId }: { name: string; parentId: number | null }) => {
      const response = await api.post('/v1/media/folders', { name, parent_id: parentId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    }
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ formData }: { formData: FormData }) => {
      const response = await api.post('/v1/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    }
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ type, id }: { type: 'folder' | 'file'; id: number }) => {
      const response = await api.delete(`/v1/media/${type}/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    }
  });
}

export function useRenameItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ type, id, name, folderId }: { type: 'folder' | 'file'; id: number; name?: string; folderId?: number | null }) => {
      const response = await api.put(`/v1/media/${type}/${id}/rename`, { 
        name, 
        folder_id: type === 'file' ? folderId : undefined,
        parent_id: type === 'folder' ? folderId : undefined
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    }
  });
}

export function useAllFolders() {
  return useQuery({
    queryKey: ['media', 'all-folders'],
    queryFn: async () => {
      const response = await api.get<Folder[]>('/v1/media/all-folders');
      return response.data;
    }
  });
}
