import { ConsoleLogger } from './console-logger';

describe('ConsoleLogger', () => {
  let logger: ConsoleLogger;

  beforeEach(() => {
    logger = new ConsoleLogger();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('debug', () => {
    it('should log debug message', () => {
      const message = 'Debug message';

      logger.debug(message);

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[DEBUG]'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining(message));
    });

    it('should include context in debug message', () => {
      const message = 'Debug with context';
      const context = { userId: '123', action: 'login' };

      logger.debug(message, context);

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[DEBUG]'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining(JSON.stringify(context)));
    });

    it('should include timestamp in debug message', () => {
      logger.debug('Timestamped message');

      const call = (console.log as jest.Mock).mock.calls[0][0];
      expect(call).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });
  });

  describe('info', () => {
    it('should log info message', () => {
      const message = 'Info message';

      logger.info(message);

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[INFO]'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining(message));
    });

    it('should include context in info message', () => {
      const message = 'Order created';
      const context = { orderId: 'order-123', status: 'created' };

      logger.info(message, context);

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[INFO]'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining(JSON.stringify(context)));
    });
  });

  describe('warn', () => {
    it('should log warning message', () => {
      const message = 'Warning message';

      logger.warn(message);

      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('[WARN]'));
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining(message));
    });

    it('should include context in warning message', () => {
      const message = 'Slow operation detected';
      const context = { duration: 5000, threshold: 3000 };

      logger.warn(message, context);

      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('[WARN]'));
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining(JSON.stringify(context)));
    });
  });

  describe('error', () => {
    it('should log error message without error object', () => {
      const message = 'An error occurred';

      logger.error(message);

      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('[ERROR]'));
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining(message));
    });

    it('should log error message with Error object', () => {
      const message = 'Operation failed';
      const error = new Error('Connection timeout');

      logger.error(message, error);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(`${message}: ${error.message}`),
      );
    });

    it('should log error message with unknown error type', () => {
      const message = 'Unknown error';
      const error = 'String error message';

      logger.error(message, error);

      expect(console.error).toHaveBeenCalledWith(expect.stringContaining(`${message}: ${error}`));
    });

    it('should include context with error', () => {
      const message = 'Database error';
      const error = new Error('Connection refused');
      const context = { database: 'mongodb', operation: 'insert' };

      logger.error(message, error, context);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(`${message}: ${error.message}`),
      );
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining(JSON.stringify(context)));
    });

    it('should print stack trace if Error object is provided', () => {
      const error = new Error('Stack trace test');

      logger.error('Error occurred', error);

      expect(console.error).toHaveBeenCalledWith(expect.stringContaining(error.stack!));
    });

    it('should not print stack trace for non-Error types', () => {
      const errorMessage = 'Simple error string';

      logger.error('Error occurred', errorMessage);

      // Should be called but not with the non-Error value's stack
      expect(console.error).toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalledWith(expect.stringContaining('Stack'));
    });
  });

  describe('message formatting', () => {
    it('should include timestamp in all log levels', () => {
      const isoRegex = /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/;

      logger.debug('debug');
      logger.info('info');
      logger.warn('warn');
      logger.error('error');

      const logCalls = [
        (console.log as jest.Mock).mock.calls[0][0],
        (console.log as jest.Mock).mock.calls[1][0],
        (console.warn as jest.Mock).mock.calls[0][0],
        (console.error as jest.Mock).mock.calls[0][0],
      ];

      logCalls.forEach((call) => {
        expect(call).toMatch(isoRegex);
      });
    });

    it('should include log level in all messages', () => {
      logger.debug('debug');
      logger.info('info');
      logger.warn('warn');
      logger.error('error');

      expect(console.log).toHaveBeenNthCalledWith(1, expect.stringContaining('[DEBUG]'));
      expect(console.log).toHaveBeenNthCalledWith(2, expect.stringContaining('[INFO]'));
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('[WARN]'));
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('[ERROR]'));
    });

    it('should format context as JSON', () => {
      const context = { key: 'value', nested: { data: 123 } };

      logger.info('Test message', context);

      const logCall = (console.log as jest.Mock).mock.calls[0][0];
      expect(logCall).toContain(JSON.stringify(context));
    });
  });
});
