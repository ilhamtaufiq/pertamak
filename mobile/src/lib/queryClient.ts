import { QueryClient, onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

// Sync online status for offline-first architecture
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

export const OFFLINE_CACHE_KEY = 'PERTAMAK_OFFLINE_CACHE';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});
