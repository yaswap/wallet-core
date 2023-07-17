import { Chain, Client, Swap, Wallet } from '@yaswap/client';
import {
  BitcoinEsploraApiProvider,
  BitcoinFeeApiProvider,
  BitcoinHDWalletProvider,
  BitcoinSwapEsploraProvider,
  BitcoinTypes,
} from '@yaswap/bitcoin';
import {
  YacoinEsploraApiProvider,
  YacoinFeeApiProvider,
  YacoinHDWalletProvider,
  YacoinSwapEsploraProvider,
  YacoinNftProvider,
  YacoinTypes,
} from '@yaswap/yacoin';
import { BitcoinLedgerProvider, CreateBitcoinLedgerApp } from '@yaswap/bitcoin-ledger';
import { ChainifyNetwork } from '../../types';
import { NearChainProvider, NearSwapProvider, NearTypes, NearWalletProvider } from '@yaswap/near';
import { SolanaChainProvider, SolanaNftProvider, SolanaWalletProvider } from '@yaswap/solana';
import { TerraChainProvider, TerraSwapProvider, TerraTypes, TerraWalletProvider } from '@yaswap/terra';

import { AccountInfo, ClientSettings } from '../../store/types';
import { LEDGER_BITCOIN_OPTIONS } from '../../utils/ledger';
import { walletOptionsStore } from '../../walletOptions';
import { CUSTOM_ERRORS, createInternalError } from '@yaswap/error-parser';
import { Network } from '@yaswap/types';

export function createBtcClient(
  settings: ClientSettings<ChainifyNetwork>,
  mnemonic: string,
  accountInfo: AccountInfo
): Client<Chain<any, Network>, Wallet<any, any>, Swap<any, any, Wallet<any, any>>> {
  const isMainnet = settings.network === 'mainnet';
  const { chainifyNetwork } = settings;
  const chainProvider = new BitcoinEsploraApiProvider({
    batchUrl: chainifyNetwork.batchScraperUrl!,
    url: chainifyNetwork.scraperUrl!,
    network: chainifyNetwork as BitcoinTypes.BitcoinNetwork,
    numberOfBlockConfirmation: 2,
  });

  if (isMainnet) {
    const feeProvider = new BitcoinFeeApiProvider(chainifyNetwork.feeProviderUrl);
    chainProvider.setFeeProvider(feeProvider);
  }

  const swapProvider = new BitcoinSwapEsploraProvider({
    network: chainifyNetwork as BitcoinTypes.BitcoinNetwork,
    scraperUrl: chainifyNetwork.scraperUrl,
  });

  // TODO: make sure Ledger works
  if (accountInfo.type.includes('bitcoin_ledger')) {
    const option = LEDGER_BITCOIN_OPTIONS.find((o) => o.name === accountInfo.type);
    if (!option) {
      throw createInternalError(CUSTOM_ERRORS.NotFound.AccountTypeOption(accountInfo.type));
    }
    const { addressType } = option;
    if (!walletOptionsStore.walletOptions.ledgerTransportCreator) {
      throw createInternalError(CUSTOM_ERRORS.NotFound.LedgerTransportCreator);
    }
    const ledgerProvider = new BitcoinLedgerProvider(
      {
        network: chainifyNetwork as BitcoinTypes.BitcoinNetwork,
        addressType,
        baseDerivationPath: accountInfo.derivationPath,
        basePublicKey: accountInfo?.publicKey,
        baseChainCode: accountInfo?.chainCode,
        transportCreator: walletOptionsStore.walletOptions.ledgerTransportCreator,
        createLedgerApp: CreateBitcoinLedgerApp,
      },
      chainProvider as any
    );
    swapProvider.setWallet(ledgerProvider as any);
  } else {
    const walletOptions = {
      network: chainifyNetwork as BitcoinTypes.BitcoinNetwork,
      baseDerivationPath: accountInfo.derivationPath,
      mnemonic,
    };
    const walletProvider = new BitcoinHDWalletProvider(walletOptions, chainProvider);
    swapProvider.setWallet(walletProvider);
  }

  return new Client().connect(swapProvider);
}

