import * as Haptics from 'expo-haptics';

export function useHaptics() {
  const lightImpact = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const mediumImpact = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const heavyImpact = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const successNotification = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const errorNotification = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const warningNotification = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const qrDetected = () => {
    // Double impact para feedback distintivo de QR detectado
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).then(() => {
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 80);
    });
  };

  return {
    lightImpact,
    mediumImpact,
    heavyImpact,
    successNotification,
    errorNotification,
    warningNotification,
    qrDetected,
  };
}
