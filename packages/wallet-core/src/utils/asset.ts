import { AssetTypes, ChainId, getChain, getNativeAssetCode, isEvmChain } from '@yaswap/cryptoassets';
import { CUSTOM_ERRORS, createInternalError } from '@yaswap/error-parser';
import * as ethers from 'ethers';
import { Asset, Network, TokenMetadata } from '../store/types';
import cryptoassets from './cryptoassets';
import { YacoinUtils } from '@yaswap/yacoin';
import { HttpClient } from '@yaswap/client';
import { CID } from 'multiformats/cid'
import { bases } from 'multiformats/basics'
import { substring } from 'runes2'
import buildConfig from '../build.config';

function getChainExplorer(chainId: ChainId, network: Network) {
  const chain = getChain(network, chainId);
  const chainExplorer = chain.explorerViews[0];
  if (!chainExplorer) {
    throw createInternalError(CUSTOM_ERRORS.NotFound.Chain.Explorer(chainId));
  }
  return chainExplorer;
}
const getTokenMetadataErr = YacoinUtils.getTokenMetadataErr
export { getTokenMetadataErr }

export const isERC20 = (asset: Asset) => {
  return cryptoassets[asset]?.type === AssetTypes.erc20;
};

export const isChainEvmCompatible = (asset: Asset, network = Network.Mainnet) => {
  const chainId = cryptoassets[asset]?.chain;
  return isEvmChain(network, chainId);
};

export const isAssetEvmNativeAsset = (asset: Asset, network = Network.Mainnet) => {
  const chainId = cryptoassets[asset]?.chain;
  if (chainId) {
    const chain = getChain(network, chainId);

    if (chain.isEVM && chain.nativeAsset[0].code === asset) {
      return true;
    }
  }

  return false;
};

export async function getTokenMetadata(ipfsHash: string): Promise<TokenMetadata> {
  return YacoinUtils.getTokenMetadata(ipfsHash)
}

export const getNativeAsset = (asset: Asset, network = Network.Mainnet) => {
  if (cryptoassets[asset]?.type === AssetTypes.native) {
    return asset;
  }
  const chainId = cryptoassets[asset]?.chain;
  return chainId ? getNativeAssetCode(network, chainId) : asset;
};

export const getFeeAsset = (asset: Asset) => {
  if (!cryptoassets[asset]) {
    throw createInternalError(CUSTOM_ERRORS.NotFound.Asset.Default);
  }
  return cryptoassets[asset].feeAsset;
};

const basesByPrefix = Object.keys(bases).reduce((acc, curr: any) => {
  // @ts-ignore
  acc[bases[curr].prefix] = bases[curr]
  return acc
}, {})

