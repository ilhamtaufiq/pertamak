import { create } from 'zustand';
import { getItemAsync, setItemAsync, deleteItemAsync } from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../lib/logger';
import { queryClient, OFFLINE_CACHE_KEY } from '../lib/queryClient';

// Cached server data belongs to the signed-in user. Drop it whenever the session changes
// so the next person on this device never sees the previous person's kegiatan.
async function clearUserCache() {
  queryClient.clear();
  await AsyncStorage.removeItem(OFFLINE_CACHE_KEY).catch(() => {});
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'karyawan';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  restoreAuth: () => Promise<void>;
  updateUser: (patch: Partial<Pick<User, 'name' | 'email'>>) => Promise<void>;
}

// Helper to handle storage with fallback
const storage = {
  save: async (key: string, value: string) => {
    try {
      await setItemAsync(key, value);
    } catch (e) {
      logger.warn(`SecureStore failed for ${key}, falling back to AsyncStorage:`, e);
      await AsyncStorage.setItem(key, value);
    }
  },
  get: async (key: string) => {
    try {
      return await getItemAsync(key);
    } catch (e) {
      logger.warn(`SecureStore failed for ${key}, falling back to AsyncStorage:`, e);
      return await AsyncStorage.getItem(key);
    }
  },
  remove: async (key: string) => {
    try {
      await deleteItemAsync(key);
    } catch (e) {
      logger.warn(`SecureStore failed for ${key}, falling back to AsyncStorage:`, e);
      await AsyncStorage.removeItem(key);
    }
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  setAuth: async (user, token) => {
    await clearUserCache();
    await storage.save('user_token', token);
    await storage.save('user_data', JSON.stringify(user));
    set({ user, token, isLoading: false });
  },
  clearAuth: async () => {
    await clearUserCache();
    await storage.remove('user_token');
    await storage.remove('user_data');
    set({ user: null, token: null, isLoading: false });
  },
  updateUser: async (patch) => {
    const current = useAuthStore.getState().user;
    if (!current) return;
    const next = { ...current, ...patch };
    await storage.save('user_data', JSON.stringify(next));
    set({ user: next });
  },
  restoreAuth: async () => {
    try {
      const token = await storage.get('user_token');
      const userData = await storage.get('user_data');
      if (token && userData) {
        set({ user: JSON.parse(userData), token, isLoading: false });
      } else {
        set({ user: null, token: null, isLoading: false });
      }
    } catch (e) {
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
