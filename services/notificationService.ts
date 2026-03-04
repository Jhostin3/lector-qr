import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from './supabase';
import type { Subscription } from 'expo-modules-core';

// Handler para notificaciones en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Registra el dispositivo para notificaciones push y guarda el token en Supabase.
 * @returns El token de Expo Push o undefined si hay un error.
 */
async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token;

  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device.');
    return undefined;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return undefined;
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas.projectId;
    if (!projectId) {
      console.error('Push notification setup error: Missing projectId in app.json');
      return undefined;
    }
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('Expo Push Token:', token);
  } catch (e) {
    console.error('Error getting push token:', e);
    return undefined;
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

/**
 * Hook para gestionar el registro de notificaciones y las interacciones.
 */
export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(async (token) => {
      if (token) {
        setExpoPushToken(token);
        // Guarda o actualiza el token en la base de datos
        const { error } = await supabase.from('push_tokens').upsert({ token }, { onConflict: 'token' });
        if (error) {
          console.error('Error saving push token to Supabase:', error);
        }
      }
    });

    // Listener para cuando se recibe una notificación (app en primer plano)
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    // Listener para cuando el usuario interactúa con una notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
      // Aquí puedes agregar lógica de navegación basada en la notificación
    });

    // Función de limpieza para remover los listeners
    return () => {
      if (notificationListener.current) {
        // Correct way to remove subscription
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        // Correct way to remove subscription
        responseListener.current.remove();
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
  };
}
