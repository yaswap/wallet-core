import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';

export class InsufficientInputAmountError extends YaswapError<InsufficientInputAmountErrorContext> {
  constructor(data?: InsufficientInputAmountErrorContext) {
    super(ERROR_NAMES.InsufficientInputAmountError, data);
  }
}

export type InsufficientInputAmountErrorContext = { expectedMinimum: string; assetCode: string };
