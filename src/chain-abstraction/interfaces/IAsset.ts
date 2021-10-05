export interface IAsset {
  isEnable?: boolean;
  id?: string;
  name: string;
  code: string;
  decimals: number;
  contractAddress: string;
  coinGeckoId: string;
  chain: string;
  type: string;
}
