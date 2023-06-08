import { TransportCreator } from '@yaswap/hw-ledger';
import { Network } from '@yaswap/types';
import { RootState } from './store/types';

export interface ParsedCipherText {
  ct: string;
  iv: string;
  s: string;
}

export interface Notification {
  title: string;
  message: string;
}

export interface WalletOptions {
  initialState?: RootState;

  crypto: {
    pbkdf2(password: string, salt: string, iterations: number, length: number, digest: string): Promise<string>;
    encrypt(value: string, key: string): Promise<any>;
    decrypt(value: any, key: string): Promise<any>;
  };

  createNotification(notification: Notification): void;
  ledgerTransportCreator?: TransportCreator;
}

export interface ChainifyNetwork extends Network {
  yacoinEsploraApis?: string;
  yacoinEsploraSwapApis?: string;
  scraperUrl?: string;
  batchScraperUrl?: string;
  feeProviderUrl?: string;
}
