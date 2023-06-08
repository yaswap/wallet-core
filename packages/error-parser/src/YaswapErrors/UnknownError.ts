import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';
export class UnknownError extends YaswapError {
  reportable = true;

  constructor() {
    super(ERROR_NAMES.UnknownError);
  }
}
