import { Alert, Platform } from 'react-native';

/**
 * Two-button confirmation that works on native and react-native-web.
 * react-native-web does not implement Alert button callbacks, so on web we use
 * window.confirm, which blocks until the user answers.
 */
export function confirmAction({
  title,
  message,
  confirmText,
  destructive = false,
}: {
  title: string;
  message: string;
  confirmText: string;
  destructive?: boolean;
}): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Batal', style: 'cancel', onPress: () => resolve(false) },
      { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
    ], { cancelable: true, onDismiss: () => resolve(false) });
  });
}
