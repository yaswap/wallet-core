import bitcoin from '../../mainnet/utxo/bitcoin';
import { transformMainnetToTestnetChain } from '../../utils';

export default transformMainnetToTestnetChain(
  bitcoin,
  {
    name: 'bitcoin_testnet',
    coinType: '1',
    isTestnet: true,
    networkId: 'testnet',
    utxo: {
      messagePrefix: '\x18Bitcoin Signed Message:\n',
      bech32: 'tb',
      bip32: {
        public: 0x043587cf,
        private: 0x04358394,
      },
      pubKeyHash: 0x6f,
      scriptHash: 0xc4,
      wif: 0xef,
    },
    rpcUrls: ['https://mempool.space/testnet4/api'],
    scraperUrls: ['https://mempool.space/testnet4/api'],
  },
  [
    {
      tx: 'https://mempool.space/testnet4/tx/{hash}',
      address: 'https://mempool.space/testnet4/address/{address}',
    },
  ],
  'https://bitcoinfaucet.uo1.net/'
);
