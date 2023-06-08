import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';
export class LedgerDeviceConnectionError extends YaswapError {
  constructor() {
    super(ERROR_NAMES.LedgerDeviceConnectionError);
  }
}
