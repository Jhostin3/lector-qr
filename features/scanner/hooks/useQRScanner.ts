import { useState } from 'react';
import { Vibration } from 'react-native';
import { BarCodeScanningResult } from 'expo-camera/next';
import { router } from 'expo-router';
import { validateQrCode, ParsedPayload } from '../../../services/qrService'; // Correct import name

type ScannerState = 'idle' | 'detecting' | 'detected';

export function useQRScanner() {
  const [state, setState] = useState<ScannerState>('idle');

  const onBarCodeScanned = (result: BarCodeScanningResult) => {
    if (state !== 'idle') return; // Evita escaneos múltiples

    Vibration.vibrate(50); // Feedback háptico inicial
    setState('detecting');

    // Corrected function name from validateQRCode to validateQrCode
    const validation = validateQrCode(result.data);

    if (validation.valid && validation.payload) {
      // Feedback háptico positivo: QR detectado exitosamente
      Vibration.vibrate([100, 150]);
      setState('detected');

      // Navegar según el tipo de QR
      if (validation.type === 'payment') {
        router.push({
          pathname: '/payment/confirm',
          params: { ...validation.payload } as any,
        });
      } else if (validation.type === 'info') {
        const payload = validation.payload as any;
        router.push({
          pathname: '/info',
          params: {
            title: payload.title,
            data: JSON.stringify(payload.data),
          },
        });
      }
    } else {
      // Feedback háptico negativo: QR no válido
      Vibration.vibrate([200, 100, 200]);
      console.log('QR no válido:', validation.error);
      // Reinicia para permitir otro escaneo
      setTimeout(() => setState('idle'), 1500);
    }
  };

  const resetScanner = () => {
    setState('idle');
  };

  return {
    scannerState: state,
    onBarCodeScanned,
    resetScanner,
  };
}
