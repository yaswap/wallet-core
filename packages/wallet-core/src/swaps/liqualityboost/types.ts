import { EvmTypes } from '@yaswap/evm';
import { Transaction } from '@yaswap/types';
import { Asset, SwapHistoryItem } from '../../store/types';
import { LiqualitySwapHistoryItem } from '../liquality/LiqualitySwapProvider';
import { NextSwapActionRequest } from '../types';

export interface BoostHistoryItem extends LiqualitySwapHistoryItem {
  approveTxHash: string;
  swapTxHash: string;
  approveTx: Transaction<EvmTypes.EthersTransactionResponse>;
  swapTx: Transaction<EvmTypes.EthersTransactionResponse>;
  bridgeAsset: Asset;
  bridgeAssetAmount: string;
}
export interface BoostNextSwapActionRequest extends Partial<NextSwapActionRequest> {
  swapLSP: LiqualitySwapHistoryItem;
  swapAMM?: SwapHistoryItem;
}
