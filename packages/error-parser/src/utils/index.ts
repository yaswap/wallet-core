import { CUSTOM_ERRORS, InternalError, YaswapError } from '../YaswapErrors';
import { reportYaswapError } from '../reporters';
import { YaswapErrorJSON } from '../types';

export function isYaswapErrorString(error: string): boolean {
  return error.startsWith(YASWAP_ERROR_STRING_STARTER);
}

export function yaswapErrorStringToJson(error: string): YaswapErrorJSON {
  return JSON.parse(error.replace(YASWAP_ERROR_STRING_STARTER, ''));
}

export const YASWAP_ERROR_STRING_STARTER = 'YASWAP_ERROR_FROM_ERROR_PARSER_PACKAGE';

export function createInternalError(customError: any): InternalError {
  const internalError = new InternalError(customError);
  reportYaswapError(internalError);
  return internalError;
}

export function errorToYaswapErrorString(error: any): string {
  if (error instanceof YaswapError) return error.toString();
  else if (error instanceof Error && isYaswapErrorString(error.message)) return error.message;
  else return createInternalError(CUSTOM_ERRORS.Unknown(error)).toString();
}

/// @dev gets the name of the error if it's a yaswap error and returns '' otherwise
export function errorName(error: any): string {
  if (error instanceof YaswapError) return error.name;
  else if (error instanceof Error && isYaswapErrorString(error.message))
    return yaswapErrorStringToJson(error.message).name;
  else return '';
}

export function is1001ValidationError(error: any) {
  return error.code === 1001 && error.name === 'ValidationError';
}

export function is1006NotFoundError(error: any) {
  return error.code === 1006 && error.name === 'NotFoundError';
}
