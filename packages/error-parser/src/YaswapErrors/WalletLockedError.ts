import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';
export class WalletLockedError extends YaswapError {
  constructor() {
    super(ERROR_NAMES.WalletLockedError);
  }

  setTranslationKey() {
    this.translationKey = '';
  }
}
