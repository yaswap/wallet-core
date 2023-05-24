import { YacoinChain } from '../../UtxoChain';
import { AssetTypes, ChainId } from '../../../types';

export default new YacoinChain({
  id: ChainId.Yacoin,
  name: 'Yacoin',
  code: 'YAC',
  color: '#f7931a',
  nativeAsset: [
    {
      name: 'Yacoin',
      chain: ChainId.Yacoin,
      type: AssetTypes.native,
      code: 'YAC',
      priceSource: { coinGeckoId: 'yacoin' },
      color: '#f7931a',
      decimals: 6,
    },
  ],

  isEVM: false,
  hasTokens: false,
  isMultiLayered: false,

  averageBlockTime: 600,
  safeConfirmations: 1,
  txFailureTimeoutMs: 10_800_000, // 3 hours
  network: {
    name: 'yacoin',
    coinType: '0',
    isTestnet: false,
    networkId: 'mainnet',
    utxo: {
      messagePrefix: '\x18Yacoin Signed Message:\n',
      bech32: 'bc',
      bip32: {
        public: 0x0488b21e,
        private: 0x0488ade4,
      },
      pubKeyHash: 0x4d,
      scriptHash: 0x8b,
      wif: 0xcd,
    },
    rpcUrls: ['https://yaswap.yacoin.org'],
    scraperUrls: ['https://yaswap.yacoin.org/api'],
  },
  explorerViews: [
    {
      tx: 'https://yaswap.yacoin.org/tx/{hash}',
      address: 'https://yaswap.yacoin.org/address/{hash}',
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
    magnitude: 1e6,
  },
  supportCustomFees: true,
});
