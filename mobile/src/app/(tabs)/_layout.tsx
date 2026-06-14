import React from 'react';
import { Tabs, useRouter, Redirect } from 'expo-router';
import { Home, ClipboardList, User, Plus, FolderOpen } from 'lucide-react-native';
import { View, Platform, TouchableOpacity, BlurView } from '@/tw';
import { useAuthStore } from '../../stores/authStore';

export default function TabLayout() {
  const router = useRouter();
  const { token, user, isLoading } = useAuthStore();
  const { restoreAuth } = useAuthStore();

  React.useEffect(() => {
    if (token === null) restoreAuth();
  }, []);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  // Global Auth Guard for entire (tabs) group
  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#38BDF8', // Cyan 400 (Kitabisa vibe)
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 30 : 20,
          left: 16,
          right: 16,
          height: 76,
          borderRadius: 38,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(15, 23, 42, 0.95)',
          borderTopWidth: 0,
          paddingBottom: 12,
          paddingTop: 8,
          elevation: 10,
          boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.3)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={40}
              tint="dark"
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
          ) : null
        ),
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginTop: 2,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, focused }) => (
            <Home color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />

      <Tabs.Screen
        name="media"
        options={{
          title: 'Media',
          tabBarIcon: ({ color, focused }) => (
            <FolderOpen color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />

      {/* FAB: Center PLUS Button */}
      <Tabs.Screen
        name="create-placeholder"
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={{
              top: -20,
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#0EA5E9',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0px 8px 15px rgba(14, 165, 233, 0.5)',
              elevation: 12,
              borderWidth: 4,
              borderColor: '#0F172A',
            }}>
              <Plus color="white" size={32} strokeWidth={3} />
            </View>
          ),
          tabBarButton: (props) => {
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/kegiatan/create')}
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
              >
                {props.children}
              </TouchableOpacity>
            );
          }
        }}
      />

      <Tabs.Screen
        name="kegiatan"
        options={{
          title: 'Jurnal',
          tabBarIcon: ({ color, focused }) => (
            <ClipboardList color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <User color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />

      <Tabs.Screen
        name="maps"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
