import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';
export class VeryHighTipWarning extends YaswapError {
  constructor() {
    super(ERROR_NAMES.VeryHighTipWarning);
  }
}
