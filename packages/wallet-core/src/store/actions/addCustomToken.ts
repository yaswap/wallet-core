import { ChainId } from '@yaswap/cryptoassets';
import { ActionContext, rootActionContext } from '..';
import { Network, WalletId } from '../types';

export const addCustomToken = async (
  context: ActionContext,
  {
    network,
    walletId,
    chain,
    symbol,
    name,
    contractAddress,
    decimals,
    totalSupply,
    reissuable,
    ipfsHash,
  }: {
    network: Network;
    walletId: WalletId;
    chain: ChainId;
    symbol: string;
    name: string;
    contractAddress: string;
    decimals: number;
    totalSupply?: number;
    reissuable?: boolean;
    ipfsHash?: string;
  }
) => {
  const { commit } = rootActionContext(context);
  const customToken = { symbol, name, contractAddress, decimals, chain: chain, totalSupply, reissuable, ipfsHash};
  console.log('TACA ===> addCustomToken, customToken = ', customToken);
  commit.ADD_CUSTOM_TOKEN({ network, walletId, customToken });
};
