import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { queryClient, OFFLINE_CACHE_KEY } from '../lib/queryClient';

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: OFFLINE_CACHE_KEY,
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
