import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';
export class LedgerDappConflictError extends YaswapError {
  constructor() {
    super(ERROR_NAMES.LedgerDappConflictError);
  }
}
