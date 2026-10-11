import React, { useState } from 'react';
import { View, ScrollView, Text } from '../../tw';
import { Stack, useRouter } from 'expo-router';
import { Alert, StatusBar, StyleSheet } from 'react-native';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { ScreenHeader, Field, PrimaryButton } from '../../components/profile/FormParts';
import { COLORS as T, SPACING } from '../../tokens';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = 'Nama wajib diisi.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Format email tidak valid.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      const res = await api.patch<{ user: { name: string; email: string } }>('/me', {
        name: name.trim(),
        email: email.trim(),
      });
      await updateUser({ name: res.data.user.name, email: res.data.user.email });
      Alert.alert('Profil tersimpan', 'Perubahan profil Anda sudah disimpan.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Gagal menyimpan', e.message || 'Periksa koneksi, lalu coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Ubah profil" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Field label="Nama lengkap" value={name} onChangeText={setName} error={errors.name} autoComplete="name" />
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <Text style={styles.hint}>Peran dan kata sandi diatur dari menu Ubah kata sandi.</Text>
        <PrimaryButton label={saving ? 'Menyimpan...' : 'Simpan perubahan'} onPress={save} disabled={saving} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.darkBg },
  content: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, paddingBottom: 48 },
  hint: { color: T.textSecondary, fontSize: 13, marginBottom: SPACING.lg },
});
