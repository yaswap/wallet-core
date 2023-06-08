import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';
export class InsufficientLiquidityError extends YaswapError<InsufficientLiquidityErrorContext> {
  constructor(data?: InsufficientLiquidityErrorContext) {
    super(ERROR_NAMES.InsufficientLiquidityError, data);
  }

  setTranslationKey() {
    this.translationKey = '';
  }
}

export type InsufficientLiquidityErrorContext = { from: string; to: string; amount: string };
