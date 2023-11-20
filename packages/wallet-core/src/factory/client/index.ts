import { ChainId, getChain } from '@yaswap/cryptoassets';
import { CUSTOM_ERRORS, createInternalError } from '@yaswap/error-parser';
import { AccountInfo, ClientSettings } from '../../store/types';
import { createBtcClient, createLtcClient, createDogeClient, createYacClient, createNearClient, createSolanaClient, createTerraClient } from './clients';
import { createEvmClient } from './evm';
import { Network as ChainifyNetwork } from '@yaswap/types';
import { NearTypes } from '@yaswap/near';
import { TerraTypes } from '@yaswap/terra';
import { BitcoinTypes } from '@yaswap/bitcoin';
import { YacoinTypes } from '@yaswap/yacoin';
import { LitecoinTypes } from '@yaswap/litecoin';
import { DogecoinTypes } from '@yaswap/dogecoin';

export const createClient = ({
  chainId,
  settings,
  mnemonic,
  accountInfo,
}: {
  chainId: ChainId;
  settings: ClientSettings<NearTypes.NearNetwork | TerraTypes.TerraNetwork | ChainifyNetwork>;
  mnemonic: string;
  accountInfo: AccountInfo;
}) => {
  let client;
  const chain = getChain(settings.network, chainId);

  if (chain.isEVM) {
    client = createEvmClient(chain, settings, mnemonic, accountInfo);
  } else {
    switch (chainId) {
      case ChainId.Bitcoin:
        client = createBtcClient(settings as ClientSettings<BitcoinTypes.BitcoinNetwork>, mnemonic, accountInfo);
        break;
      case ChainId.Yacoin:
        client = createYacClient(settings as ClientSettings<YacoinTypes.YacoinNetwork>, mnemonic, accountInfo);
        break;
      case ChainId.Litecoin:
        client = createLtcClient(settings as ClientSettings<LitecoinTypes.LitecoinNetwork>, mnemonic, accountInfo);
        break;
      case ChainId.Dogecoin:
        client = createDogeClient(settings as ClientSettings<DogecoinTypes.DogecoinNetwork>, mnemonic, accountInfo);
        break;
      case ChainId.Near:
        client = createNearClient(settings as ClientSettings<NearTypes.NearNetwork>, mnemonic, accountInfo);
        break;
      case ChainId.Terra:
        client = createTerraClient(settings as ClientSettings<TerraTypes.TerraNetwork>, mnemonic, accountInfo);
        break;
      case ChainId.Solana:
        client = createSolanaClient(settings, mnemonic, accountInfo);
        break;
      default:
        throw createInternalError(CUSTOM_ERRORS.NotFound.Client(chainId));
    }
  }

  // Proxify Client so that chainify errors are parsed and rethrown as Yaswap Errors.
  // if (client.chain) client.chain = proxify(client.chain);
  // if (client.swap) client.swap = proxify(client.swap);
  // if (client.nft) client.nft = proxify(client.nft);
  // if (client.wallet) client.wallet = proxify(client.wallet);

  return client;
};

// const parser = getErrorParser(ChainifyErrorParser);
// function proxify(obj: any) {
//   return new Proxy(obj, {
//     get(target, prop) {
//       if (target[prop] instanceof Function) {
//         return (...args: any) => {
//           try {
//             const result = target[prop](...args);
//             if (isPromise(result)) {
//               return result.catch((e: any) => {
//                 throw parser.parseError(e, null);
//               });
//             }
//             return result;
//           } catch (e) {
//             throw parser.parseError(e, null);
//           }
//         };
//       } else {
//         return target[prop];
//       }
//     },
//   });
// }

// function isPromise(p: any) {
//   if (p !== null && typeof p === 'object' && typeof p.then === 'function' && typeof p.catch === 'function') {
//     return true;
//   }

//   return false;
// }
