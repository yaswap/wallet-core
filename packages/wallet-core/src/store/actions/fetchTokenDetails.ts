import { UnsupportedMethodError } from '@yaswap/errors';
import { Nullable, TokenDetails } from '@yaswap/types';
import { ChainId } from '@yaswap/cryptoassets';
import { LiqualityError } from '@yaswap/error-parser';
import { ActionContext, rootActionContext } from '..';
import { Network, WalletId } from '../types';

export type FetchTokenDetailsRequest = {
  walletId: WalletId;
  network: Network;
  chain: ChainId;
  contractAddress: string;
};

export const fetchTokenDetails = async (
  context: ActionContext,
  tokenDetailsRequest: FetchTokenDetailsRequest
): Promise<Nullable<TokenDetails>> => {
  const { walletId, network, chain, contractAddress } = tokenDetailsRequest;
  const { getters } = rootActionContext(context);
  const client = getters.client({ network, walletId, chainId: chain });

  try {
    return await client.chain.getTokenDetails(contractAddress);
  } catch (err) {
    if ((err as LiqualityError).rawError instanceof UnsupportedMethodError) {
      return null;
    }
    throw err;
  }
};
