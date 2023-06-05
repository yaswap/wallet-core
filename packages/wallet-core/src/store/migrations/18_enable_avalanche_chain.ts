import { ChainId } from '@yac-swap/cryptoassets';
import { enableChain } from './enable_chain';

export const enableAvalancheChain = {
  version: 18,
  migrate: (state: any) => enableChain(state, ChainId.Avalanche),
};
