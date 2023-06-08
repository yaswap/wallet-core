import { YaswapErrorJSON } from '@yaswap/error-parser';
import { ActionContext, rootActionContext } from '..';

export const logError = (context: ActionContext, error: YaswapErrorJSON) => {
  const { commit } = rootActionContext(context);
  commit.LOG_ERROR(error);
};
