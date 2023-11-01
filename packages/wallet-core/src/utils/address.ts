import { BitcoinTypes } from '@yaswap/bitcoin';
import { LitecoinTypes } from '@yaswap/litecoin';

export function shortenAddress(address: string) {
  const prefix = address.startsWith('0x') ? '0x' : '';
  const isTerra = address.startsWith('terra');
  return `${prefix}${address.replace('0x', '').substring(0, prefix ? 4 : 6)}...${address.substring(
    isTerra ? address.length - 6 : address.length - 4
  )}`;
}

export const BitcoinAddressType = BitcoinTypes.AddressType;
export const LitecoinAddressType = LitecoinTypes.AddressType;

export const BTC_ADDRESS_TYPE_TO_PREFIX = {
  [BitcoinAddressType.LEGACY]: 44,
  [BitcoinAddressType.P2SH_SEGWIT]: 49,
  [BitcoinAddressType.BECH32]: 84,
};

export const LTC_ADDRESS_TYPE_TO_PREFIX = {
  [LitecoinAddressType.LEGACY]: 44,
  [LitecoinAddressType.P2SH_SEGWIT]: 49,
  [LitecoinAddressType.BECH32]: 84,
};