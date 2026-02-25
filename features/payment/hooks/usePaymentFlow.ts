import { useState, useCallback } from 'react';
import { createPaymentIntent, confirmPayment, cancelPaymentIntent } from '../../../services/paymentService';
import type { PaymentIntent, PaymentResult } from '../../../services/paymentService';
import type { QRPayload } from '../../../services/qrService';
import { useHaptics } from '../../../shared/hooks/useHaptics';

export type PaymentFlowState =
  | 'idle'
  | 'creating_intent'
  | 'awaiting_confirmation'
  | 'processing'
  | 'success'
  | 'error';

interface UsePaymentFlowResult {
  flowState: PaymentFlowState;
  paymentIntent: PaymentIntent | null;
  paymentResult: PaymentResult | null;
  errorMessage: string | null;
  initializePayment: (payload: QRPayload) => Promise<void>;
  confirmAndPay: () => Promise<void>;
  resetFlow: () => void;
  cancelFlow: () => Promise<void>;
}

export function usePaymentFlow(): UsePaymentFlowResult {
  const [flowState, setFlowState] = useState<PaymentFlowState>('idle');
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { successNotification, errorNotification, mediumImpact } = useHaptics();

  const initializePayment = useCallback(async (payload: QRPayload) => {
    setFlowState('creating_intent');
    setPaymentIntent(null);
    setPaymentResult(null);
    setErrorMessage(null);

    try {
      mediumImpact();
      const intent = await createPaymentIntent(payload);
      setPaymentIntent(intent);
      setFlowState('awaiting_confirmation');
    } catch (err) {
      errorNotification();
      setErrorMessage('No se pudo crear el intent de pago. Intenta de nuevo.');
      setFlowState('error');
    }
  }, [mediumImpact, errorNotification]);

  const confirmAndPay = useCallback(async () => {
    if (!paymentIntent) return;

    setFlowState('processing');
    mediumImpact();

    try {
      const result = await confirmPayment(paymentIntent.id);
      setPaymentResult(result);

      if (result.success) {
        successNotification();
        setFlowState('success');
      } else {
        errorNotification();
        setErrorMessage(result.errorMessage ?? 'El pago fue rechazado');
        setFlowState('error');
      }
    } catch (err) {
      errorNotification();
      setErrorMessage('Error de red al procesar el pago');
      setFlowState('error');
    }
  }, [paymentIntent, mediumImpact, successNotification, errorNotification]);

  const cancelFlow = useCallback(async () => {
    if (paymentIntent) {
      await cancelPaymentIntent(paymentIntent.id).catch(() => {});
    }
    resetFlow();
  }, [paymentIntent]);

  const resetFlow = useCallback(() => {
    setFlowState('idle');
    setPaymentIntent(null);
    setPaymentResult(null);
    setErrorMessage(null);
  }, []);

  return {
    flowState,
    paymentIntent,
    paymentResult,
    errorMessage,
    initializePayment,
    confirmAndPay,
    resetFlow,
    cancelFlow,
  };
}
