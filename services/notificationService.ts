import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from './supabase';
import type { Subscription } from 'expo-modules-core';

// ¿Estamos corriendo dentro de Expo Go?
// En Expo Go SDK 53+ las push notifications fueron eliminadas.
const IS_EXPO_GO = Constants.appOwnership === 'expo';

// El projectId debe ser un UUID real, no el placeholder
const PROJECT_ID: string | undefined = Constants.expoConfig?.extra?.eas?.projectId;
const HAS_VALID_PROJECT_ID =
  typeof PROJECT_ID === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(PROJECT_ID);

// Solo configurar el handler si no estamos en Expo Go
if (!IS_EXPO_GO) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Registra el dispositivo para notificaciones push y guarda el token en Supabase.
 * En Expo Go o sin projectId válido, retorna undefined silenciosamente.
 */
async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  if (IS_EXPO_GO || !HAS_VALID_PROJECT_ID) return undefined;
  if (!Device.isDevice) return undefined;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return undefined;

  try {
    const token = (await Notifications.getExpoPushTokenAsync({ projectId: PROJECT_ID! })).data;

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  } catch (e) {
    console.warn('Push token no disponible:', e);
    return undefined;
  }
}

/**
 * Hook para gestionar el registro de notificaciones y las interacciones.
 * Es seguro en Expo Go: no hace nada si no hay soporte.
 */
export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

  useEffect(() => {
    if (IS_EXPO_GO || !HAS_VALID_PROJECT_ID) return;

    registerForPushNotificationsAsync().then(async (token) => {
      if (token) {
        setExpoPushToken(token);
        const { error } = await supabase.from('push_tokens').upsert({ token }, { onConflict: 'token' });
        if (error) console.warn('Error guardando push token:', error);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener((n) => {
      setNotification(n);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return { expoPushToken, notification };
}

/**
 * Envía una notificación push a través de la API de Expo.
 * Usada internamente por paymentService tras un pago exitoso.
 * No-op si no hay soporte.
 */
export async function sendPushNotification(
  token: string,
  title: string,
  body: string
): Promise<void> {
  if (IS_EXPO_GO || !HAS_VALID_PROJECT_ID) return;

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: token, title, body, sound: 'default' }),
  }).catch(() => {});
}
