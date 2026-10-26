import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// expo-haptics has no web implementation; every call here is a no-op on web
// and never throws, so UI code can call these unconditionally.
const enabled = Platform.OS !== 'web';

export const haptics = {
  tap() {
    if (enabled) Haptics.selectionAsync().catch(() => {});
  },
  impact() {
    if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  success() {
    if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
  warning() {
    if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  },
};
