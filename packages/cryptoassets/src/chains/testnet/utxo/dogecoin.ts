import { DogecoinChain } from '../../UtxoChain';
import { AssetTypes, ChainId } from '../../../types';

export default new DogecoinChain({
  id: ChainId.Dogecoin,
  name: 'Dogecoin',
  code: 'DOGE',
  color: '#f6db81',
  nativeAsset: [
    {
      name: 'Dogecoin',
      chain: ChainId.Dogecoin,
      type: AssetTypes.native,
      code: 'DOGE',
      priceSource: { coinGeckoId: 'dogecoin' },
      color: '#f6db81',
      decimals: 8,
    },
  ],

  isEVM: false,
  hasTokens: false,
  isMultiLayered: false,

  averageBlockTime: 60,
  safeConfirmations: 2,
  txFailureTimeoutMs: 10_800_000, // 3 hours
  network: {
    name: 'dogecoin',
    coinType: '3',
    isTestnet: false,
    networkId: 'mainnet',
    utxo: {
      // Refer https://github.com/BlockIo/block_io-nodejs/blob/081caf2af1b6d318d490fc73feb66df90e7c7512/data/networks.js#L15-L38
      messagePrefix: '\x19Dogecoin Signed Message:\n',
      bech32: 'doge',
      // Refer https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
      // Refer https://github.com/dogecoin/dogecoin/issues/2344
      // Refer https://bitcoin.stackexchange.com/questions/28380/i-want-to-generate-a-bip32-version-number-for-namecoin-and-other-altcoins
      // Use dgpv/dgub
      bip32: {
        public: 0x02facafd,
        private: 0x02fac398,
      },
      // Refer https://github.com/dogecoin/dogecoin/blob/master/src/chainparams.cpp#L167
      pubKeyHash: 0x1e, // starts with D
      scriptHash: 0x16, // starts with A
      // Refer https://github.com/dogecoin/dogecoin/blob/master/src/chainparams.cpp#L169
      wif: 0x9e,
    },
    rpcUrls: ['https://cb.yacoin.org/dogecoin_api'],
    scraperUrls: ['https://cb.yacoin.org/dogecoin_api'],
  },
  explorerViews: [
    {
      tx: 'https://blockchair.com/dogecoin/transaction/{hash}',
      address: 'https://blockchair.com/dogecoin/address/{address}',
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
