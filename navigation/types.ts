/**
 * Tipos de parámetros para cada ruta de la app.
 * Usados para tipado fuerte con expo-router.
 */
export type RootRouteParams = {
  '/': undefined;
  '/payment/confirm': {
    payload: string; // JSON.stringify(QRPayload)
  };
  '/payment/success': {
    transactionId: string;
    completedAt: string;
    merchantName: string;
    amount: string;
    currency: string;
  };
  '/payment/error': {
    errorMessage: string;
  };
};
