import { ChainId } from '@yac-swap/cryptoassets';
import { enableChain } from './enable_chain';

export const enableSolanaChain = {
  version: 21,
  migrate: (state: any) => enableChain(state, ChainId.Solana),
};
