import { BitcoinNetworks } from '@yaswap/bitcoin';
import { YacoinNetworks } from '@yaswap/yacoin';
import { LitecoinNetworks } from '@yaswap/litecoin';
import { NearNetworks } from '@yaswap/near';
import { SolanaNetworks } from '@yaswap/solana';
import { TerraNetworks } from '@yaswap/terra';
import { Network as ChainifyNetwork } from '@yaswap/types';
import { ChainId, getChain } from '@yaswap/cryptoassets';
import { CUSTOM_ERRORS, createInternalError } from '@yaswap/error-parser';
import { Network } from '../store/types';

export const Networks = [Network.Mainnet, Network.Testnet];

export type ChainNetworksType = Record<string, { mainnet: ChainifyNetwork; testnet: ChainifyNetwork }>;

export const ChainNetworks: ChainNetworksType = {
  [ChainId.Bitcoin]: {
    testnet: BitcoinNetworks.bitcoin_testnet,
    mainnet: BitcoinNetworks.bitcoin,
  },
  [ChainId.Litecoin]: {
    testnet: LitecoinNetworks.litecoin_testnet,
    mainnet: LitecoinNetworks.litecoin,
  },
  [ChainId.Yacoin]: {
    testnet: YacoinNetworks.yacoin_testnet,
    mainnet: YacoinNetworks.yacoin,
  },
  [ChainId.Near]: {
    testnet: NearNetworks.near_testnet,
    mainnet: {
      ...NearNetworks.near_mainnet,
      rpcUrl: process.env.VUE_APP_NEAR_MAINNET_URL || NearNetworks.near_mainnet.rpcUrl,
    },
  },

  [ChainId.Solana]: {
    testnet: SolanaNetworks.solana_testnet,
    mainnet: {
      ...SolanaNetworks.solana_mainnet,
      rpcUrl: process.env.VUE_APP_SOLANA_MAINNET_URL || SolanaNetworks.solana_mainnet.rpcUrl,
    },
  },

  [ChainId.Terra]: {
    testnet: {
      ...TerraNetworks.terra_testnet,
      rpcUrl: 'https://pisco-lcd.terra.dev',
      helperUrl: 'https://pisco-fcd.terra.dev',
    },
    mainnet: {
      ...TerraNetworks.terra_mainnet,
      rpcUrl: process.env.VUE_APP_TERRA_MAINNET_URL || TerraNetworks.terra_mainnet.rpcUrl,
    },
  },
};

export function getRpcUrl(chainId: ChainId, network = Network.Mainnet) {
  const rpcUrl = getChain(network, chainId).network.rpcUrls[0];
  if (!rpcUrl) {
    throw createInternalError(CUSTOM_ERRORS.NotFound.RPC(chainId, network));
  }
  return rpcUrl;
}
