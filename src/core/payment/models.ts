export interface IPaymentInsertDetails {
  title: string;
  description: string;
  amount: number;
  currency: string;
  startTimestamp: number;
  endTimestamp: number;
  limit: number;
  type: number;
  frequency: number;
  merchantAddress: string;
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
  limit: number;
  nextPaymentDate: number;
  lastPaymentDate: number;
  type: number;
  frequency: number;
  registerTxHash: string;
  regiserTxStatus: number;
  executeTxHash: string;
  executeTxStatus: number;
  debitAccount: string;
  merchantAddress: string;
}