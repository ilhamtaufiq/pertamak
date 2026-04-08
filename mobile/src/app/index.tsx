import { Redirect } from 'expo-router';
import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { View, ActivityIndicator } from 'react-native';

export default function EntryPoint() {
  const { user, token, isLoading, restoreAuth } = useAuthStore();
  
  useEffect(() => {
    restoreAuth();
  }, [restoreAuth]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0EA5E9', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="white" size="large" />
      </View>
    );
  }
  
  if (!user || !token) {
    return <Redirect href="/(auth)/login" />;
  }
  
  return <Redirect href="/(tabs)" />;
}
