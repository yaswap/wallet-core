/* eslint-disable @typescript-eslint/no-explicit-any */

import { YaswapError, ThirdPartyError, UnknownError } from '../../YaswapErrors';
import { THORCHAIN_ERROR_SOURCE_NAME, THORCHAIN_ERRORS } from '.';
import { ErrorParser } from '../ErrorParser';
export class ThorchainAPIErrorParser extends ErrorParser<Error, ThorchainAPIErrorParserDataType> {
  public static readonly errorSource = THORCHAIN_ERROR_SOURCE_NAME;

  protected _parseError(error: Error, data?: ThorchainAPIErrorParserDataType): YaswapError {
    let liqError: YaswapError;
    let desc = '';
    switch (error.message) {
      case THORCHAIN_ERRORS.NETWORK_ERROR:
        liqError = new ThirdPartyError();
        desc = 'Thorchain seems to be down. Try contacting their support to ask why';
        break;
      default:
        liqError = new UnknownError();
        break;
    }

    liqError.source = ThorchainAPIErrorParser.errorSource;
    liqError.devMsg = {
      desc,
      data: data || {},
    };
    liqError.rawError = error;

    return liqError;
  }
}

export type ThorchainAPIErrorParserDataType = { txHash?: string };
