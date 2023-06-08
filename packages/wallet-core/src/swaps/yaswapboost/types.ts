import { EvmTypes } from '@yaswap/evm';
import { Transaction } from '@yaswap/types';
import { Asset, SwapHistoryItem } from '../../store/types';
import { YaswapSwapHistoryItem } from '../yaswap/YaswapSwapProvider';
import { NextSwapActionRequest } from '../types';

export interface BoostHistoryItem extends YaswapSwapHistoryItem {
  approveTxHash: string;
  swapTxHash: string;
  approveTx: Transaction<EvmTypes.EthersTransactionResponse>;
  swapTx: Transaction<EvmTypes.EthersTransactionResponse>;
  bridgeAsset: Asset;
  bridgeAssetAmount: string;
}
export interface BoostNextSwapActionRequest extends Partial<NextSwapActionRequest> {
  swapLSP: YaswapSwapHistoryItem;
  swapAMM?: SwapHistoryItem;
}
