import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';
export class NoActiveWalletError extends YaswapError {
  constructor() {
    super(ERROR_NAMES.NoActiveWalletError);
  }

  setTranslationKey() {
    this.translationKey = '';
  }
}
