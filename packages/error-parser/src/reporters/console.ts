import { YaswapErrorJSON } from '../types';
import { YaswapError } from '../YaswapErrors/YaswapError';

export function reportToConsole(error: YaswapError | YaswapErrorJSON) {
  console.error(prepareErrorForConsole(error));
}

function prepareErrorForConsole(error: YaswapError | YaswapErrorJSON) {
  return `New Error From Error Parser \n
          ID: ${error.data.errorId} \n
          Name: ${error.name} \n
          Source: ${error.source} \n
          Developer Message: ${JSON.stringify(error.devMsg)} \n
          Raw Error: ${JSON.stringify(error.rawError)} \n
          Data: ${JSON.stringify(error.data)} \n
          Stack: ${error.stack} \n`;
}
