import { Redirect } from 'expo-router';

/**
 * This is a placeholder file for the center FAB in navigation.
 * The actual navigation is handled by the custom tabBarButton in _layout.tsx.
 */
export default function CreatePlaceholder() {
  return <Redirect href="/kegiatan/create" />;
}
