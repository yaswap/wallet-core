import { ChainId } from '@yaswap/cryptoassets';
import { enableChain } from './enable_chain';

export const enableTerraChain = {
  version: 16,
  migrate: (state: any) => enableChain(state, ChainId.Terra),
};
