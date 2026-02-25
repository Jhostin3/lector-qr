import { useState, useCallback, useRef } from 'react';
import { useCameraPermissions } from 'expo-camera';
import type { BarcodeScanningResult } from 'expo-camera';
import { validateQRCode } from '../../../services/qrService';
import type { QRPayload } from '../../../services/qrService';
import { useHaptics } from '../../../shared/hooks/useHaptics';

export type ScannerState = 'requesting' | 'denied' | 'scanning' | 'detected' | 'error';

interface UseQRScannerResult {
  state: ScannerState;
  permission: ReturnType<typeof useCameraPermissions>[0];
  requestPermission: () => void;
  onBarcodeScanned: (result: BarcodeScanningResult) => void;
  resetScanner: () => void;
  lastError: string | null;
}

export function useQRScanner(
  onValidQR: (payload: QRPayload) => void
): UseQRScannerResult {
  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<ScannerState>('scanning');
  const [lastError, setLastError] = useState<string | null>(null);
  const isProcessing = useRef(false);
  const { qrDetected, errorNotification } = useHaptics();

  const onBarcodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      // Evitar múltiples disparos rápidos del scanner
      if (isProcessing.current || state === 'detected') return;
      isProcessing.current = true;

      setState('detected');

      const validation = validateQRCode(result.data);

      if (validation.valid) {
        // Feedback háptico positivo: QR detectado exitosamente
        qrDetected();
        // Pequeña pausa para que el usuario vea el feedback visual
        setTimeout(() => {
          onValidQR(validation.payload);
        }, 400);
      } else {
        errorNotification();
        setLastError(validation.error);
        setState('error');
        // Auto-reset tras error
        setTimeout(() => {
          setState('scanning');
          setLastError(null);
          isProcessing.current = false;
        }, 2000);
      }
    },
    [state, onValidQR, qrDetected, errorNotification]
  );

  const resetScanner = useCallback(() => {
    setState('scanning');
    setLastError(null);
    isProcessing.current = false;
  }, []);

  const handleRequestPermission = useCallback(() => {
    setState('requesting');
    requestPermission().catch(() => {});
  }, [requestPermission]);

  return {
    state,
    permission,
    requestPermission: handleRequestPermission,
    onBarcodeScanned,
    resetScanner,
    lastError,
  };
}
