import { supabase } from './supabase';
import type { QRPayload } from './qrService';
import { generateShortId } from '../shared/utils/formatters';
import { sendPushNotification } from './notificationService';

export type PaymentStatus = 'idle' | 'pending' | 'processing' | 'success' | 'failed';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  merchantId: string;
  merchantName: string;
  description: string;
  reference: string;
  status: PaymentStatus;
  createdAt: Date;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  completedAt?: Date;
  errorCode?: string;
  errorMessage?: string;
}

// Simulación de latencia de red realista (ms)
const NETWORK_LATENCY = { min: 800, max: 2000 };
const PROCESSING_LATENCY = { min: 1500, max: 3000 };

// Tasa de fallo simulada (5%)
const FAILURE_RATE = 0.05;

const ERROR_SCENARIOS = [
  { code: 'INSUFFICIENT_FUNDS', message: 'Fondos insuficientes' },
  { code: 'CARD_DECLINED', message: 'Tarjeta declinada por el banco' },
  { code: 'NETWORK_ERROR', message: 'Error de conexión con el banco' },
];

function randomDelay(range: { min: number; max: number }): Promise<void> {
  const ms = Math.floor(Math.random() * (range.max - range.min)) + range.min;
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Crea un Payment Intent simulado a partir del payload del QR.
 */
export async function createPaymentIntent(
  payload: QRPayload,
  amount?: number
): Promise<PaymentIntent> {
  await randomDelay(NETWORK_LATENCY);

  return {
    id: `pi_${generateShortId()}`,
    amount: amount || payload.amount,
    currency: payload.currency,
    merchantId: payload.merchantId,
    merchantName: payload.merchantName,
    description: payload.description,
    reference: payload.reference,
    status: 'pending',
    createdAt: new Date(),
  };
}

/**
 * Confirma y procesa el Payment Intent.
 * Obtiene el vendedor autenticado (seller_id) y guarda en Supabase.
 */
export async function confirmPayment(intent: PaymentIntent): Promise<PaymentResult> {
  await randomDelay(PROCESSING_LATENCY);

  // Obtener el vendedor actualmente autenticado
  const { data: { user: sellerUser } } = await supabase.auth.getUser();
  const sellerId = sellerUser?.id ?? null;

  const shouldFail = Math.random() < FAILURE_RATE;

  if (shouldFail) {
    const error = ERROR_SCENARIOS[Math.floor(Math.random() * ERROR_SCENARIOS.length)];

    await supabase.from('payments').insert({
      merchant_id: intent.merchantId,
      merchant_name: intent.merchantName,
      seller_id: sellerId,
      amount: intent.amount,
      currency: intent.currency,
      description: intent.description,
      reference: intent.reference,
      status: 'failed',
      error_code: error.code,
      error_message: error.message,
    });

    return {
      success: false,
      errorCode: error.code,
      errorMessage: error.message,
    };
  }

  const transactionId = `txn_${generateShortId()}`;
  const completedAt = new Date();

  const { error } = await supabase.from('payments').insert({
    transaction_id: transactionId,
    merchant_id: intent.merchantId,
    merchant_name: intent.merchantName,
    seller_id: sellerId,
    amount: intent.amount,
    currency: intent.currency,
    description: intent.description,
    reference: intent.reference,
    status: 'success',
  });

  if (error) {
    console.error('Supabase insert error:', error);
    return {
      success: false,
      errorCode: 'NETWORK_ERROR',
      errorMessage: 'No se pudo guardar el pago en la base de datos.',
    };
  }

  // Enviar notificaciones push tras pago exitoso
  try {
    const { data: devices, error: devicesError } = await supabase.from('push_tokens').select('token');
    if (devicesError) throw devicesError;

    const notificationPromises = devices.map(device =>
      sendPushNotification(
        device.token,
        '¡Pago Recibido!',
        `Se recibió un pago de ${intent.amount} ${intent.currency} de ${intent.merchantName}.`
      )
    );

    await Promise.all(notificationPromises);
  } catch (e) {
    console.error('Error sending push notifications:', e);
  }

  return {
    success: true,
    transactionId,
    completedAt,
  };
}

/**
 * Cancela un Payment Intent activo.
 */
export async function cancelPaymentIntent(intentId: string): Promise<void> {
  await randomDelay({ min: 300, max: 600 });
}
