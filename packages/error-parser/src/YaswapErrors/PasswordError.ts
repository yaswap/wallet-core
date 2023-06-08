import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';
export class PasswordError extends YaswapError {
  constructor() {
    super(ERROR_NAMES.PasswordError);
  }
}
