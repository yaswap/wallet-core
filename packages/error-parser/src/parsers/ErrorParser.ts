/* eslint-disable @typescript-eslint/no-explicit-any */
import { reportYaswapError } from '../reporters';
import { YaswapError } from '../YaswapErrors/YaswapError';

export abstract class ErrorParser<SourceError, DataType> {
  public static readonly errorSource: string;
  protected abstract _parseError(error: SourceError, data: DataType): YaswapError;

  wrap<F extends (...args: Array<any>) => any>(func: F, data: DataType): ReturnType<F> | undefined {
    try {
      return func();
    } catch (error) {
      const yaswapError = this.parseError(error, data);
      throw yaswapError;
    }
  }
  async wrapAsync<F extends (...args: Array<any>) => Promise<any>>(
    func: F,
    data: DataType
  ): Promise<ReturnType<F> | undefined> {
    try {
      return await func();
    } catch (error) {
      const yaswapError = this.parseError(error, data);
      throw yaswapError;
    }
  }

  parseError(error: SourceError, data: DataType) {
    if (error instanceof YaswapError) return error;
    const parsedError = this._parseError(error, data);
    reportYaswapError(parsedError);
    return parsedError;
  }
}
