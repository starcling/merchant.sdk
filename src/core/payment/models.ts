export interface IPaymentInsertDetails {
  title: string;
  description: string;
  amount: number;
  currency: string;
  startTimestamp: number;
  endTimestamp: number;
  numberOfPayments: number;
  type: number;
  frequency: number;
  merchantAddress: string;
  networkID: number;
}

export interface IPaymentUpdateDetails {
  id: string;
  title: string;
  description: string;
  promo: string;
  status: number;
  customerAddress: string;
  amount: number;
  currency: string;
  startTimestamp: number;
  endTimestamp: number;
  numberOfPayments: number;
  nextPaymentDate: number;
  lastPaymentDate: number;
  type: number;
  frequency: number;
  registerTxHash: string;
  registerTxStatus: number;
  executeTxHash: string;
  executeTxStatus: number;
  cancelTxHash: string;
  cancelTxStatus: number;
  merchantAddress: string;
  pullPaymentAddress: string;
  userId: string;
  networkID: number;
}