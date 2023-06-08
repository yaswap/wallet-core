import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';
export class LedgerAppMismatchError extends YaswapError {
  constructor() {
    super(ERROR_NAMES.LedgerAppMismatchError);
  }
}
