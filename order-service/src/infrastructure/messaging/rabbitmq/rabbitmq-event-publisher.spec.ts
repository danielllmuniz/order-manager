import { RabbitmqEventPublisher } from './rabbitmq-event-publisher';
import { OrderCreatedEvent } from '../../../domain/events/order-created-event';

const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

const mockMessageBroker = {
  publish: jest.fn().mockResolvedValue(undefined),
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  isConnected: jest.fn().mockReturnValue(true),
};

describe('RabbitmqEventPublisher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('publish', () => {
    it('should publish event to message broker', async () => {
      const publisher = new RabbitmqEventPublisher(mockMessageBroker, mockLogger);
      const event = new OrderCreatedEvent('order-123');

      await publisher.publish('order.created', event);

      expect(mockMessageBroker.publish).toHaveBeenCalledWith(
        'OrderCreatedEvent',
        expect.objectContaining({
          eventName: 'order.created',
        }),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Event published successfully: order.created',
      );
    });

    it('should log event details during publish', async () => {
      const publisher = new RabbitmqEventPublisher(mockMessageBroker, mockLogger);
      const event = new OrderCreatedEvent('order-456');

      await publisher.publish('order.created', event);

      expect(mockLogger.debug).toHaveBeenCalledWith('Publishing event: order.created', {
        eventType: 'OrderCreatedEvent',
      });
    });

    it('should propagate message broker publish errors', async () => {
      const error = new Error('Broker error');
      mockMessageBroker.publish.mockRejectedValueOnce(error);

      const publisher = new RabbitmqEventPublisher(mockMessageBroker, mockLogger);
      const event = new OrderCreatedEvent('order-789');

      await expect(publisher.publish('order.created', event)).rejects.toThrow('Broker error');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to publish event order.created:',
        error,
      );
    });

    it('should include event properties in payload', async () => {
      const publisher = new RabbitmqEventPublisher(mockMessageBroker, mockLogger);
      const event = new OrderCreatedEvent('order-xyz');

      await publisher.publish('order.created', event);

      const publishCall = mockMessageBroker.publish.mock.calls[0];
      const payload = publishCall[1];

      expect(payload.eventName).toBe('order.created');
      expect(payload.orderId).toBe('order-xyz');
    });
  });
});