export const verifyIPFSHash = (ipfsHash: string) => {
  /*
  cidv0 ::= base58btc_encode(<multihash>)
  QmTng9sJqspRNoG5hVyd9RhKvsAsNf8scopK1CGpA2eAqh

  <cidv1> ::= <multibase>_encode(<cid-version><multicodec><multihash>)
  bafybeicq6uvsrngfh4gtyztwaqa33y4r6o26sydu3uemszoto25hz3ohaq

  Currently, we only support CIDv1 with following value:
    <multibase> = base32
    <cid-version> = cidv1
    <multicodec> = dag-pb
    <multihash> generated by sha2-256
  */
  let errorString = ''
  let rawIPFSHash = ''

  // CIDv0
  if (ipfsHash.startsWith('Qm') && ipfsHash.length === 46) {
    try {
      const cid = CID.parse(ipfsHash, undefined)
      /*
      * Check if CIDv0 hexadecimal format is correct, must have:
      * <multihash-algorithm> = sha2-256 (0x12, refer https://github.com/multiformats/multicodec/blob/master/table.csv)
      * <multihash-length> = 32 (32 bytes, equivalent to 256 bits)
      * Total 34 bytes
      */
      if (cid.multihash.bytes.length !== 34 || cid.multihash.code !== 0x12) {
        errorString = "Invalid CIDv0 IPFS hash (CIDv0 must be generated by hash algorithm sha2-256)"
      } else {
        rawIPFSHash = Buffer.from(cid.multihash.bytes).toString('hex');
      }
    } catch (e) {
      errorString = e.message
    }
  // CIDv1
  } else if (ipfsHash.startsWith('b')) {
    try {
      /*
      * Check if CIDv1 hexadecimal format is correct, must have:
      * <version> = 1
      * <multicodec> = dag-pb (0x70, refer https://github.com/multiformats/multicodec/blob/master/table.csv)
      * <multihash-algorithm> = sha2-256 (0x12, refer https://github.com/multiformats/multicodec/blob/master/table.csv)
      * <multihash-length> = 32 (32 bytes, equivalent to 256 bits)
      */
      const prefix = substring(ipfsHash, 0, 1)
      // @ts-ignore
      const base = basesByPrefix[prefix]
      const cid = CID.parse(ipfsHash, base)
      if (cid.version !== 1 || cid.code !== 0x70 || cid.multihash.bytes.length !== 34 || cid.multihash.code !== 0x12) {
        errorString = "Invalid CIDv1 IPFS hash (CIDv1 must have <version> = cidv1, <multicodec> = dag-pb, <multihash> generated by hash algorithm sha2-256)"
      } else {
        rawIPFSHash = Buffer.from(cid.multihash.bytes).toString('hex');
      }
    } catch (e) {
      errorString = e.message
    }
  } else {
    errorString = "Invalid IPFS hash (CIDv0 must have 46 characters and start with 'Qm', CIDv1 must start with 'b')"
  }
  if (errorString) {
    errorString += ". Please check with https://cid.ipfs.tech/"
  }
  return [rawIPFSHash, errorString]
};

export const isAvailableTokenName = async (tokenName: string, network: Network) => {
  const yacoinEsploraApis = buildConfig.yacEsploraApis.esploraUrl[network]
  const httpClient = new HttpClient({ baseURL: yacoinEsploraApis });
  const data = await httpClient.nodePost(`/listtokens?tokenName=${tokenName}`, {
    tokenname: tokenName
  });
  if (data && data.length > 0) {
    return false
  }
  return true
};

export async function isImageURL(imageURL: string) {
  try {
    const headers = await HttpClient.head(imageURL)
    if (headers['content-type']?.startsWith('image')) {
      return true
    }
  } catch (err) {
    // Do nothing
  };

  return false
}

export const getAssetColorStyle = (asset: Asset) => {
  const assetData = cryptoassets[asset];
  if (assetData && assetData.color) {
    return { color: assetData.color };
  }
  // return black as default
  return { color: '#000000' };
};

export const getTransactionExplorerLink = (hash: string, asset: Asset, network: Network) => {
  const transactionHash = getExplorerTransactionHash(asset, hash);
  const chain = cryptoassets[asset].chain;
  const link = `${getChainExplorer(chain, network).tx}`;
  return link.replace('{hash}', transactionHash);
};

export const getAddressExplorerLink = (address: string, asset: Asset, network: Network) => {
  const chain = cryptoassets[asset].chain;
  const link = `${getChainExplorer(chain, network).address}`;
  return link.replace('{address}', address);
};

export const getExplorerTransactionHash = (asset: Asset, hash: string) => {
  switch (asset) {
    case 'NEAR':
      return hash.split('_')[0];
    default:
      return hash;
  }
};

export const estimateGas = async ({ data, to, value }: { data: string; to: string; value: ethers.BigNumber }) => {
  const paramsForGasEstimate = {
    data,
    to,
    value,
  };

  const provider = ethers.getDefaultProvider();

  return await provider.estimateGas(paramsForGasEstimate);
};

