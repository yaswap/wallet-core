import { ActionContext, rootActionContext } from '..';
import { getSwapProvider } from '../../factory/swap';
import { SwapQuote } from '../../swaps/types';
import { FeeLabel, Network, SwapHistoryItem, TransactionType, WalletId } from '../types';

export const newSwap = async (
  context: ActionContext,
  {
    network,
    walletId,
    quote,
    fee,
    claimFee,
    feeLabel,
    claimFeeLabel,
  }: {
    network: Network;
    walletId: WalletId;
    quote: SwapQuote;
    fee: number;
    claimFee: number;
    feeLabel: FeeLabel;
    claimFeeLabel: FeeLabel;
  }
): Promise<SwapHistoryItem> => {
  const { commit, dispatch } = rootActionContext(context);
  // @ts-ignore TODO: Transition of quote from plain quote -> quote with options -> swap is not clearly typed
  const swap: SwapHistoryItem = {
    ...quote,
    type: TransactionType.Swap,
    network,
    startTime: Date.now(),
    walletId,
    claimFee,
    fee,
  };

  const swapProvider = getSwapProvider(network, swap.provider!);

  console.log('TACA ===> [wallet-core] actions newSwap.ts, calling newSwap')
  const initiationParams = await swapProvider.newSwap({
    network,
    walletId,
    quote: swap,
  });

  const createdSwap = {
    ...swap,
    ...initiationParams, // TODO: Maybe move provider specific params to an inner property?
    feeLabel,
    claimFeeLabel,
  };

  console.log('TACA ===> [wallet-core] actions newSwap.ts, commit newSwap')
  commit.NEW_SWAP({
    network,
    walletId,
    swap: createdSwap,
  });

  console.log('TACA ===> [wallet-core] actions newSwap.ts, calling performNextAction')
  dispatch.performNextAction({
    network,
    walletId,
    id: createdSwap.id,
  });

  return createdSwap;
};
