import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';
export class LedgerDeviceLockedError extends YaswapError {
  constructor() {
    super(ERROR_NAMES.LedgerDeviceLockedError);
  }
}
