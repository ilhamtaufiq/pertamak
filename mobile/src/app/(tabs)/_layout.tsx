import React from 'react';
import { Tabs, useRouter, Redirect } from 'expo-router';
import { Home, ClipboardList, User, Plus, FolderOpen } from 'lucide-react-native';
import { View, Platform, TouchableOpacity } from '@/tw';
import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY } from '@/tokens';
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
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 30 : 20,
          left: 16,
          right: 16,
          height: 68,
          borderRadius: RADIUS.lg,
          backgroundColor: COLORS.darkSurface,
          borderTopWidth: 1,
          borderTopColor: COLORS.darkBorder,
          borderWidth: 1,
          borderColor: COLORS.darkBorder,
          paddingBottom: 10,
          paddingTop: 8,
          ...SHADOWS.floating,
        },
        tabBarLabelStyle: {
          ...TYPOGRAPHY.badge,
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
              top: -18,
              width: 56,
              height: 56,
              borderRadius: RADIUS.lg,
              backgroundColor: COLORS.primaryDeep,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 4,
              borderColor: COLORS.darkBg,
            }}>
              <Plus color="white" size={28} strokeWidth={2.5} />
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
