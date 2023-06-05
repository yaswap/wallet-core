import { TxNotFoundError } from '@yac-swap/errors';
import { LiqualityError } from '@yac-swap/error-parser';

export function isTransactionNotFoundError(error: Error): boolean {
  if (error instanceof LiqualityError) {
    return ((error as LiqualityError).rawError as Error)?.name === TxNotFoundError.prototype.name;
  } else {
    return error.name === TxNotFoundError.prototype.name;
  }
}
