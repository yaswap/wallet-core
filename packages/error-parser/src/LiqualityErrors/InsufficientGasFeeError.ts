import { LiqualityError } from './LiqualityError';
export class InsufficientGasFeeError extends LiqualityError<InsufficientGasFeeErrorContext> {
  public readonly name = InsufficientGasFeeError.name;

  constructor(data?: InsufficientGasFeeErrorContext) {
    super(data);
  }
}

export type InsufficientGasFeeErrorContext = { currency: string; gasFee: string };
