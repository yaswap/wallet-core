import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';
export class VeryHighMaxFeeWarning extends YaswapError<VeryHighMaxFeeWarningContext> {
  constructor(data?: VeryHighMaxFeeWarningContext) {
    super(ERROR_NAMES.VeryHighMaxFeeWarning, data);
  }
}

export type VeryHighMaxFeeWarningContext = { maxFeePerGas: string };
