import { ERROR_NAMES } from '../config';
import { YaswapError } from './YaswapError';

export class DappNotConnectedError extends YaswapError<DappNotConnectedErrorContext> {
  constructor(data?: DappNotConnectedErrorContext) {
    super(ERROR_NAMES.DappNotConnectedError, data);
  }
  setTranslationKey() {
    this.translationKey = '';
  }
}

export type DappNotConnectedErrorContext = { dapp: string; chain: string };
