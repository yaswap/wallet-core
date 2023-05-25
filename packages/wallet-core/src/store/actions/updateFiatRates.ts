import { ActionContext, rootActionContext } from '..';
import { Asset, FiatRates } from '../types';
import { getPrices, getYacPrices } from '../utils'

export const updateFiatRates = async (context: ActionContext, { assets }: { assets: Asset[] }): Promise<FiatRates> => {
  const { commit } = rootActionContext(context);
  let fiatRates = await getPrices(assets, 'usd')
  fiatRates['YAC'] = await getYacPrices()

  commit.UPDATE_FIAT_RATES({ fiatRates });

  return fiatRates;
};
