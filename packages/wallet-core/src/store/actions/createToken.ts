import { getChain, currencyToUnit } from '@yaswap/cryptoassets';
// import { unitToCurrency, currencyToUnit, getChain } from '@yaswap/cryptoassets';
// import { getNativeAsset, getFeeAsset } from '../../utils/asset';
import BN, { BigNumber } from 'bignumber.js';
import { v4 as uuidv4 } from 'uuid';
import { ActionContext, rootActionContext } from '..';
import { createHistoryNotification } from '../broker/notification';
import { AccountId, Asset, FeeLabel, Network, CreateTokenHistoryItem, SendStatus, TransactionType, WalletId } from '../types';

export const createToken = async (
  context: ActionContext,
  {
    network,
    walletId,
    accountId,
    asset,
    fee,
    tokenType,
    tokenName,
    tokenAmount,
    decimals,
    reissuable,
    ipfsHash,
  }: {
    network: Network;
    walletId: WalletId;
    accountId: AccountId;
    asset: Asset;
    fee: number;
    tokenType: string;
    tokenName: string;
    tokenAmount: number;
    decimals: number;
    reissuable: boolean;
    ipfsHash: string;
  }
): Promise<CreateTokenHistoryItem> => {
  const { dispatch, commit, getters } = rootActionContext(context);
  const chainId = getters.cryptoassets[asset].chain;
  const client = getters.client({ network, walletId, chainId, accountId });

  const to = await client.wallet.getUnusedAddress();

  // Convert from displayed amount to the amount in satoshis
  let value: BigNumber;
  if (asset === 'YAC') {
    value = currencyToUnit(getters.cryptoassets[asset], tokenAmount)
  } else {
    value = new BN(tokenAmount)
  }

  const tx = await client.wallet.createToken({
    to: getChain(network, chainId).formatAddress(to.toString()),
    fee,
    tokenType,
    tokenName,
    tokenAmount: value.toNumber(),
    decimals,
    reissuable,
    ipfsHash,
  });

  // const transaction: SendHistoryItem = {
  //   id: uuidv4(),
  //   type: TransactionType.Send,
  //   network,
  //   walletId,
  //   to: asset,
  //   from: asset,
  //   toAddress: to.toString(),
  //   amount: new BN(tokenAmount).toFixed(),
  //   fee,
  //   // @ts-ignore TODO: support token creation for other chains
  //   tx,
  //   // @ts-ignore TODO: support token creation for other chains
  //   txHash: tx.hash,
  //   startTime: Date.now(),
  //   status: SendStatus.WAITING_FOR_CONFIRMATIONS,
  //   accountId,
  //   feeLabel: FeeLabel.Average,
  //   fiatRate: 0,
  //   tokenType,
  //   tokenName,
  //   tokenAmount: value.toNumber(),
  //   decimals,
  //   reissuable,
  //   ipfsHash,
  // };

  const transaction: CreateTokenHistoryItem = {
    id: uuidv4(),
    type: TransactionType.Create,
    network,
    walletId,
    accountId,
    fee,
    feeLabel: FeeLabel.Average,
    startTime: Date.now(),
    status: SendStatus.WAITING_FOR_CONFIRMATIONS,
    from: asset,
    to: tokenName,
    toAddress: to.toString(),
    // @ts-ignore TODO: support token creation for other chains
    tx,
    // @ts-ignore TODO: support token creation for other chains
    txHash: tx.hash,
    tokenType,
    tokenName,
    tokenAmount,
    decimals,
    reissuable,
    ipfsHash,
  };

  commit.CREATE_TOKEN_TRANSACTION({ network, walletId, transaction });

  dispatch.performNextAction({ network, walletId, id: transaction.id });

  createHistoryNotification(transaction);

  return transaction;
};
