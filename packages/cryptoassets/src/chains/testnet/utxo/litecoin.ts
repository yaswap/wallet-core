import { LitecoinChain } from '../../UtxoChain';
import { AssetTypes, ChainId } from '../../../types';

export default new LitecoinChain({
  id: ChainId.Litecoin,
  name: 'Litecoin',
  code: 'LTC',
  color: '#345D9D',
  nativeAsset: [
    {
      name: 'Litecoin',
      chain: ChainId.Litecoin,
      type: AssetTypes.native,
      code: 'LTC',
      priceSource: { coinGeckoId: 'litecoin' },
      color: '#345D9D',
      decimals: 8,
    },
  ],

  isEVM: false,
  hasTokens: false,
  isMultiLayered: false,

  averageBlockTime: 150,
  safeConfirmations: 1,
  txFailureTimeoutMs: 10_800_000, // 3 hours
  network: {
    name: 'litecoin',
    coinType: '2',
    isTestnet: false,
    networkId: 'mainnet',
    utxo: {
      messagePrefix: '\x18Litecoin Signed Message:\n',
      bech32: 'ltc',
      bip32: {
        public: 0x0488b21e,
        private: 0x0488ade4,
      },
      pubKeyHash: 0x30, // starts with L
      scriptHash: 0x32, // starts with M
      wif: 0xb0,
    },
    rpcUrls: ['https://litecoinspace.org/api'],
    scraperUrls: ['https://litecoinspace.org/api'],
  },
  explorerViews: [
    {
      tx: 'https://litecoinspace.org/tx/{hash}',
      address: 'https://litecoinspace.org/address/{address}',
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
