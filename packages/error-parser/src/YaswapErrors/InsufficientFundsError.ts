import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';
export class InsufficientFundsError extends YaswapError<InsufficientFundsErrorContext> {
  constructor(data?: InsufficientFundsErrorContext) {
    super(ERROR_NAMES.InsufficientFundsError, data);
  }
}

export type InsufficientFundsErrorContext = { availAmt: string; neededAmt: string; currency: string };
