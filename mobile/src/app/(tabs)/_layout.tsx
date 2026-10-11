import React from 'react';
import { Tabs, useRouter, Redirect } from 'expo-router';
import { Home, ClipboardList, User, Plus, FolderOpen } from 'lucide-react-native';
import { View, TouchableOpacity } from '@/tw';
import { COLORS, RADIUS, SPACING } from '@/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';

const BAR_HEIGHT = 60;

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token, isLoading, restoreAuth } = useAuthStore();

  React.useEffect(() => {
    if (token === null) restoreAuth();
  }, []);

  if (isLoading) {
    return null;
  }

  // Global auth guard for the whole (tabs) group
  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  const iconFor = (Icon: any) => ({ color, focused }: { color: string; focused: boolean }) => (
    <Icon color={color} size={22} strokeWidth={focused ? 2.25 : 2} />
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        // Full-width, flat bar anchored to the bottom edge, padded for the home indicator
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: BAR_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: SPACING.xs,
          backgroundColor: COLORS.darkSurface,
          borderTopWidth: 1,
          borderTopColor: COLORS.darkBorder,
          elevation: 0,
        },
        tabBarItemStyle: {
          paddingTop: SPACING.xs,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: iconFor(Home),
        }}
      />

      <Tabs.Screen
        name="kegiatan"
        options={{
          title: 'Jurnal',
          tabBarIcon: iconFor(ClipboardList),
        }}
      />

      {/* Center action: opens the create form. Not a real screen. */}
      <Tabs.Screen
        name="create-placeholder"
        options={{
          title: '',
          tabBarIcon: () => (
            <View
              style={{
                marginTop: -20,
                width: 52,
                height: 52,
                borderRadius: RADIUS.lg,
                backgroundColor: COLORS.primaryDeep,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 4,
                borderColor: COLORS.darkSurface,
              }}
            >
              <Plus color="white" size={24} strokeWidth={2.5} />
            </View>
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/kegiatan/create')}
              accessibilityRole="button"
              accessibilityLabel="Buat kegiatan baru"
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              {props.children}
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="media"
        options={{
          title: 'Media',
          tabBarIcon: iconFor(FolderOpen),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: iconFor(User),
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
