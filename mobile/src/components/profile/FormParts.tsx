import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from '../../tw';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { TYPOGRAPHY, COLORS as T, RADIUS, SPACING, BUTTON } from '../../tokens';

export function ScreenHeader({ title }: { title: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 4 }]}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.iconBtn}
        accessibilityRole="button"
        accessibilityLabel="Kembali"
      >
        <ChevronLeft color={T.text} size={22} />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.spacer} />
    </View>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  ...rest
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
  autoComplete?: 'password' | 'email' | 'name' | 'off';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={T.textTertiary}
        accessibilityLabel={label}
        style={[styles.input, !!error && styles.inputError]}
        {...rest}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

export function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={[styles.primary, disabled && { opacity: 0.6 }]}
    >
      <Text style={styles.primaryText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
  },
  title: { color: T.text, ...TYPOGRAPHY.subheading },
  iconBtn: {
    width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: T.darkBorder, backgroundColor: T.darkSurface,
  },
  spacer: { width: 44, height: 44 },
  field: { marginBottom: SPACING.lg },
  label: { color: T.textSecondary, ...TYPOGRAPHY.caption, marginBottom: SPACING.xs },
  input: {
    height: BUTTON.primary.height - 8, borderRadius: RADIUS.md, borderWidth: 1, borderColor: T.darkBorder,
    backgroundColor: T.darkSurface, color: T.text, paddingHorizontal: SPACING.lg, ...TYPOGRAPHY.bodySecondary,
  },
  inputError: { borderColor: T.rose },
  error: { color: T.rose, ...TYPOGRAPHY.caption, marginTop: SPACING.xs },
  primary: {
    height: BUTTON.primary.height, borderRadius: RADIUS.md, backgroundColor: T.primaryDeep,
    alignItems: 'center', justifyContent: 'center', marginTop: SPACING.md,
  },
  primaryText: { color: 'white', ...TYPOGRAPHY.bodySecondary },
});
