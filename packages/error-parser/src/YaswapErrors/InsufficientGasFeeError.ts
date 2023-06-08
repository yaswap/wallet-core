import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';
export class InsufficientGasFeeError extends YaswapError<InsufficientGasFeeErrorContext> {
  constructor(data?: InsufficientGasFeeErrorContext) {
    super(ERROR_NAMES.InsufficientGasFeeError, data);
  }
}

export type InsufficientGasFeeErrorContext = { currency: string; gasFee: string };
