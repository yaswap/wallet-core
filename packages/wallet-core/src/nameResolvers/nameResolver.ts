import { Nullable } from '@yaswap/types';
import { IAsset } from '@yaswap/cryptoassets';

export interface NameResolver {
  reverseLookup(address: string): Promise<Nullable<string>>;
  lookupDomain(address: string, asset: IAsset): Promise<Nullable<string>>;
  isValidTLD(domain: string): Promise<boolean>;
}
