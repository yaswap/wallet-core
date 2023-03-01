import solana from '../../mainnet/non-evm/solana';
import { transformMainnetToTestnetChain } from '../../utils';

export default transformMainnetToTestnetChain(
  solana,
  {
    name: 'Solana Testnet',
    networkId: 'testnet',
    coinType: '501',
    isTestnet: true,
    rpcUrls: [
      'https://api.testnet.solana.com',
      'https://solana--devnet.datahub.figment.io/apikey/d7d9844ccf72ad4fef9bc5caaa957a50',
    ],
  },
  [
    {
      tx: 'https://explorer.solana.com/tx/{hash}?cluster=testnet',
      address: 'https://explorer.solana.com/address/{address}?cluster=testnet',
    },
  ],
  'https://solfaucet.com/'
);
