import { AssetType, ChainId } from '../types';

export type PriceSources = {
  coinGeckoId?: string;
};

export interface TokenMetadata {
  name?: string;
  description?: string;
  imageURL?: string;
}

export interface IAsset {
  name: string;
  chain: ChainId;
  type: AssetType;
  code: string;

  decimals: number;
  priceSource?: PriceSources;

  color?: string;
  contractAddress?: string;
  matchingAsset?: string;
  feeAsset?: string;

  // For Yacoin only
  totalSupply?: number;
  reissuable?: boolean;
  ipfsHash?: string;
  tokenMetadata?: TokenMetadata;
}
