import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';
export class UserDeclinedError extends YaswapError {
  constructor() {
    super(ERROR_NAMES.UserDeclinedError);
  }

  setTranslationKey() {
    this.translationKey = '';
  }
}
