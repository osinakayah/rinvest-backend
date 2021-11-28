export interface ITransaction {
  id?: string;
  userId: string;
  assetId: string;

  transactionType: string;
  amount: string;

  destinationAddress: string;
  txHash: string;

  transactionStatus: string;
  network: string;

  metaData: any;
}
