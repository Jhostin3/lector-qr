import { useState, useCallback, useRef } from 'react';
import { Audio } from 'expo-audio';
import { Vibration } from 'react-native';
import { Camera, BarcodeScanningResult } from 'expo-camera';
import { QRPayload, QRState, validateQR } from '../../../services/qrService';

interface UseQRScannerOptions {
  onValidQR?: (payload: QRPayload) => void;
}

export function useQRScanner({ onValidQR }: UseQRScannerOptions) {
  const [state, setState] = useState<QRState>('scanning');
  const [lastError, setLastError] = useState<string | null>(null);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const isProcessing = useRef(false);

  const playSound = async (soundFile: any) => {
    try {
      const { sound } = await Audio.Sound.createAsync(soundFile);
      await sound.playAsync();
    } catch (error) {
      console.warn('Could not play sound', error);
    }
  };

  const onBarcodeScanned = useCallback(
    async (result: BarcodeScanningResult) => {
      if (isProcessing.current || state !== 'scanning') return;

      isProcessing.current = true;
      setState('detected');

      try {
        const payload = validateQR(result.data);
        Vibration.vibrate(100);
        // playSound(require('../../../../assets/sounds/success.mp3'));
        onValidQR?.(payload);
      } catch (error: any) {
        Vibration.vibrate([100, 200, 100]);
        setLastError(error.message);
        setState('error');
        // playSound(require('../../../../assets/sounds/error.mp3'));

        setTimeout(() => {
          setState('scanning');
          setLastError(null);
          isProcessing.current = false;
        }, 2000);
      }
    },
    [state, onValidQR]
  );

  const resetScanner = useCallback(() => {
    setState('scanning');
    setLastError(null);
    isProcessing.current = false;
  }, []);

  return {
    permission,
    requestPermission,
    onBarcodeScanned,
    state,
    lastError,
    resetScanner,
  };
}
