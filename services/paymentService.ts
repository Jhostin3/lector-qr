import type { QRPayload } from './qrService';
import { generateShortId } from '../shared/utils/formatters';

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
 * Simula la llamada al backend que generaría un token de pago real.
 */
export async function createPaymentIntent(payload: QRPayload): Promise<PaymentIntent> {
  // Simular latencia de red
  await randomDelay(NETWORK_LATENCY);

  return {
    id: `pi_${generateShortId()}`,
    amount: payload.amount,
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
 * Simula la autorización bancaria y el ciclo completo de pago.
 */
export async function confirmPayment(intentId: string): Promise<PaymentResult> {
  // Simular tiempo de procesamiento del banco
  await randomDelay(PROCESSING_LATENCY);

  // Simular escenario de error ocasional
  const shouldFail = Math.random() < FAILURE_RATE;

  if (shouldFail) {
    const error = ERROR_SCENARIOS[Math.floor(Math.random() * ERROR_SCENARIOS.length)];
    return {
      success: false,
      errorCode: error.code,
      errorMessage: error.message,
    };
  }

  return {
    success: true,
    transactionId: `txn_${generateShortId()}`,
    completedAt: new Date(),
  };
}

/**
 * Cancela un Payment Intent activo.
 */
export async function cancelPaymentIntent(intentId: string): Promise<void> {
  await randomDelay({ min: 300, max: 600 });
  // En producción: llamada al endpoint de cancelación
}
