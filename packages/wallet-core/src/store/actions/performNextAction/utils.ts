import { random } from 'lodash';
import { ActionContext } from '../..';
import { Asset, Network, WalletId } from '../../types';
import { unlockAsset } from '../../utils';
import { isNodeJs, canAccessExtensionApi } from '@yaswap/utils';

type HistoryUpdateFunction<T> = () => Promise<Partial<T> | undefined>;

export async function withLock<T>(
  { dispatch }: ActionContext,
  { item, network, walletId, asset }: { item: T; network: Network; walletId: WalletId; asset: Asset },
  func: () => Promise<Partial<T>>
) {
  const lock = await dispatch('getLockForAsset', {
    item,
    network,
    walletId,
    asset,
  });
  try {
    return await func();
  } finally {
    unlockAsset(lock);
  }
}

export async function withInterval<T>(func: HistoryUpdateFunction<T>): Promise<Partial<T>> {
  const updates = await func();
  if (updates) {
    return updates;
  }
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      if (!isNodeJs() && canAccessExtensionApi()) {
        chrome.runtime.getPlatformInfo();
      }
      const updates = await func();

      if (!isNodeJs() && canAccessExtensionApi()) {
        chrome.runtime.getPlatformInfo();
      }
      if (updates) {
        clearInterval(interval);
        resolve(updates);
      }
    }, random(15000, 25000));
  });
}
