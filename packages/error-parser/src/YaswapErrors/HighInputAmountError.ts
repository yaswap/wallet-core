import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';
export class HighInputAmountError extends YaswapError<HighInputAmountErrorContext> {
  constructor(data?: HighInputAmountErrorContext) {
    super(ERROR_NAMES.HighInputAmountError, data);
  }

  setTranslationKey() {
    this.translationKey = '';
  }
}

export type HighInputAmountErrorContext = { expectedMaximum: string; assetCode: string };
