import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';
export class LedgerDeviceSmartContractTransactionDisabledError extends YaswapError {
  constructor() {
    super(ERROR_NAMES.LedgerDeviceSmartContractTransactionDisabledError);
  }
}
