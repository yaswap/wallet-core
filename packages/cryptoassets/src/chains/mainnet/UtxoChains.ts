import { ChainId, ChainsMap } from '../../types';

import BitcoinChain from './utxo/bitcoin';
import YacoinChain from './utxo/yacoin';
import LitecoinChain from './utxo/litecoin';
import DogecoinChain from './utxo/dogecoin';

export const UTXO_CHAINS: ChainsMap = {
  [ChainId.Bitcoin]: BitcoinChain,
  [ChainId.Yacoin]: YacoinChain,
  [ChainId.Litecoin]: LitecoinChain,
  [ChainId.Dogecoin]: DogecoinChain,
};
