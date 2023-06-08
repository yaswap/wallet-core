import { TxNotFoundError } from '@yaswap/errors';
import { YaswapError } from '@yaswap/error-parser';

export function isTransactionNotFoundError(error: Error): boolean {
  if (error instanceof YaswapError) {
    return ((error as YaswapError).rawError as Error)?.name === TxNotFoundError.prototype.name;
  } else {
    return error.name === TxNotFoundError.prototype.name;
  }
}
