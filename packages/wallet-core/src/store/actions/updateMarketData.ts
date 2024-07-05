import { ActionContext, rootActionContext } from '..';
import buildConfig from '../../build.config';
import { getSwapProvider } from '../../factory/swap';
import { MarketData, Network, SwapProviderType } from '../types';

const MARKET_DATA_FETCH_TIMEOUT = 10000;

interface ProviderTimeout {
  info: {
    [providerType in SwapProviderType]?: any;
  };
}

let providerTimeout: ProviderTimeout = { info: {} }

const withTimeout = (millis: number, provider: SwapProviderType, promise: Promise<MarketData[]>) => {
  let timeoutData: MarketData[] = [];
  const timeout: Promise<MarketData[]> = new Promise((resolve, _reject) =>
    providerTimeout.info[provider] = setTimeout(
          () => {
            console.error('Timeout fetching market data for ', provider);
            resolve(timeoutData)
          },
          millis));

  return Promise.race([
      promise,
      timeout
  ]);
};

export const updateMarketData = async (
  context: ActionContext,
  { network }: { network: Network }
): Promise<{ network: Network; marketData: MarketData[] }> => {
  const { commit } = rootActionContext(context);
  const supportedPairResponses = await Promise.allSettled(
    Object.keys(buildConfig.swapProviders[network]).map(async (provider: SwapProviderType) => {
      const swapProvider = getSwapProvider(network, provider);
      const promise = swapProvider.getSupportedPairs({ network }).then((pairs) => pairs.map((pair) => ({ ...pair, provider })));
      const result = await withTimeout(MARKET_DATA_FETCH_TIMEOUT, provider, promise)
      clearTimeout(providerTimeout.info[provider])
      providerTimeout.info[provider] = null;
      return result;
    })
  );

  let supportedPairs: MarketData[] = [];
  supportedPairResponses.forEach((response) => {
    if (response.status === 'fulfilled') {
      supportedPairs = [...supportedPairs, ...response.value];
    } else {
      console.error('Fetching market data failed', response.reason);
    }
  });

  const marketData = supportedPairs;

  commit.UPDATE_MARKET_DATA({ network, marketData });

  return { network, marketData };
};
