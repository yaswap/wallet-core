import SovrynMainnetAddresses from '@blobfishkate/sovryncontracts/contracts-mainnet.json';
import SovrynTestnetAddresses from '@blobfishkate/sovryncontracts/contracts-testnet.json';
import { ChainId } from '@yaswap/cryptoassets';
import { Asset, Network, SwapProviderType } from './store/types';

export interface SwapProviderDefinition {
  name: string;
  icon: string;
  type: SwapProviderType;
  [x: string | number | symbol]: unknown;
}

export interface WalletCoreConfig {
  defaultAssets: {
    [key in Network]: Asset[];
  };
  swapProviders: {
    [key in Network]: {
      [providerType in SwapProviderType]?: SwapProviderDefinition;
    };
  };
  networks: Network[];
  chains: ChainId[];
  supportedBridgeAssets: Asset[];
  discordUrl: string;
  infuraApiKey: string;
  yacEsploraApis: {
    esploraUrl: {
      [key in Network]: string;
    },
    esploraSwapUrl: {
      [key in Network]: string;
    }
  };
  btcEsploraApis: {
    [key in Network]: string;
  };
  btcBatchEsploraApis: {
    [key in Network]: string;
  };
  evmScraperUrls: {
    [key in Network]: string;
  };
  nameResolvers: {
    uns: {
      resolutionService: string;
      tldAPI: string;
      alchemyKey: string;
    };
  };
}

