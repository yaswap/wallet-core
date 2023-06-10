import { ChainId, getChain } from '@yaswap/cryptoassets';
import { ChainNetworks } from '../utils/networks';
import buildConfig from '../build.config';
import { Network } from '../store/types';
import { ChainifyNetwork } from '../types';

export const defaultChainSettings: Record<Network, Record<ChainId, ChainifyNetwork>> = buildConfig.networks.reduce(
  (prevNetwork, currNetwork) => {
    const chains = buildConfig.chains.reduce((prevChain, currChain) => {
      const chain = getChain(currNetwork, currChain);
      const { network } = chain;
      const { name, coinType, isTestnet, rpcUrls } = network;
      const chainNetwork = ChainNetworks[currChain] ? ChainNetworks[currChain][currNetwork] : {} || {};
      let chainifyNetwork: any = {
        name,
        coinType,
        isTestnet,
        chainId: currChain,
        rpcUrl: rpcUrls && rpcUrls.length > 0 ? rpcUrls[0] : undefined,
        ...chainNetwork,
        custom: false,
      };

      if (currChain === ChainId.Bitcoin) {
        chainifyNetwork = {
          ...chainifyNetwork,
          scraperUrl: buildConfig.btcEsploraApis[currNetwork],
          batchScraperUrl: buildConfig.btcBatchEsploraApis[currNetwork],
          feeProviderUrl: 'https://liquality.io/swap/mempool/v1/fees/recommended',
        };
      }
      if (currChain === ChainId.Yacoin) {
        chainifyNetwork = {
          ...chainifyNetwork,
          yacoinEsploraApis: buildConfig.yacEsploraApis.esploraUrl[currNetwork],
          yacoinEsploraSwapApis: buildConfig.yacEsploraApis.esploraSwapUrl[currNetwork],
          feeProviderUrl: 'https://liquality.io/swap/mempool/v1/fees/recommended',
        };
      }
      if (chain.isEVM) {
        chainifyNetwork = {
          ...chainifyNetwork,
          scraperUrl: buildConfig.evmScraperUrls[currNetwork],
        };
      }
      return {
        ...prevChain,
        [currChain]: chainifyNetwork,
      };
    }, {});
    return {
      ...prevNetwork,
      [currNetwork]: chains,
    };
  },
  {} as Record<Network, Record<ChainId, ChainifyNetwork>>
);
