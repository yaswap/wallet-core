import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';
export class SlippageTooHighError extends YaswapError<SlippageTooHighErrorContext> {
  constructor(data?: SlippageTooHighErrorContext) {
    super(ERROR_NAMES.SlippageTooHighError, data);
  }
}

export type SlippageTooHighErrorContext = { expectedAmount: string; actualAmount: string; currency: string };
