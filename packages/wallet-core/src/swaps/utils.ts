import buildConfig from '../build.config';
import { Network, SwapProviderType } from '../store/types';
import astroportInfo from './astroport/info.json';
import fastbtcInfo from './fastbtc/info.json';
import hopInfo from './hop/info.json';
import lifiInfo from './lifi/info.json';
import jupiterInfo from './jupiter/info.json';
import yaswapInfo from './yaswap/info.json';
import yaswapBoostERC20toNativeInfo from './yaswapboost/yaswapBoostERC20toNative/info.json';
import yaswapBoostNativeToERC20Info from './yaswapboost/yaswapBoostNativeToERC20/info.json';
import oneinchInfo from './oneinch/info.json';
import sovrynInfo from './sovryn/info.json';
import thorchainInfo from './thorchain/info.json';
import uniswapInfo from './uniswap/info.json';
import debridgeInfo from './debridge/info.json';
import teleswapInfo from './teleswap/info.json';
import { CUSTOM_ERRORS, createInternalError } from '@yaswap/error-parser';

const swapProviderInfo = {
  [SwapProviderType.Yaswap]: yaswapInfo,
  [SwapProviderType.UniswapV2]: uniswapInfo,
  [SwapProviderType.OneInch]: oneinchInfo,
  [SwapProviderType.Thorchain]: thorchainInfo,
  [SwapProviderType.FastBTCDeposit]: fastbtcInfo,
  [SwapProviderType.FastBTCWithdraw]: fastbtcInfo,
  [SwapProviderType.YaswapBoostNativeToERC20]: yaswapBoostNativeToERC20Info,
  [SwapProviderType.YaswapBoostERC20ToNative]: yaswapBoostERC20toNativeInfo,
  [SwapProviderType.Sovryn]: sovrynInfo,
  [SwapProviderType.Astroport]: astroportInfo,
  [SwapProviderType.Hop]: hopInfo,
  [SwapProviderType.Jupiter]: jupiterInfo,
  [SwapProviderType.DeBridge]: debridgeInfo,
  [SwapProviderType.LiFi]: lifiInfo,
  [SwapProviderType.TeleSwap]: teleswapInfo,
};

function getSwapProviderConfig(network: Network, providerId: SwapProviderType) {
  return buildConfig.swapProviders[network][providerId];
}

function getSwapProviderInfo(network: Network, providerId: SwapProviderType) {
  const config = getSwapProviderConfig(network, providerId);
  if (!config) {
    throw createInternalError(CUSTOM_ERRORS.NotFound.SwapProvider.Config(providerId, network));
  }
  return swapProviderInfo[config.type];
}

export { getSwapProviderConfig, getSwapProviderInfo };
