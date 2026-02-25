export interface QRPayload {
  merchantId: string;
  merchantName: string;
  amount: number;
  currency: string;
  description: string;
  reference: string;
}

export type QRValidationResult =
  | { valid: true; payload: QRPayload }
  | { valid: false; error: string };

// Prefijos reconocidos para QR de pago
const VALID_PREFIXES = ['pay://', 'PAGOS://', 'checkout://'];

// Merchants de demo para simular QR reales
const DEMO_MERCHANTS: Record<string, QRPayload> = {
  'MERCH001': {
    merchantId: 'MERCH001',
    merchantName: 'Cafetería Campus',
    amount: 85.50,
    currency: 'MXN',
    description: 'Orden #4521',
    reference: 'ORD-4521',
  },
  'MERCH002': {
    merchantId: 'MERCH002',
    merchantName: 'Librería Académica',
    amount: 245.00,
    currency: 'MXN',
    description: 'Compra de materiales',
    reference: 'LIB-7834',
  },
  'MERCH003': {
    merchantId: 'MERCH003',
    merchantName: 'Estacionamiento ITESM',
    amount: 30.00,
    currency: 'MXN',
    description: 'Pase diario',
    reference: 'PARK-112',
  },
};

export function validateQRCode(rawData: string): QRValidationResult {
  if (!rawData || rawData.trim().length === 0) {
    return { valid: false, error: 'Código QR vacío' };
  }

  // Detectar si es un QR de pago con prefijo válido
  const hasValidPrefix = VALID_PREFIXES.some(prefix =>
    rawData.toLowerCase().startsWith(prefix.toLowerCase())
  );

  if (hasValidPrefix) {
    return parseStructuredQR(rawData);
  }

  // Intentar parsear JSON directo (QR generados internamente)
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
    payload: buildGenericPayload(rawData),
  };
}

function parseStructuredQR(data: string): QRValidationResult {
  try {
    const url = new URL(data.replace('pay://', 'https://').replace('checkout://', 'https://'));
    const params = url.searchParams;

    const amount = parseFloat(params.get('amount') || '0');
    if (isNaN(amount) || amount <= 0) {
      return { valid: false, error: 'Monto inválido en el código QR' };
    }

    return {
      valid: true,
      payload: {
        merchantId: params.get('mid') || 'UNKNOWN',
        merchantName: params.get('merchant') || 'Comercio',
        amount,
        currency: params.get('currency') || 'MXN',
        description: params.get('desc') || 'Pago',
        reference: params.get('ref') || generateReference(),
      },
    };
  } catch {
    return { valid: false, error: 'Formato de QR no reconocido' };
  }
}

function parseJsonQR(data: string): QRValidationResult {
  try {
    const parsed = JSON.parse(data) as Partial<QRPayload>;

    if (!parsed.merchantName || !parsed.amount) {
      return { valid: false, error: 'QR incompleto: faltan campos requeridos' };
    }

    return {
      valid: true,
      payload: {
        merchantId: parsed.merchantId || 'UNKNOWN',
        merchantName: parsed.merchantName,
        amount: parsed.amount,
        currency: parsed.currency || 'MXN',
        description: parsed.description || 'Pago',
        reference: parsed.reference || generateReference(),
      },
    };
  } catch {
    return { valid: false, error: 'JSON inválido en código QR' };
  }
}

function parseDemoQR(data: string): QRValidationResult {
  const merchantKey = data.replace('DEMO_', '') as keyof typeof DEMO_MERCHANTS;
  const merchant = DEMO_MERCHANTS[merchantKey];

  if (!merchant) {
    return { valid: false, error: 'Comercio de demo no encontrado' };
  }

  return { valid: true, payload: merchant };
}

function buildGenericPayload(rawData: string): QRPayload {
  // Para QR reales escaneados en producción/demo
  const amount = extractAmountFromRaw(rawData) || 99.99;
  return {
    merchantId: 'GEN_' + rawData.slice(0, 6).toUpperCase(),
    merchantName: 'Comercio',
    amount,
    currency: 'MXN',
    description: 'Pago QR',
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
