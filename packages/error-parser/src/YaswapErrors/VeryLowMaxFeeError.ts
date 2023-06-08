import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';
export class VeryLowMaxFeeError extends YaswapError<VeryLowMaxFeeErrorContext> {
  constructor(data?: VeryLowMaxFeeErrorContext) {
    super(ERROR_NAMES.VeryLowMaxFeeError, data);
  }
}

export type VeryLowMaxFeeErrorContext = { maxFeePerGas: string };
