export interface ITransaction {
  id?: string;
  userId: string;
  assetId: string;

  transactionType: string;
  amount: string;

  destinationAddress: string;
  txHash: string;

  transactionStatus: string;
  chain: string;

  metaData: any;
}
