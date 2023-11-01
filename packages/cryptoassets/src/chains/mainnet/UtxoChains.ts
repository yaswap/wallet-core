import { ChainId, ChainsMap } from '../../types';

import BitcoinChain from './utxo/bitcoin';
import YacoinChain from './utxo/yacoin';
import LitecoinChain from './utxo/litecoin';

export const UTXO_CHAINS: ChainsMap = {
  [ChainId.Bitcoin]: BitcoinChain,
  [ChainId.Yacoin]: YacoinChain,
  [ChainId.Litecoin]: LitecoinChain,
};
