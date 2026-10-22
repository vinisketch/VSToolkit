import { container } from 'vs_utils';
import { consoleLogger, LOGGER } from '../src/core/ILogger';

container.registerValue(LOGGER, consoleLogger);
