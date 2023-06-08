import { CUSTOM_ERRORS, createInternalError } from '@yaswap/error-parser';
import buildConfig from '../../build.config';
import { Network, SwapProviderType } from '../../store/types';
import { AstroportSwapProvider } from '../../swaps/astroport/AstroportSwapProvider';
import { FastBTCDepositSwapProvider } from '../../swaps/fastbtc/FastBTCDepositSwapProvider';
import { FastBTCWithdrawSwapProvider } from '../../swaps/fastbtc/FastBTCWithdrawSwapProvider';
import { HopSwapProvider } from '../../swaps/hop/HopSwapProvider';
import { JupiterSwapProvider } from '../../swaps/jupiter/JupiterSwapProvider';
import { LifiSwapProvider } from '../../swaps/lifi/LifiSwapProvider';
import { YaswapSwapProvider } from '../../swaps/yaswap/YaswapSwapProvider';
import { YaswapBoostERC20toNative } from '../../swaps/yaswapboost/yaswapBoostERC20toNative/YaswapBoostERC20toNative';
import { YaswapBoostNativeToERC20 } from '../../swaps/yaswapboost/yaswapBoostNativeToERC20/YaswapBoostNativeToERC20';
import { OneinchSwapProvider } from '../../swaps/oneinch/OneinchSwapProvider';
import { SovrynSwapProvider } from '../../swaps/sovryn/SovrynSwapProvider';
import { SwapProvider } from '../../swaps/SwapProvider';
import { ThorchainSwapProvider } from '../../swaps/thorchain/ThorchainSwapProvider';
import { UniswapSwapProvider } from '../../swaps/uniswap/UniswapSwapProvider';
import { DeBridgeSwapProvider } from '../../swaps/debridge/DeBridgeSwapProvider';
import { TeleSwapSwapProvider } from '../../swaps/teleswap/TeleSwapSwapProvider';

const providers = {
  [SwapProviderType.Yaswap]: YaswapSwapProvider,
  [SwapProviderType.UniswapV2]: UniswapSwapProvider,
  [SwapProviderType.OneInch]: OneinchSwapProvider,
  [SwapProviderType.Thorchain]: ThorchainSwapProvider,
  [SwapProviderType.YaswapBoostNativeToERC20]: YaswapBoostNativeToERC20,
  [SwapProviderType.YaswapBoostERC20ToNative]: YaswapBoostERC20toNative,
  [SwapProviderType.FastBTCDeposit]: FastBTCDepositSwapProvider,
  [SwapProviderType.FastBTCWithdraw]: FastBTCWithdrawSwapProvider,
  [SwapProviderType.Sovryn]: SovrynSwapProvider,
  [SwapProviderType.Astroport]: AstroportSwapProvider,
  [SwapProviderType.Hop]: HopSwapProvider,
  [SwapProviderType.Jupiter]: JupiterSwapProvider,
  [SwapProviderType.DeBridge]: DeBridgeSwapProvider,
  [SwapProviderType.LiFi]: LifiSwapProvider,
  [SwapProviderType.TeleSwap]: TeleSwapSwapProvider,
};

const createSwapProvider = (network: Network, providerId: SwapProviderType) => {
  const swapProviderConfig = buildConfig.swapProviders[network][providerId];
  if (!swapProviderConfig) {
    throw createInternalError(CUSTOM_ERRORS.NotFound.SwapProvider.Config(providerId, network));
  }
  const SwapProvider = providers[swapProviderConfig.type];
  // @ts-ignore TODO: i'll fix it
  return new SwapProvider({ ...swapProviderConfig, providerId });
};

const mapLegacyProvidersToSupported: { [index: string]: string } = {
  oneinchV3: 'oneinchV4',
  yaswapBoost: 'yaswapBoostNativeToERC20',
};

const swapProviderCache: { [key: string]: SwapProvider } = {};

function getSwapProvider(network: Network, providerId: SwapProviderType): SwapProvider {
  const supportedProviderId = mapLegacyProvidersToSupported[providerId]
    ? (mapLegacyProvidersToSupported[providerId] as SwapProviderType)
    : providerId;
  const cacheKey = [network, supportedProviderId].join('-');

  const cachedSwapProvider = swapProviderCache[cacheKey];
  if (cachedSwapProvider) return cachedSwapProvider;

  const swapProvider = createSwapProvider(network, supportedProviderId);
  swapProviderCache[cacheKey] = swapProvider;

  return swapProvider;
}

export { getSwapProvider };
