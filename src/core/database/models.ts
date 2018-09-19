export interface IPaymentContractUpdate {
  id: string;
  hdWalletIndex: number;
  numberOfPayments: number;
  nextPaymentDate: number;
  lastPaymentDate: number;
  startTimestamp: number;
  merchantAddress: string;
  statusID: number;
  userID: string;
}

export interface IPaymentContractView {
  id: string;
  title: string;
  description: string;
  promo: string;
  amount: number;
  initialPaymentAmount: number;
  initialNumberOfPayments: number;
  currency: string;
  hdWalletIndex: number;
  numberOfPayments: number;
  frequency: number;
  type: string;
  status: string;
  networkID: string;
  nextPaymentDate: number;
  lastPaymentDate: number;
  startTimestamp: number;
  customerAddress: string;
  merchantAddress: string;
  pullPaymentAddress: string;
  automatedCashOut: boolean;
  cashOutFrequency: number;
  userID: string;
}

export interface ITransactionUpdate {
  hash: string;
  statusID: number;
}

export interface ITransactionInsert {
  hash: string;
  statusID: number;
  typeID: number;
  contractID: string;
  timestamp: number;
}

export interface ITransactionGet {
  id: string;
  hash: string;
  contractID: string;
  statusID: number;
  typeID: number;
}