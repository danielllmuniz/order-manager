import { OrderCreatedEvent } from '../../../domain/events/order-created-event';
import { OrderStatusChangedEvent } from '../../../domain/events/order-status-changed-event';
import { OrderStatusEnum } from '../../../domain/value-objects/order-status';
import { RabbitmqEventPublisher } from './rabbitmq-event-publisher';

const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

describe('RabbitmqEventPublisher - Integration Tests', () => {
  const createTestMessageBroker = () => ({
    publish: jest.fn().mockResolvedValue(undefined),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Publishing Domain Events', () => {
    it('should publish OrderCreatedEvent through message broker', async () => {
      const messageBroker = createTestMessageBroker();
      const publisher = new RabbitmqEventPublisher(messageBroker, mockLogger);
      const event = new OrderCreatedEvent('order-123');

      await publisher.publish('order.created', event);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Event published successfully'),
      );
      expect(messageBroker.publish).toHaveBeenCalledWith(
        'OrderCreatedEvent',
        expect.objectContaining({
          eventName: 'order.created',
          orderId: 'order-123',
        }),
      );
    });

    it('should publish OrderStatusChangedEvent through message broker', async () => {
      const messageBroker = createTestMessageBroker();
      const publisher = new RabbitmqEventPublisher(messageBroker, mockLogger);
      const event = new OrderStatusChangedEvent(
        'order-456',
        OrderStatusEnum.CREATED,
        OrderStatusEnum.PROCESSING,
      );

      await publisher.publish('order.status.changed', event);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Event published successfully'),
      );
      expect(messageBroker.publish).toHaveBeenCalledWith(
        'OrderStatusChangedEvent',
        expect.objectContaining({
          eventName: 'order.status.changed',
          orderId: 'order-456',
        }),
      );
    });

    it('should include proper event metadata in published events', async () => {
      const messageBroker = createTestMessageBroker();
      const publisher = new RabbitmqEventPublisher(messageBroker, mockLogger);
      const event = new OrderCreatedEvent('order-789');

      await publisher.publish('order.created', event);

      const publishCall = messageBroker.publish.mock.calls[0];
      const eventType = publishCall[0] as string;
      const eventPayload = publishCall[1] as Record<string, unknown>;

      expect(eventType).toBe('OrderCreatedEvent');
      expect(eventPayload.eventName).toBe('order.created');
      expect(eventPayload.orderId).toBe('order-789');
    });

    it('should handle concurrent event publishing', async () => {
      const messageBroker = createTestMessageBroker();
      const publisher = new RabbitmqEventPublisher(messageBroker, mockLogger);

      const events = Array.from({ length: 5 }, (_, i) => new OrderCreatedEvent(`order-${i}`));

      await Promise.all(
        events.map((event, i) => publisher.publish(`order.created${i}`, event)),
      );

      expect(messageBroker.publish).toHaveBeenCalledTimes(5);
      expect(mockLogger.info).toHaveBeenCalledTimes(5);
    });
  });

  describe('Error Handling', () => {
    it('should propagate errors from message broker', async () => {
      const errorMessage = 'Publish failed';
      const messageBroker = {
        publish: jest.fn().mockRejectedValue(new Error(errorMessage)),
      };

      const publisher = new RabbitmqEventPublisher(messageBroker, mockLogger);
      const event = new OrderCreatedEvent('order-error-test');

      await expect(publisher.publish('order.created', event)).rejects.toThrow(errorMessage);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to publish event'),
        expect.any(Error),
      );
    });

    it('should log debug information during event publishing', async () => {
      const messageBroker = createTestMessageBroker();
      const publisher = new RabbitmqEventPublisher(messageBroker, mockLogger);
      const event = new OrderCreatedEvent('order-debug-test');

      await publisher.publish('order.created', event);

      expect(mockLogger.debug).toHaveBeenCalledWith('Publishing event: order.created', {
        eventType: 'OrderCreatedEvent',
      });
    });
  });

  describe('Event Sequence', () => {
    it('should publish multiple events in correct sequence', async () => {
      const messageBroker = createTestMessageBroker();
      const publisher = new RabbitmqEventPublisher(messageBroker, mockLogger);

      const createdEvent = new OrderCreatedEvent('order-seq-1');
      const statusEvent = new OrderStatusChangedEvent(
        'order-seq-1',
        OrderStatusEnum.CREATED,
        OrderStatusEnum.PROCESSING,
      );
      const shippedEvent = new OrderStatusChangedEvent(
        'order-seq-1',
        OrderStatusEnum.PROCESSING,
        OrderStatusEnum.SHIPPED,
      );

      await publisher.publish('order.created', createdEvent);
      await publisher.publish('order.status.changed.processing', statusEvent);
      await publisher.publish('order.status.changed.shipped', shippedEvent);

      expect(messageBroker.publish).toHaveBeenCalledTimes(3);

      // Verify call order
      expect((messageBroker.publish.mock.calls[0] as unknown[])[0]).toBe('OrderCreatedEvent');
      expect((messageBroker.publish.mock.calls[1] as unknown[])[0]).toBe('OrderStatusChangedEvent');
      expect((messageBroker.publish.mock.calls[2] as unknown[])[0]).toBe('OrderStatusChangedEvent');
    });
  });
});
