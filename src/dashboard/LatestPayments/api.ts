import { PaymentResponse } from './types';

/**
 * given a response, it will check for an http error, if it encounters an error, it will be rejected.
 * otherwise, it will return the json parsed response...
 * @param response
 */
async function handleFetchResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }

  return await response.json();
}

const api = {
  getPayment: async () => {
    try {
      const response = await fetch(`/payments`);

      const paymentResponse: PaymentResponse = await handleFetchResponse(
        response,
      );

      return paymentResponse.data;
    } catch (err) {
      throw err;
    }
  },
};

export default api;
