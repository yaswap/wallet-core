import { TxNotFoundError } from '@yaswap/errors';
import { LiqualityError } from '@yaswap/error-parser';

export function isTransactionNotFoundError(error: Error): boolean {
  if (error instanceof LiqualityError) {
    return ((error as LiqualityError).rawError as Error)?.name === TxNotFoundError.prototype.name;
  } else {
    return error.name === TxNotFoundError.prototype.name;
  }
}
