import { Nullable } from '@yac-swap/types';
import { IAsset } from '@yac-swap/cryptoassets';

export interface NameResolver {
  reverseLookup(address: string): Promise<Nullable<string>>;
  lookupDomain(address: string, asset: IAsset): Promise<Nullable<string>>;
  isValidTLD(domain: string): Promise<boolean>;
}
