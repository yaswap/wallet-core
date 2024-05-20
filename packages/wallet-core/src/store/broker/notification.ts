import BigNumber from 'bignumber.js';
import { getSwapProvider } from '../../factory/swap';
import { Notification } from '../../types';
import { prettyBalance } from '../../utils/coinFormatter';
import { walletOptionsStore } from '../../walletOptions';
import { HistoryItem, NFTSendHistoryItem, SendHistoryItem, SwapHistoryItem, CreateTokenHistoryItem } from '../types';

const SEND_STATUS_MAP = {
  WAITING_FOR_CONFIRMATIONS(item: SendHistoryItem) {
    if (item.timelockDuration == null) {
      return {
        title: `New ${item.from} Transaction`,
        message: `Sending ${prettyBalance(new BigNumber(item.amount), item.from)} ${item.from} to ${item.toAddress}`,
      };
    } else {
      return {
        title: `New ${item.from} Transaction`,
        message: `Timelock ${prettyBalance(new BigNumber(item.amount), item.from)} ${item.from} at ${item.toAddress}`,
      };
    }
  },
  FAILED(item: SendHistoryItem) {
    if (item.timelockDuration == null) {
      return {
        title: `${item.from} Transaction Failed`,
        message: `Failed to send ${prettyBalance(new BigNumber(item.amount), item.from)} ${item.from} to ${
          item.toAddress
        }`,
      };
    } else {
      return {
        title: `${item.from} Transaction Failed`,
        message: `Failed to timelock ${prettyBalance(new BigNumber(item.amount), item.from)} ${item.from} at ${
          item.toAddress
        }`,
      };
    }
  },
  SUCCESS(item: SendHistoryItem) {
    if (item.timelockDuration == null) {
      return {
        title: `${item.from} Transaction Confirmed`,
        message: `Sent ${prettyBalance(new BigNumber(item.amount), item.from)} ${item.from} to ${item.toAddress}`,
      };
    } else {
      return {
        title: `${item.from} Transaction Confirmed`,
        message: `Timelocked ${prettyBalance(new BigNumber(item.amount), item.from)} ${item.from} at ${item.toAddress}`,
      };
    }
  },
};

const NFT_SEND_STATUS_MAP = {
  WAITING_FOR_CONFIRMATIONS(item: NFTSendHistoryItem) {
    return {
      title: `New ${item.from} Transaction`,
      message: `Sending ${item.from} NFT to ${item.toAddress}`,
    };
  },
  FAILED(item: NFTSendHistoryItem) {
    return {
      title: `${item.from} NFT Transaction Failed`,
      message: `Failed to send ${item.from} NFT to ${item.toAddress}`,
    };
  },
  SUCCESS(item: NFTSendHistoryItem) {
    return {
      title: `${item.from} NFT Transaction Confirmed`,
      message: `Sent ${item.from} NFT to ${item.toAddress}`,
    };
  },
};

const CREATE_TOKEN_STATUS_MAP = {
  WAITING_FOR_CONFIRMATIONS(item: CreateTokenHistoryItem) {
    return {
      title: `Create ${item.tokenName} Transaction`,
      message: `Creating ${item.tokenAmount} ${item.tokenName}`,
    };
  },
  FAILED(item: CreateTokenHistoryItem) {
    return {
      title: `Create ${item.from} Transaction Failed`,
      message: `Failed to create ${item.tokenAmount} ${item.tokenName}`,
    };
  },
  SUCCESS(item: CreateTokenHistoryItem) {
    return {
      title: `Create ${item.from} Transaction Confirmed`,
      message: `Created ${item.tokenAmount} ${item.tokenName} successfully`,
    };
  },
};

export const createNotification = async (config: Notification) =>
  walletOptionsStore.walletOptions.createNotification(config);

const createSwapNotification = (item: SwapHistoryItem) => {
  const swapProvider = getSwapProvider(item.network, item.provider);
  const notificationFunction = swapProvider.statuses[item.status].notification;
  if (!notificationFunction) return;
  const notification = notificationFunction(item);

  return createNotification({
    title: `${item.from} -> ${item.to}`,
    ...notification,
  });
};

const createSendNotification = (item: SendHistoryItem) => {
  if (!(item.status in SEND_STATUS_MAP)) return;
  const notification = SEND_STATUS_MAP[item.status](item);

  return createNotification({
    ...notification,
  });
};

const createSendNFTNotification = (item: NFTSendHistoryItem) => {
  if (!(item.status in NFT_SEND_STATUS_MAP)) {
    return;
  }
  const notification = NFT_SEND_STATUS_MAP[item.status](item);

  return createNotification({
    ...notification,
  });
};

const createCreateTokenNotification = (item: CreateTokenHistoryItem) => {
  if (!(item.status in CREATE_TOKEN_STATUS_MAP)) return;
  const notification = CREATE_TOKEN_STATUS_MAP[item.status](item);

  return createNotification({
    ...notification,
  });
};

export const createHistoryNotification = (item: HistoryItem) => {
  if (item.type === 'SEND' || item.type === 'TIMELOCK') {
    return createSendNotification(item);
  } else if (item.type === 'SWAP') {
    return createSwapNotification(item);
  } else if (item.type === 'NFT') {
    return createSendNFTNotification(item);
  } else if (item.type === 'CREATE') {
    return createCreateTokenNotification(item);
  }
};
