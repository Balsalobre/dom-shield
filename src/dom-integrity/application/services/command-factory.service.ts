import { DetectElementCommand } from '../commands/detect-element.command';
import type { DetectElementCommandParams } from '../commands/detect-element.command';
import { DetectIframeCommand } from '../commands/detect-iframe.command';
import type { DetectIframeCommandParams } from '../commands/detect-iframe.command';
import { DetectSuspiciousScriptsCommand } from '../commands/detect-suspicious-scripts.command';
import type { DetectSuspiciousScriptsCommandParams } from '../commands/detect-suspicious-scripts.command';
import { DetectLiveElementCommand } from '../commands/detect-live-element.command';
import type { DetectLiveElementCommandParams } from '../commands/detect-live-element.command';
import { GetStatusCommand } from '../commands/get-status.command';
import type { GetStatusCommandParams } from '../commands/get-status.command';

export interface CommandFactory {
  createDetectElementCommand(params: DetectElementCommandParams): DetectElementCommand;
  createDetectIframeCommand(params: DetectIframeCommandParams): DetectIframeCommand;
  createDetectSuspiciousScriptsCommand(params: DetectSuspiciousScriptsCommandParams): DetectSuspiciousScriptsCommand;
  createDetectLiveElementCommand(params: DetectLiveElementCommandParams): DetectLiveElementCommand;
  createGetStatusCommand(params: GetStatusCommandParams): GetStatusCommand;
}

export class DOMCommandFactoryService implements CommandFactory {
  createDetectElementCommand(params: DetectElementCommandParams): DetectElementCommand {
    return new DetectElementCommand(params);
  }

  createDetectIframeCommand(params: DetectIframeCommandParams = {}): DetectIframeCommand {
    return new DetectIframeCommand(params);
  }

  createDetectSuspiciousScriptsCommand(params: DetectSuspiciousScriptsCommandParams): DetectSuspiciousScriptsCommand {
    return new DetectSuspiciousScriptsCommand(params);
  }

  createDetectLiveElementCommand(params: DetectLiveElementCommandParams): DetectLiveElementCommand {
    return new DetectLiveElementCommand(params);
  }

  createGetStatusCommand(params: GetStatusCommandParams = {}): GetStatusCommand {
    return new GetStatusCommand(params);
  }
}
