import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';
export class LowSpeedupFeeError extends YaswapError {
  constructor() {
    super(ERROR_NAMES.LowSpeedupFeeError);
  }
}
