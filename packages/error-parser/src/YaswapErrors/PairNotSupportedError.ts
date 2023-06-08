import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';

export class PairNotSupportedError extends YaswapError<PairNotSupportedErrorContext> {
  constructor(data?: PairNotSupportedErrorContext) {
    super(ERROR_NAMES.PairNotSupportedError, data);
  }
}

export type PairNotSupportedErrorContext = { from: string; to: string };
