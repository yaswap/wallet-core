import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';
export class ValidationError extends YaswapError {
  constructor() {
    super(ERROR_NAMES.ValidationError);
  }

  setTranslationKey() {
    this.translationKey = '';
  }
}
