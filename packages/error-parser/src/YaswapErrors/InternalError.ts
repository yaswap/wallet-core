import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';
export class InternalError extends YaswapError {
  reportable = true;
  constructor(rawError?: any) {
    super(ERROR_NAMES.InternalError);
    if (rawError) this.rawError = rawError;
  }
}
