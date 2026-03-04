/* eslint-disable @typescript-eslint/no-unused-vars */
import { URL } from 'react-native-url-polyfill';

const VALID_PREFIXES = ['pay://', 'checkout://'];

export interface QRPayload {
  merchantId: string; // Identificador único del comercio
  merchantName: string; // Nombre del comercio
  amount: number; // Monto a pagar
  currency: string; // Moneda (ej. MXN, USD)
  description: string; // Descripción de la compra
  reference: string; // Referencia única de la transacción
}

export interface InfoPayload {
  title: string;
  data: { [key: string]: string };
}

export type ParsedPayload = QRPayload | InfoPayload;

export interface QRValidationResult {
  valid: boolean;
  type?: 'payment' | 'info';
  payload?: ParsedPayload;
  error?: string;
}

/**
 * Valida y parsea el contenido de un código QR.
 * Soporta múltiples formatos: URL de pago estructurada, JSON y texto simple.
 * @param rawData El contenido de texto del código QR.
 * @returns Un objeto QRValidationResult.
 */
export function validateQrCode(rawData: string): QRValidationResult {
  if (!rawData || typeof rawData !== 'string') {
    return { valid: false, error: 'El QR está vacío o no es válido.' };
  }

  try {
    // Detectar si es un QR de pago con prefijo válido
    const hasValidPrefix = VALID_PREFIXES.some(prefix =>
      rawData.toLowerCase().startsWith(prefix.toLowerCase())
    );

    if (hasValidPrefix) {
      return parseStructuredQR(rawData);
    }

    // Intentar parsear JSON directo (QR generados internamente o de info)
    if (rawData.startsWith('{')) {
      return parseJsonQR(rawData);
    }

    // Simular QR de demo para testing en entorno académico
    if (rawData.startsWith('DEMO_')) {
      return parseDemoQR(rawData);
    }

    // QR genérico: construir payload simulado para cualquier QR real
    return {
      valid: true,
      type: 'payment',
      payload: buildGenericPayload(rawData),
    };
  } catch (e: any) {
    return { valid: false, error: `Error inesperado: ${e.message}` };
  }

  function parseStructuredQR(data: string): QRValidationResult {
    try {
      const url = new URL(data.replace('pay://', 'https://').replace('checkout://', 'https://'));
      const params = url.searchParams;

      const amount = parseFloat(params.get('amount') || '0');
      if (isNaN(amount) || amount <= 0) {
        return { valid: false, error: 'El monto en el QR no es válido.' };
      }

      const payload: QRPayload = {
        merchantId: params.get('merchantId') || 'MERCH_UNKNOWN',
        merchantName: params.get('merchantName') || 'Comercio Desconocido',
        amount,
        currency: params.get('currency') || 'MXN',
        description: params.get('description') || 'Pago desde QR',
        reference: params.get('reference') || `REF_${Date.now()}`,
      };

      return { valid: true, type: 'payment', payload };
    } catch (e: any) {
      return { valid: false, error: `El formato del QR estructurado es incorrecto: ${e.message}` };
    }
  }

  function parseJsonQR(data: string): QRValidationResult {
    try {
      const parsed = JSON.parse(data);

      // NEW: Check if it is an Info QR
      if (parsed.type === 'info' && parsed.data && typeof parsed.data === 'object') {
        return {
          valid: true,
          type: 'info',
          payload: {
            title: parsed.title || 'Información de QR',
            data: parsed.data,
          },
        };
      }

      // Assume it's a payment QR and validate
      const amount = typeof parsed.amount === 'number' ? parsed.amount : parseFloat(parsed.amount || '0');
      if (isNaN(amount) || amount <= 0) {
        return { valid: false, error: 'El monto en el QR (JSON) no es válido.' };
      }

      const payload: QRPayload = {
        merchantId: parsed.merchantId || 'MERCH_UNKNOWN',
        merchantName: parsed.merchantName || 'Comercio Desconocido',
        amount,
        currency: parsed.currency || 'MXN',
        description: parsed.description || 'Pago desde QR',
        reference: parsed.reference || `REF_${Date.now()}`,
      };

      return { valid: true, type: 'payment', payload };
    } catch (e: any) {
      return { valid: false, error: `El QR no contiene un JSON válido: ${e.message}` };
    }
  }

  function parseDemoQR(data: string): QRValidationResult {
    const parts = data.split('_');
    const amount = parts.length > 1 ? parseFloat(parts[1]) : 0;
    if (isNaN(amount) || amount <= 0) {
      return { valid: false, error: 'El monto del QR de demostración no es válido.' };
    }

    const payload: QRPayload = {
      merchantId: 'DEMO_MERCHANT',
      merchantName: 'Comercio de Demostración',
      amount,
      currency: 'USD',
      description: 'Pago de prueba',
      reference: `DEMO_${Date.now()}`,
    };
    return { valid: true, type: 'payment', payload };
  }

  function buildGenericPayload(rawData: string): QRPayload {
    // Para QR reales escaneados en producción/demo
    // FIX: Default amount changed from 99.99 to 0
    const amount = extractAmountFromRaw(rawData) || 0;
    return {
      merchantId: 'GEN_' + rawData.slice(0, 6).toUpperCase(),
      merchantName: 'Comercio Genérico',
      amount,
      currency: 'MXN',
      description: 'Pago desde QR genérico',
      reference: generateReference(),
    };
  }

  function extractAmountFromRaw(data: string): number | null {
    const match = data.match(/(\d+\.?\d*)/);
    if (match) {
      const num = parseFloat(match[1]);
      if (num > 0 && num < 100000) return num;
    }
    return null;
  }

  function generateReference(): string {
    return 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}
