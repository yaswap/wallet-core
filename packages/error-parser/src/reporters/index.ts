import { InternalError, CUSTOM_ERRORS } from '../YaswapErrors';
import { errorToYaswapErrorString, isYaswapErrorString, yaswapErrorStringToJson } from '../utils';
import { YaswapError } from '../YaswapErrors/YaswapError';
import { YaswapErrorJSON, ReportTargets } from '../types';
import { reportToConsole } from './console';
import { reportToDiscord } from './discord';

const reporterConfig = new (class ReporterConfig {
  public useReporter: boolean;
  public callback: (error: YaswapErrorJSON) => any;

  constructor() {
    this.useReporter = false;
    this.callback = false as any;
  }
})();

export function updateErrorReporterConfig({
  useReporter,
  callback,
}: {
  useReporter?: boolean;
  callback?: (error: YaswapErrorJSON) => any;
}) {
  if (typeof useReporter !== 'undefined') reporterConfig.useReporter = useReporter;
  if (callback) {
    reporterConfig.callback = callback;
  }
}

export function reportYaswapError(error: any) {
  if (reporterConfig.useReporter) {
    const yaswapError = errorToYaswapErrorObj(error);
    if (!yaswapError.reportable || yaswapError.reported) return;
    const reportTargets = process.env.VUE_APP_REPORT_TARGETS;
    if (reportTargets?.includes(ReportTargets.Console)) reportToConsole(yaswapError);
    if (reportTargets?.includes(ReportTargets.Discord)) reportToDiscord(yaswapError);

    yaswapError.reported = true;
  }
  reporterConfig.callback && reporterConfig.callback(yaswapErrorStringToJson(errorToYaswapErrorString(error)));
}

function errorToYaswapErrorObj(error: any): YaswapError | YaswapErrorJSON {
  if (error instanceof YaswapError) return error;
  else if (error instanceof Error && isYaswapErrorString(error.message))
    return yaswapErrorStringToJson(error.message);
  else return new InternalError(CUSTOM_ERRORS.Unknown(error));
}
