import { Chain, Client, Swap, Wallet } from '@yaswap/client';
import {
  EIP1559FeeProvider,
  EvmChainProvider,
  EvmWalletProvider,
  EvmSwapProvider,
  OptimismChainProvider,
  RpcFeeProvider,
} from '@yaswap/evm';
import { EvmLedgerProvider, CreateEvmLedgerApp } from '@yaswap/evm-ledger';
import { Address, Network } from '@yaswap/types';
import { ChainifyNetwork } from '../../types';
import { JsonRpcProvider, StaticJsonRpcProvider } from '@ethersproject/providers';
import { AccountInfo, AccountType, ClientSettings } from '../../store/types';
import { walletOptionsStore } from '../../walletOptions';
import { getNftProvider } from './nft';
import { EvmChain } from '@yaswap/cryptoassets';
import { asL2Provider } from '@eth-optimism/sdk';
import { CUSTOM_ERRORS, createInternalError } from '@yaswap/error-parser';

export function createEvmClient(
  chain: EvmChain,
  settings: ClientSettings<ChainifyNetwork>,
  mnemonic: string,
  accountInfo: AccountInfo
): Client<Chain<any, Network>, Wallet<any, any>, Swap<any, any, Wallet<any, any>>> {
  const chainProvider = getEvmProvider(chain, settings);
  const walletProvider = getEvmWalletProvider(settings.chainifyNetwork, accountInfo, chainProvider, mnemonic);

  // Add EVM swap provider
  // const { chainifyNetwork } = settings;
  const swapProvider = new EvmSwapProvider({
    // contractAddress: undefined, // TODO Deploy a specialized contract address used for atomic swap
    scraperUrl: 'http://192.168.0.220:8080' // TODO pass from chainifyNetwork.scraperUrl
  });
  swapProvider.setWallet(walletProvider);
  const client = new Client().connect(swapProvider);

  if (chain.nftProviderType) {
    const nftProvider = getNftProvider(chain.nftProviderType, walletProvider, settings.chainifyNetwork.isTestnet);
    client.connect(nftProvider);
  }

  return client;
}

function getEvmWalletProvider(
  network: ChainifyNetwork,
  accountInfo: AccountInfo,
  chainProvider: EvmChainProvider,
  mnemonic: string
) {
  if (accountInfo.type === AccountType.EthereumLedger || accountInfo.type === AccountType.RskLedger) {
    let addressCache;

    if (accountInfo && accountInfo.publicKey && accountInfo.address) {
      addressCache = new Address({ publicKey: accountInfo?.publicKey, address: accountInfo.address });
    }

    if (!walletOptionsStore.walletOptions.ledgerTransportCreator) {
      throw createInternalError(CUSTOM_ERRORS.NotFound.LedgerTransportCreator);
    }

    return new EvmLedgerProvider(
      {
        network: network,
        derivationPath: accountInfo.derivationPath,
        addressCache,
        transportCreator: walletOptionsStore.walletOptions.ledgerTransportCreator,
        createLedgerApp: CreateEvmLedgerApp,
      },
      chainProvider
    );
  } else {
    const walletOptions = { derivationPath: accountInfo.derivationPath, mnemonic };
    return new EvmWalletProvider(walletOptions, chainProvider);
  }
}

function getEvmProvider(chain: EvmChain, settings: ClientSettings<ChainifyNetwork>) {
  const network = settings.chainifyNetwork;
  if (chain.isMultiLayered) {
    const provider = asL2Provider(new StaticJsonRpcProvider(network.rpcUrl, chain.network.chainId));
    return new OptimismChainProvider(
      {
        ...settings.chainifyNetwork,
        chainId: chain.network.chainId,
      },
      provider,
      chain.feeMultiplier
    );
  } else {
    const provider = new StaticJsonRpcProvider(network.rpcUrl, chain.network.chainId);
    const feeProvider = getFeeProvider(chain, provider);
    return new EvmChainProvider(chain.network, provider, feeProvider, chain.multicallSupport);
  }
}

function getFeeProvider(chain: EvmChain, provider: JsonRpcProvider) {
  if (chain.EIP1559) {
    return new EIP1559FeeProvider(provider);
  } else {
    return new RpcFeeProvider(provider, chain.feeMultiplier);
  }
}
