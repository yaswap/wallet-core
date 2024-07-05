import { BitcoinChain } from '../../UtxoChain';
import { AssetTypes, ChainId } from '../../../types';

export default new BitcoinChain({
  id: ChainId.Bitcoin,
  name: 'Bitcoin',
  code: 'BTC',
  color: '#EAB300',
  nativeAsset: [
    {
      name: 'Bitcoin',
      chain: ChainId.Bitcoin,
      type: AssetTypes.native,
      code: 'BTC',
      priceSource: { coinGeckoId: 'bitcoin' },
      color: '#f7931a',
      decimals: 8,
    },
  ],

  isEVM: false,
  hasTokens: false,
  isMultiLayered: false,

  averageBlockTime: 600,
  safeConfirmations: 1,
  txFailureTimeoutMs: 10_800_000, // 3 hours
  network: {
    name: 'bitcoin',
    coinType: '0',
    isTestnet: false,
    networkId: 'mainnet',
    utxo: {
      messagePrefix: '\x18Bitcoin Signed Message:\n',
      bech32: 'bc',
      bip32: {
        public: 0x0488b21e,
        private: 0x0488ade4,
      },
      pubKeyHash: 0x00,
      scriptHash: 0x05,
      wif: 0x80,
    },
    rpcUrls: ['https://cb.yacoin.org/bitcoin_api'],
    scraperUrls: ['https://cb.yacoin.org/bitcoin_api'],
  },
  explorerViews: [
    {
      tx: 'https://mempool.space/tx/{hash}',
      address: 'https://mempool.space/address/{address}',
    },
  ],
  multicallSupport: false,
  ledgerSupport: true,
  EIP1559: false,
  gasLimit: {
    send: {
      native: 290,
    },
  },
  fees: {
    unit: 'sat/b',
    magnitude: 1e8,
  },
  supportCustomFees: true,
});
