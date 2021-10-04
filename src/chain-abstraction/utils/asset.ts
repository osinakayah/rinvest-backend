import { assets as cryptoassets } from '@liquality/cryptoassets';

export const isERC20 = (asset) => {
  return cryptoassets[asset]?.type === 'erc20';
};
