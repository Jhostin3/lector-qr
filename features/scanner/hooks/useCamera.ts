import { useState, useEffect } from 'react';
import { Camera } from 'expo-camera';
import { BarCodeScanningResult } from 'expo-camera/next';
import { router } from 'expo-router';
import { validateQrCode, ParsedPayload } from '../../../services/qrService'; // Corrected path
import { Vibration } from 'react-native';

export function useCamera() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ data }: BarCodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    Vibration.vibrate(100); // Vibrate on scan

    const result = validateQrCode(data);

    if (!result.valid || !result.payload) {
      console.log('Invalid QR ->', result.error);
      setTimeout(() => setScanned(false), 2000);
      return;
    }

    // Navigate based on the QR type
    if (result.type === 'payment') {
      // The params for payment confirmation are already flat
      router.push({
        pathname: '/payment/confirm',
        params: { ...result.payload } as any,
      });
    } else if (result.type === 'info') {
      const payload = result.payload as any; // Cast to access dynamic properties
      router.push({
        pathname: '/info',
        params: {
          title: payload.title,
          data: JSON.stringify(payload.data), // Stringify the data object
        },
      });
    }

    // Do not reset scanner immediately, navigation takes time
  };

  return {
    hasPermission,
    scanned,
    torchOn,
    setTorchOn,
    handleBarCodeScanned,
    resetScanner: () => setScanned(false), // Add a reset function for the scanner screen
  };
}
