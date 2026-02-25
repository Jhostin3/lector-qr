import * as Haptics from 'expo-haptics';

// Wrapper seguro: ignora errores en plataformas sin soporte háptico (web, simulador)
const safeImpact = (style: Haptics.ImpactFeedbackStyle): Promise<void> =>
  Haptics.impactAsync(style).catch(() => {});

const safeNotification = (type: Haptics.NotificationFeedbackType): Promise<void> =>
  Haptics.notificationAsync(type).catch(() => {});

export function useHaptics() {
  const lightImpact = () => {
    safeImpact(Haptics.ImpactFeedbackStyle.Light);
  };

  const mediumImpact = () => {
    safeImpact(Haptics.ImpactFeedbackStyle.Medium);
  };

  const heavyImpact = () => {
    safeImpact(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const successNotification = () => {
    safeNotification(Haptics.NotificationFeedbackType.Success);
  };

  const errorNotification = () => {
    safeNotification(Haptics.NotificationFeedbackType.Error);
  };

  const warningNotification = () => {
    safeNotification(Haptics.NotificationFeedbackType.Warning);
  };

  const qrDetected = () => {
    // Double impact distintivo para detección de QR
    safeImpact(Haptics.ImpactFeedbackStyle.Medium).then(() => {
      setTimeout(() => {
        safeImpact(Haptics.ImpactFeedbackStyle.Heavy);
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
