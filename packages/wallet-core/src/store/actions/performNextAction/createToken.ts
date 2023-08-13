import { TxStatus } from '@yaswap/types';
import { ActionContext, rootActionContext } from '../..';
import { Network, CreateTokenHistoryItem, SendStatus, WalletId } from '../../types';
import { withInterval } from './utils';
import { isTransactionNotFoundError } from '../../../utils/isTransactionNotFoundError';

function txStatusToSendStatus(txStatus: TxStatus) {
  switch (txStatus) {
    case TxStatus.Success:
      return SendStatus.SUCCESS;
    case TxStatus.Failed:
      return SendStatus.FAILED;
    case TxStatus.Pending:
      return SendStatus.WAITING_FOR_CONFIRMATIONS;
  }
}

async function waitForConfirmations(
  context: ActionContext,
  { transaction, network, walletId }: { transaction: CreateTokenHistoryItem; network: Network; walletId: WalletId }
): Promise<Partial<CreateTokenHistoryItem> | undefined> {
  const { getters, dispatch } = rootActionContext(context);
  const { from, accountId, tokenType } = transaction;
  const chain = getters.cryptoassets[from].chain;
  const client = getters.client({ network, walletId, chainId: chain, accountId });
  try {
    const tx = await client.chain.getTransactionByHash(transaction.txHash);
    if (tx && tx.confirmations && tx.confirmations > 0) {

      if (tokenType === 'YA-Token') {
        dispatch.updateBalances({
          network,
          walletId,
          accountIds: [transaction.accountId],
        });
      } else {
        await dispatch.updateNFTs({ network, walletId, accountIds: [transaction.accountId] });
      }

      return {
        endTime: Date.now(),
        status: txStatusToSendStatus(tx.status!),
      };
    }
  } catch (e) {
    if (isTransactionNotFoundError(e)) console.warn(e);
    else throw e;
  }
}

export const performNextCreateTokenTransactionAction = async (
  context: ActionContext,
  { network, walletId, transaction }: { network: Network; walletId: WalletId; transaction: CreateTokenHistoryItem }
) => {
  if (transaction.status === SendStatus.WAITING_FOR_CONFIRMATIONS) {
    return withInterval(async () => waitForConfirmations(context, { transaction, network, walletId }));
  }
};
