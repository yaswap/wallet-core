import validateBitcoinAddress from 'bitcoin-address-validation';
import WAValidator from 'multicoin-address-validator';
import { remove0x } from '../utils';
import { BaseChain } from './BaseChain';
import { base58_to_binary } from 'base58-js'
import { createHash } from 'sha256-uint8array'

const sha256 = (payload: Uint8Array) => createHash().update(payload).digest()
export abstract class UtxoChain extends BaseChain {
  public formatAddress(address: string) {
    return address;
  }

  public isValidTransactionHash(hash: string) {
    return /^([A-Fa-f0-9]{64})$/.test(hash);
  }

  public formatTransactionHash(hash: string) {
    return remove0x(hash).toLowerCase();
  }
}

export class BitcoinChain extends UtxoChain {
  public isValidAddress(address: string): boolean {
    // networkId = mainnet | testnet | regtest
    return !!validateBitcoinAddress(address, String(this.network.networkId));
  }
}

export class LitecoinChain extends UtxoChain {
  public isValidAddress(address: string): boolean {
    // networkId = mainnet | testnet | regtest
    if (this.network.networkId === 'mainnet') {
      return WAValidator.validate(address, 'litecoin');
    }
    return WAValidator.validate(address, 'litecoin', 'testnet');
  }
}

export class DogecoinChain extends UtxoChain {
  public isValidAddress(address: string): boolean {
    // networkId = mainnet | testnet | regtest
    if (this.network.networkId === 'mainnet') {
      return WAValidator.validate(address, 'dogecoin');
    }
    return WAValidator.validate(address, 'dogecoin', 'testnet');
  }
}

export class YacoinChain extends UtxoChain {
  public isValidAddress(address: string): boolean {
    const validVersions = [0x4d, 0x8b, 0x6f, 0xc4]

    let decoded: Uint8Array
  
    try {
      decoded = base58_to_binary(address)
    } catch (error) {
      // Invalid address
      return false
    }
  
    const { length } = decoded
    if (length !== 25) {
      // Invalid address
      return false
    }
  
    const version = decoded[0]
    const checksum = decoded.slice(length - 4, length)
    const body = decoded.slice(0, length - 4)
    const expectedChecksum = sha256(sha256(body)).slice(0, 4)
  
    if (checksum.some((value: number, index: number) => value !== expectedChecksum[index])) {
      // Invalid address
      return false
    }
  
    if (!validVersions.includes(version)) {
      // Invalid address
      return false
    }
  
    return true
  }
}