export function createYacClient(
  settings: ClientSettings<ChainifyNetwork>,
  mnemonic: string,
  accountInfo: AccountInfo
): Client<Chain<any, Network>, Wallet<any, any>, Swap<any, any, Wallet<any, any>>> {
  const isMainnet = settings.network === 'mainnet';
  const { chainifyNetwork } = settings;
  // Create Chain provider
  const chainProvider = new YacoinEsploraApiProvider({
    batchUrl: chainifyNetwork.yacoinEsploraApis!,
    url: chainifyNetwork.yacoinEsploraApis!,
    network: chainifyNetwork as YacoinTypes.YacoinNetwork,
    numberOfBlockConfirmation: 1,
  });

  if (isMainnet) {
    const feeProvider = new YacoinFeeApiProvider(chainifyNetwork.feeProviderUrl);
    chainProvider.setFeeProvider(feeProvider);
  }

  // Create swap provider
  const swapProvider = new YacoinSwapEsploraProvider({
    network: chainifyNetwork as YacoinTypes.YacoinNetwork,
    scraperUrl: chainifyNetwork.yacoinEsploraSwapApis,
  });

  // Create wallet provider
  const walletOptions = {
    network: chainifyNetwork as YacoinTypes.YacoinNetwork,
    baseDerivationPath: accountInfo.derivationPath,
    mnemonic,
  };
  const walletProvider = new YacoinHDWalletProvider(walletOptions, chainProvider);
  swapProvider.setWallet(walletProvider);
  const client = new Client().connect(swapProvider);

  // Create nft provider
  const nftProvider = new YacoinNftProvider(
    walletProvider as any,
    {
      url: chainifyNetwork.yacoinEsploraApis!
    }
  );
  client.connect(nftProvider);

  return client;
}

export function createNearClient(
  settings: ClientSettings<NearTypes.NearNetwork>,
  mnemonic: string,
  accountInfo: AccountInfo
): Client<Chain<any, Network>, Wallet<any, any>, Swap<any, any, Wallet<any, any>>> {
  const walletOptions = {
    mnemonic,
    derivationPath: accountInfo.derivationPath,
    helperUrl: settings.chainifyNetwork.helperUrl,
  };
  const chainProvider = new NearChainProvider(settings.chainifyNetwork);
  const walletProvider = new NearWalletProvider(walletOptions, chainProvider);
  const swapProvider = new NearSwapProvider(settings.chainifyNetwork.helperUrl, walletProvider);
  return new Client(chainProvider as any, walletProvider as any).connect(swapProvider as any);
}

export function createTerraClient(
  settings: ClientSettings<TerraTypes.TerraNetwork>,
  mnemonic: string,
  accountInfo: AccountInfo
): Client<Chain<any, Network>, Wallet<any, any>, Swap<any, any, Wallet<any, any>>> {
  const { helperUrl } = settings.chainifyNetwork;
  const walletOptions = { mnemonic, derivationPath: accountInfo.derivationPath, helperUrl };
  const chainProvider = new TerraChainProvider(settings.chainifyNetwork);
  const walletProvider = new TerraWalletProvider(walletOptions, chainProvider);
  const swapProvider = new TerraSwapProvider(helperUrl, walletProvider);
  return new Client(chainProvider as any, walletProvider as any).connect(swapProvider as any);
}

export function createSolanaClient(
  settings: ClientSettings<ChainifyNetwork>,
  mnemonic: string,
  accountInfo: AccountInfo
): Client<Chain<any, Network>, Wallet<any, any>, Swap<any, any, Wallet<any, any>>> {
  const walletOptions = { mnemonic, derivationPath: accountInfo.derivationPath };
  const chainProvider = new SolanaChainProvider(settings.chainifyNetwork);
  const walletProvider = new SolanaWalletProvider(walletOptions, chainProvider);
  const nftProvider = new SolanaNftProvider(walletProvider as any);

  return new Client(chainProvider as any, walletProvider as any).connect(nftProvider);
}
