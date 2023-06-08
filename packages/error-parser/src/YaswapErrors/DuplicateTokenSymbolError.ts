import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';
export class DuplicateTokenSymbolError extends YaswapError {
  constructor() {
    super(ERROR_NAMES.DuplicateTokenSymbolError);
  }
}
