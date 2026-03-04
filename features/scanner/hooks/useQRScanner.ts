import { useState, useCallback, useRef } from 'react';
import { Vibration } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import type { BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
import { validateQrCode } from '../../../services/qrService';

export type ScannerState = 'scanning' | 'detected' | 'error';

interface UseQRScannerResult {
  scannerState: ScannerState;
  permission: ReturnType<typeof useCameraPermissions>[0];
  requestPermission: () => void;
  onBarcodeScanned: (result: BarcodeScanningResult) => void;
  resetScanner: () => void;
  lastError: string | null;
}

export function useQRScanner(): UseQRScannerResult {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannerState, setScannerState] = useState<ScannerState>('scanning');
  const [lastError, setLastError] = useState<string | null>(null);
  const isProcessing = useRef(false);

  const onBarcodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      if (isProcessing.current || scannerState !== 'scanning') return;
      isProcessing.current = true;
      setScannerState('detected');

      const validation = validateQrCode(result.data);

      if (validation.valid && validation.payload) {
        Vibration.vibrate([100, 150]);

        if (validation.type === 'payment') {
          setTimeout(() => {
            router.push({
              pathname: '/payment/confirm',
              params: { payload: JSON.stringify(validation.payload) },
            });
          }, 400);
        } else if (validation.type === 'info') {
          const infoPayload = validation.payload as { title: string; data: Record<string, string> };
          setTimeout(() => {
            router.push({
              pathname: '/info',
              params: {
                title: infoPayload.title,
                data: JSON.stringify(infoPayload.data),
              },
            });
          }, 400);
        }
      } else {
        Vibration.vibrate([200, 100, 200]);
        setLastError(validation.error ?? 'QR no válido');
        setScannerState('error');
        setTimeout(() => {
          setScannerState('scanning');
          setLastError(null);
          isProcessing.current = false;
        }, 2000);
      }
    },
    [scannerState]
  );

  const resetScanner = useCallback(() => {
    setScannerState('scanning');
    setLastError(null);
    isProcessing.current = false;
  }, []);

  const handleRequestPermission = useCallback(() => {
    requestPermission().catch(() => {});
  }, [requestPermission]);

  return {
    scannerState,
    permission,
    requestPermission: handleRequestPermission,
    onBarcodeScanned,
    resetScanner,
    lastError,
  };
}