const NFT_ASSETS_MAP: {
  [key in ChainId]?: { [key in Network]: { marketplaceName: string; url: string; transfer: string } };
} = {
  ethereum: {
    testnet: {
      marketplaceName: 'OpenSea',
      url: `https://testnet.opensea.io/`,
      transfer: `https://testnets.opensea.io/assets/{contract_address}/{token_id}`,
    },
    mainnet: {
      marketplaceName: 'OpenSea',
      url: `https://opensea.io/`,
      transfer: `https://opensea.io/assets/{chain}/{contract_address}/{token_id}`,
    },
  },
  polygon: {
    testnet: {
      marketplaceName: 'OpenSea',
      url: `https://testnet.opensea.io/`,
      transfer: `https://testnets.opensea.io/assets/{contract_address}/{token_id}`,
    },
    mainnet: {
      marketplaceName: 'OpenSea',
      url: `https://opensea.io/`,
      transfer: `https://opensea.io/assets/{asset}/{contract_address}/{token_id}`,
    },
  },
  arbitrum: {
    testnet: {
      marketplaceName: 'StratosNFT',
      url: `https://testnet.stratosnft.io/`,
      transfer: `https://testnets.stratosnft.io/asset/{contract_address}/{token_id}`,
    },
    mainnet: {
      marketplaceName: 'StratosNFT',
      url: `https://stratosnft.io/`,
      transfer: `https://stratosnft.io/asset/{contract_address}/{token_id}`,
    },
  },
  solana: {
    testnet: {
      marketplaceName: 'Magic Eden',
      url: `https://magiceden.io/`,
      transfer: `https://magiceden.io/item-details/{contract_address}`,
    },
    mainnet: {
      marketplaceName: 'Magic Eden',
      url: `https://magiceden.io/`,
      transfer: `https://magiceden.io/item-details/{contract_address}`,
    },
  },
};

const getNftAssetsMap = (chainId: ChainId, network: Network) => {
  const nftAssetsMap = NFT_ASSETS_MAP[chainId];
  if (!nftAssetsMap) {
    throw createInternalError(CUSTOM_ERRORS.Unsupported.NftAssetMap(chainId, network));
  }
  return nftAssetsMap;
};

export const getMarketplaceName = (asset: Asset, network: Network) => {
  const chainId = cryptoassets[asset].chain;
  const nftAssetsMap = getNftAssetsMap(chainId, network);

  const marketplaceName = nftAssetsMap[network].marketplaceName;
  if (!marketplaceName) {
    throw createInternalError(CUSTOM_ERRORS.NotFound.Nft.MarketPlaceName(chainId, network));
  } else {
    return marketplaceName;
  }
};

export const getNftTransferLink = (asset: Asset, network: Network, tokenId: string, contract_address: string) => {
  const chainId = cryptoassets[asset].chain;
  const nftAssetsMap = getNftAssetsMap(chainId, network);

  const transferLink = nftAssetsMap[network].transfer;
  if (!transferLink) {
    throw createInternalError(CUSTOM_ERRORS.NotFound.Nft.TransferLink(chainId, network));
  } else {
    return transferLink
      .replace('{contract_address}', contract_address)
      .replace('{chain}', chainId)
      .replace('{asset}', asset)
      .replace('{token_id}', tokenId);
  }
};

export const getNftLink = (asset: Asset, network: Network) => {
  const chainId = cryptoassets[asset].chain;
  const nftAssetsMap = getNftAssetsMap(chainId, network);

  const url = nftAssetsMap[network].url;
  if (!url) {
    throw createInternalError(CUSTOM_ERRORS.NotFound.Nft.ExplorerLink(chainId, network));
  } else {
    return url;
  }
};

export const openseaLink = (network: Network) => {
  return `https://${network === 'testnet' ? 'testnets.' : ''}opensea.io/`;
};

export const timelockFeeDuration = () => {
  return YacoinUtils.timelockFeeDuration()
}

export const timelockFeeAmountInSatoshis = () => {
  return YacoinUtils.timelockFeeAmountInSatoshis()
}

export const timelockFeeAmount = () => {
  return YacoinUtils.timelockFeeAmount()
}
