import React, { useState } from 'react';
import { View, ScrollView, Text } from '../../tw';
import { Stack, useRouter } from 'expo-router';
import { Alert, StatusBar, StyleSheet } from 'react-native';
import { api } from '../../lib/api';
import { ScreenHeader, Field, PrimaryButton } from '../../components/profile/FormParts';
import { COLORS as T, SPACING } from '../../tokens';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const found: typeof errors = {};
    if (!current) found.current = 'Masukkan kata sandi saat ini.';
    if (next.length < 8) found.next = 'Kata sandi baru minimal 8 karakter.';
    if (confirm !== next) found.confirm = 'Konfirmasi tidak sama dengan kata sandi baru.';
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      await api.put('/me/password', {
        current_password: current,
        password: next,
        password_confirmation: confirm,
      });
      Alert.alert(
        'Kata sandi diubah',
        'Perangkat lain akan diminta masuk ulang. Perangkat ini tetap masuk.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (e: any) {
      // Server reports a wrong current password as a field error
      setErrors({ current: e.message || 'Kata sandi saat ini tidak sesuai.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Ubah kata sandi" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Field
          label="Kata sandi saat ini"
          value={current}
          onChangeText={setCurrent}
          error={errors.current}
          secureTextEntry
          autoComplete="password"
          autoCapitalize="none"
        />
        <Field
          label="Kata sandi baru"
          value={next}
          onChangeText={setNext}
          error={errors.next}
          secureTextEntry
          autoComplete="password"
          autoCapitalize="none"
        />
        <Field
          label="Ulangi kata sandi baru"
          value={confirm}
          onChangeText={setConfirm}
          error={errors.confirm}
          secureTextEntry
          autoComplete="password"
          autoCapitalize="none"
        />
        <Text style={styles.hint}>Minimal 8 karakter. Setelah diubah, perangkat lain harus masuk ulang.</Text>
        <PrimaryButton label={saving ? 'Menyimpan...' : 'Ubah kata sandi'} onPress={save} disabled={saving} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.darkBg },
  content: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, paddingBottom: 48 },
  hint: { color: T.textSecondary, fontSize: 13, marginBottom: SPACING.lg },
});
