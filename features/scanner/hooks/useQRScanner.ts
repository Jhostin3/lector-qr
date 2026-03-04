import { useState, useCallback } from 'react';
import { Audio } from 'expo-av';
import { BarcodeScanningResult, Camera } from 'expo-camera';
import { Alert } from 'react-native';
import { QRPayload, QRState, validateQR } from '../../../services/qrService';

interface UseQRScannerOptions {
  onValidQR?: (payload: QRPayload) => void;
}

export function useQRScanner({ onValidQR }: UseQRScannerOptions) {
  const [state, setState] = useState<QRState>('scanning');
  const [lastError, setLastError] = useState<string | null>(null);
  const [permission, requestPermission] = Camera.useCameraPermissions();

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
      if (state !== 'scanning') return;

      setState('detected');

      try {
        const payload = validateQR(result.data);
        playSound(require('../../../../assets/sounds/success.mp3'));
        onValidQR?.(payload);
      } catch (error: any) {
        setLastError(error.message);
        setState('error');
        playSound(require('../../../../assets/sounds/error.mp3'));

        setTimeout(() => {
          setState('scanning');
          setLastError(null);
        }, 2000);
      }
    },
    [state, onValidQR]
  );

  const resetScanner = useCallback(() => {
    setState('scanning');
    setLastError(null);
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
