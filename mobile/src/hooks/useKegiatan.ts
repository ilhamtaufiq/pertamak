import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { Kegiatan } from '../types/kegiatan';
import { APP_CONFIG } from '../config';
import { useAuthStore } from '../stores/authStore';

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

export function useKegiatan(params?: { day?: number; month?: number; year?: number; user_id?: number }) {
  const { token } = useAuthStore();
  
  return useInfiniteQuery({
    queryKey: ['kegiatans', params || 'all'],
    queryFn: async ({ pageParam = 1 }) => {
      const queryParams = new URLSearchParams();
      queryParams.append('page', String(pageParam));
      queryParams.append('per_page', '7'); // Request 7 items as per user request

      if (params?.day) queryParams.append('day', params.day.toString());
      if (params?.month) queryParams.append('month', params.month.toString());
      if (params?.year) queryParams.append('year', params.year.toString());
      if (params?.user_id) queryParams.append('user_id', params.user_id.toString());

      const url = `${APP_CONFIG.API_URL}/kegiatans?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data kegiatan');
      }

      return (await response.json()) as PaginatedResponse<Kegiatan>;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.next_page_url ? lastPage.current_page + 1 : undefined,
    enabled: !!token,
  });
}

export function useKegiatanById(id: number) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['kegiatans', id],
    queryFn: async () => {
      const response = await fetch(`${APP_CONFIG.API_URL}/kegiatans/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil detail kegiatan');
      }

      return (await response.json()) as Kegiatan;
    },
    enabled: !!token && !!id,
  });
}

export function useCreateKegiatan() {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`${APP_CONFIG.API_URL}/kegiatans`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan kegiatan');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kegiatans'] });
    },
  });
}

export function useUpdateKegiatan(id: number) {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      // In Laravel/Symphony, sometimes PUT doesn't work with FormData, 
      // so we use POST with _method=PUT override
      formData.append('_method', 'PUT');
      
      const response = await fetch(`${APP_CONFIG.API_URL}/kegiatans/${id}`, {
        method: 'POST', 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal memperbarui kegiatan');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kegiatans'] });
      queryClient.invalidateQueries({ queryKey: ['kegiatans', id] });
    },
  });
}

export function useDeleteKegiatan() {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${APP_CONFIG.API_URL}/kegiatans/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Gagal menghapus kegiatan');
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kegiatans'] });
    },
  });
}
