import { UnsupportedMethodError } from '@yac-swap/errors';
import { Nullable, TokenDetails } from '@yac-swap/types';
import { ChainId } from '@yac-swap/cryptoassets';
import { LiqualityError } from '@yac-swap/error-parser';
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
