import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';
export class NoTipError extends YaswapError {
  constructor() {
    super(ERROR_NAMES.NoTipError);
  }
}