const config: WalletCoreConfig = {
  defaultAssets: {
    mainnet: [
      'YAC',
      'BTC',
      'ETH',
      'DAI',
      'USDC',
      'USDT',
      'WBTC',
      'UNI',
      'RBTC',
      'SOV',
      'BNB',
      // 'NEAR',
      'SOL',
      'MATIC',
      'PWETH',
      'ARBETH',
      'AVAX',
      'FISH',
      'LUNA',
      'UST',
      'OPTETH',
      'ARBDAI',
      'OPDAI',
      'PDAI',
      'OPTUSDC',
      'ARBUSDC',
      'PUSDC',
      'sUSDC',
      'USDC.e',
      'ARBUSDT',
      'OPUSDT',
      'PUSDT',
      'sUSDT',
      'USDT.e',
      'TELEBTC',
    ],
    testnet: [
      'YAC',
      'BTC',
      'ETH',
      'DAI',
      'RBTC',
      'BNB',
      // 'NEAR',
      'SOL',
      'SOV',
      'MATIC',
      'PWETH',
      'ARBETH',
      'AVAX',
      'LUNA',
      'UST',
      'OPTETH',
      'OPTUSDC',
      'TELEBTC',
    ],
  },
  infuraApiKey: 'da99ebc8c0964bb8bb757b6f8cc40f1f',
  yacEsploraApis: {
    esploraUrl: {
      testnet: 'https://yaswap.yacoin.org/api',
      mainnet: 'https://yaswap.yacoin.org/api'
    },
    esploraSwapUrl: {
      testnet: 'https://yaswap.yacoin.org',
      mainnet: 'https://yaswap.yacoin.org'
    }
  },
  btcEsploraApis: {
    testnet: 'https://electrs-testnet-api.liq-chainhub.net/',
    mainnet: 'https://electrs-mainnet-api.liq-chainhub.net/',
  },
  btcBatchEsploraApis: {
    testnet: 'https://electrs-batch-testnet-api.liq-chainhub.net/',
    mainnet: 'https://electrs-batch-mainnet-api.liq-chainhub.net/',
  },
  evmScraperUrls: {
    testnet: 'https://yaswap.yacoin.org/ethscraper_testnet/',
    mainnet: 'https://yaswap.yacoin.org/ethscraper_mainnet/',
  },
  swapProviders: {
    testnet: {
      [SwapProviderType.Yaswap]: {
        name: 'Yaswap',
        icon: 'yaswap.svg',
        type: SwapProviderType.Yaswap,
        agents: [
          {
              name: "Ben",
              url: "https://yaswap.yacoin.org/atomicagent_mainnet"
          },
          {
              name: "Chau",
              url: "https://96.32.210.58/atomicagent_mainnet"
          }
        ]
      },
      [SwapProviderType.UniswapV2]: {
        name: 'Uniswap V2',
        icon: 'uniswap.svg',
        type: SwapProviderType.UniswapV2,
        routerAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      },
      [SwapProviderType.Sovryn]: {
        name: 'Sovryn',
        icon: 'sovryn.svg',
        type: SwapProviderType.Sovryn,
        routerAddress: SovrynTestnetAddresses.swapNetwork,
        routerAddressRBTC: SovrynTestnetAddresses.proxy3,
        rpcURL: 'https://testnet.sovryn.app/rpc',
      },
      [SwapProviderType.FastBTCWithdraw]: {
        name: 'FastBTC',
        icon: 'sovryn.svg',
        type: SwapProviderType.FastBTCWithdraw,
        network: Network.Testnet,
        routerAddress: '0x10C848e9495a32acA95F6c23C92eCA2b2bE9903A',
      },
      // [SwapProviderType.TeleSwap]: {
      //   name: 'TeleSwap',
      //   icon: 'teleswap.png',
      //   type: SwapProviderType.TeleSwap,
      //   network: Network.Testnet,
      //   QuickSwapRouterAddress: '0x8954AfA98594b838bda56FE4C12a09D7739D179b',
      //   QuickSwapFactoryAddress: '0x5757371414417b8c6caad45baef941abc7d3ab32',
      // },
    },
    mainnet: {
      [SwapProviderType.Yaswap]: {
        name: 'Yaswap',
        icon: 'yaswap.svg',
        type: SwapProviderType.Yaswap,
        agents: [
          {
              name: "Ben",
              url: "https://yaswap.yacoin.org/atomicagent_mainnet"
          },
          {
              name: "Chau",
              url: "https://96.32.210.58/atomicagent_mainnet"
          }
        ]
      },
      [SwapProviderType.UniswapV2]: {
        name: 'Uniswap V2',
        icon: 'uniswap.svg',
        type: SwapProviderType.UniswapV2,
        routerAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      },
      [SwapProviderType.OneInch]: {
        name: 'Oneinch V4',
        icon: 'oneinch.svg',
        type: SwapProviderType.OneInch,
        agent: 'https://api.1inch.exchange/v4.0',
        routerAddress: '0x1111111254fb6c44bac0bed2854e76f90643097d',
        referrerAddress: {
          ethereum: '0x3a712CC47aeb0F20A7C9dE157c05d74B11F172f5',
          polygon: '0x3a712CC47aeb0F20A7C9dE157c05d74B11F172f5',
          bsc: '0x3a712CC47aeb0F20A7C9dE157c05d74B11F172f5',
          avalanche: '0x3a712CC47aeb0F20A7C9dE157c05d74B11F172f5',
        },
        referrerFee: 0.3,
      },
      [SwapProviderType.FastBTCDeposit]: {
        name: 'FastBTC',
        icon: 'sovryn.svg',
        type: SwapProviderType.FastBTCDeposit,
        bridgeEndpoint: 'https://fastbtc.sovryn.app',
      },
      [SwapProviderType.FastBTCWithdraw]: {
        name: 'FastBTC',
        icon: 'sovryn.svg',
        type: SwapProviderType.FastBTCWithdraw,
        network: Network.Mainnet,
        routerAddress: '0x0D5006330289336ebdF9d0AC9E0674f91b4851eA',
      },
      [SwapProviderType.Sovryn]: {
        name: 'Sovryn',
        icon: 'sovryn.svg',
        type: SwapProviderType.Sovryn,
        routerAddress: SovrynMainnetAddresses.swapNetwork,
        routerAddressRBTC: SovrynMainnetAddresses.proxy3,
        rpcURL: 'https://mainnet.sovryn.app/rpc',
      },
      [SwapProviderType.Thorchain]: {
        name: 'Thorchain',
        icon: 'thorchain.svg',
        type: SwapProviderType.Thorchain,
        thornode: 'https://thornode.ninerealms.com',
      },
      [SwapProviderType.Astroport]: {
        name: 'Astroport',
        icon: 'astroport.svg',
        type: SwapProviderType.Astroport,
        URL: 'https://lcd.terra.dev',
        chainID: 'columbus-5',
      },
      [SwapProviderType.Jupiter]: {
        name: 'Jupiter',
        icon: 'jupiter.svg',
        type: SwapProviderType.Jupiter,
      },
      [SwapProviderType.DeBridge]: {
        name: 'DeBridge',
        icon: 'debridge.svg',
        type: SwapProviderType.DeBridge,
        url: 'https://deswap.debridge.finance/v1.0/',
        api: 'https://api.debridge.finance/api/',
        routerAddress: '0x663DC15D3C1aC63ff12E45Ab68FeA3F0a883C251',
        chains: {
          1: {
            deBridgeGateAddress: '0x43dE2d77BF8027e25dBD179B491e8d64f38398aA',
            signatureVerifier: '0x949b3B3c098348b879C9e4F15cecc8046d9C8A8c',
            minBlockConfirmation: 12,
          },
          56: {
            deBridgeGateAddress: '0x43dE2d77BF8027e25dBD179B491e8d64f38398aA',
            signatureVerifier: '0x949b3B3c098348b879C9e4F15cecc8046d9C8A8c',
            minBlockConfirmation: 12,
          },
          42161: {
            deBridgeGateAddress: '0x43dE2d77BF8027e25dBD179B491e8d64f38398aA',
            signatureVerifier: '0x949b3B3c098348b879C9e4F15cecc8046d9C8A8c',
            minBlockConfirmation: 12,
          },
          137: {
            deBridgeGateAddress: '0x43dE2d77BF8027e25dBD179B491e8d64f38398aA',
            signatureVerifier: '0x949b3B3c098348b879C9e4F15cecc8046d9C8A8c',
            minBlockConfirmation: 256,
          },
          43114: {
            deBridgeGateAddress: '0x43dE2d77BF8027e25dBD179B491e8d64f38398aA',
            signatureVerifier: '0x949b3B3c098348b879C9e4F15cecc8046d9C8A8c',
            minBlockConfirmation: 12,
          },
        },
      },
      // [SwapProviderType.LiFi]: {
      //   name: 'LiFi',
      //   icon: 'lifi.svg',
      //   type: SwapProviderType.LiFi,
      //   apiURL: 'https://li.quest/v1/',
      // },
      // [SwapProviderType.TeleSwap]: {
      //   name: 'TeleSwap',
      //   icon: 'teleswap.png',
      //   type: SwapProviderType.TeleSwap,
      //   network: Network.Mainnet,
      //   QuickSwapRouterAddress: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
      //   QuickSwapFactoryAddress: '0x5757371414417b8c6caad45baef941abc7d3ab32',
      // },
    },
  },
  discordUrl: 'https://discord.gg/Xsqw7PW8wk',
  networks: [Network.Mainnet, Network.Testnet],
  chains: Object.values(ChainId),
  supportedBridgeAssets: ['RBTC', 'AVAX'],
  nameResolvers: {
    uns: {
      resolutionService: 'https://unstoppabledomains.g.alchemy.com/domains/',
      tldAPI: 'https://resolve.unstoppabledomains.com/supported_tlds',
      alchemyKey: 'bKmEKAC4HJUEDNlnoYITvXYuhrIshFsa',
    },
  },
};

export default config;
