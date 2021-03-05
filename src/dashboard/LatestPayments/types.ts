export type Payment = {
  id: string;
  date: string;
  sender: {
    id: number;
    name: string;
  };
  receiver: {
    id: number;
    name: string;
  };
  amount: string;
  currency: string;
  memo: string;
};

export type PaymentResponse = {
  data: Payment;
}