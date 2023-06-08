import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';
export class VeryLowTipError extends YaswapError {
  constructor() {
    super(ERROR_NAMES.VeryLowTipError);
  }
}
