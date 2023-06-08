import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';
export class LedgerDeviceNotUpdatedError extends YaswapError {
  constructor() {
    super(ERROR_NAMES.LedgerDeviceNotUpdatedError);
  }
}
