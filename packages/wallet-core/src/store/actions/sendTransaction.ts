import { unitToCurrency, currencyToUnit, getChain } from '@yaswap/cryptoassets';
import { getNativeAsset, getFeeAsset } from '../../utils/asset';
import BN, { BigNumber } from 'bignumber.js';
import { v4 as uuidv4 } from 'uuid';
import { ActionContext, rootActionContext } from '..';
import { assetsAdapter } from '../../utils/chainify';
import { createHistoryNotification } from '../broker/notification';
import { AccountId, Asset, FeeLabel, Network, SendHistoryItem, SendStatus, TransactionType, WalletId } from '../types';

export const sendTransaction = async (
  context: ActionContext,
  {
    network,
    walletId,
    accountId,
    asset,
    to,
    amount,
    data,
    fee,
    feeAsset,
    gas,
    feeLabel,
    fiatRate,
  }: {
    network: Network;
    walletId: WalletId;
    accountId: AccountId;
    asset: Asset;
    to: Asset;
    amount: BigNumber;
    data: string;
    fee: number;
    feeAsset: string;
    gas: number;
    feeLabel: FeeLabel;
    fiatRate: number;
  }
): Promise<SendHistoryItem> => {
  const { dispatch, commit, getters } = rootActionContext(context);
  const chainId = getters.cryptoassets[asset].chain;
  const client = getters.client({ network, walletId, chainId, accountId });

  const _asset = assetsAdapter(asset)[0];
  const _feeAsset = assetsAdapter(feeAsset)[0] || _asset;

  // Convert from displayed amount to the amount in satoshis
  let value: BigNumber;
  let amountToSend = new BN(0);
  const assetChain = getFeeAsset(asset) || getNativeAsset(asset)
  if (assetChain === 'YAC') {
    amountToSend = unitToCurrency(getters.cryptoassets[asset], new BN(amount))
    value = currencyToUnit(getters.cryptoassets[assetChain], amountToSend)
  } else {
    value = new BN(amount)
  }

  const tx = await client.wallet.sendTransaction({
    to: getChain(network, chainId).formatAddress(to),
    value,
    data,
    gasLimit: gas,
    fee,
    asset: _asset,
    feeAsset: _feeAsset,
  });

  const transaction: SendHistoryItem = {
    id: uuidv4(),
    type: TransactionType.Send,
    network,
    walletId,
    to: asset,
    from: asset,
    toAddress: to,
    amount: new BN(amount).toFixed(),
    fee,
    tx,
    txHash: tx.hash,
    startTime: Date.now(),
    status: SendStatus.WAITING_FOR_CONFIRMATIONS,
    accountId,
    feeLabel,
    fiatRate,
  };

  commit.NEW_TRASACTION({ network, walletId, transaction });

  dispatch.performNextAction({ network, walletId, id: transaction.id });

  createHistoryNotification(transaction);

  return transaction;
};
