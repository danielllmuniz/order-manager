import { OrderStatusEnum } from '../value-objects/order-status';
import { OrderStatusChangedEvent } from './order-status-changed-event';

describe('OrderStatusChangedEvent', () => {
  describe('constructor', () => {
    it('should create an OrderStatusChangedEvent with required parameters', () => {
      const orderId = 'order-123';
      const previousStatus = OrderStatusEnum.CREATED;
      const newStatus = OrderStatusEnum.PROCESSING;

      const event = new OrderStatusChangedEvent(orderId, previousStatus, newStatus);

      expect(event.orderId).toBe(orderId);
      expect(event.previousStatus).toBe(previousStatus);
      expect(event.newStatus).toBe(newStatus);
      expect(event.occurredAt).toBeInstanceOf(Date);
      expect(event.aggregateId).toBe(orderId);
    });

    it('should create event with custom occurredAt', () => {
      const orderId = 'order-123';
      const previousStatus = OrderStatusEnum.CREATED;
      const newStatus = OrderStatusEnum.PROCESSING;
      const customDate = new Date('2024-01-01T10:00:00');

      const event = new OrderStatusChangedEvent(
        orderId,
        previousStatus,
        newStatus,
        customDate,
      );

      expect(event.occurredAt).toBe(customDate);
    });

    it('should auto-generate occurredAt when not provided', () => {
      const orderId = 'order-123';
      const beforeCreation = new Date();

      const event = new OrderStatusChangedEvent(
        orderId,
        OrderStatusEnum.CREATED,
        OrderStatusEnum.PROCESSING,
      );

      const afterCreation = new Date();

      expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(event.occurredAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    });
  });

  describe('aggregateId', () => {
    it('should set aggregateId to orderId', () => {
      const orderId = 'order-456';
      const event = new OrderStatusChangedEvent(
        orderId,
        OrderStatusEnum.CREATED,
        OrderStatusEnum.PROCESSING,
      );

      expect(event.aggregateId).toBe(orderId);
    });

    it('should maintain consistency between orderId and aggregateId', () => {
      const event = new OrderStatusChangedEvent(
        'order-789',
        OrderStatusEnum.PROCESSING,
        OrderStatusEnum.SHIPPED,
      );

      expect(event.aggregateId).toBe(event.orderId);
    });
  });

  describe('Status transitions', () => {
    it('should record transition from CREATED to PROCESSING', () => {
      const event = new OrderStatusChangedEvent(
        'order-123',
        OrderStatusEnum.CREATED,
        OrderStatusEnum.PROCESSING,
      );

      expect(event.previousStatus).toBe(OrderStatusEnum.CREATED);
      expect(event.newStatus).toBe(OrderStatusEnum.PROCESSING);
    });

    it('should record transition from PROCESSING to SHIPPED', () => {
      const event = new OrderStatusChangedEvent(
        'order-123',
        OrderStatusEnum.PROCESSING,
        OrderStatusEnum.SHIPPED,
      );

      expect(event.previousStatus).toBe(OrderStatusEnum.PROCESSING);
      expect(event.newStatus).toBe(OrderStatusEnum.SHIPPED);
    });

    it('should record transition from SHIPPED to DELIVERED', () => {
      const event = new OrderStatusChangedEvent(
        'order-123',
        OrderStatusEnum.SHIPPED,
        OrderStatusEnum.DELIVERED,
      );

      expect(event.previousStatus).toBe(OrderStatusEnum.SHIPPED);
      expect(event.newStatus).toBe(OrderStatusEnum.DELIVERED);
    });

    it('should handle all possible status transitions', () => {
      const transitions: Array<[OrderStatusEnum, OrderStatusEnum]> = [
        [OrderStatusEnum.CREATED, OrderStatusEnum.PROCESSING],
        [OrderStatusEnum.PROCESSING, OrderStatusEnum.SHIPPED],
        [OrderStatusEnum.SHIPPED, OrderStatusEnum.DELIVERED],
      ];

      transitions.forEach(([previous, next]) => {
        const event = new OrderStatusChangedEvent('order-123', previous, next);

        expect(event.previousStatus).toBe(previous);
        expect(event.newStatus).toBe(next);
      });
    });
  });

  describe('Event properties', () => {
    it('should implement DomainEvent interface', () => {
      const event = new OrderStatusChangedEvent(
        'order-123',
        OrderStatusEnum.CREATED,
        OrderStatusEnum.PROCESSING,
      );

      expect(event).toHaveProperty('occurredAt');
      expect(event).toHaveProperty('aggregateId');
      expect(event.occurredAt).toBeInstanceOf(Date);
      expect(typeof event.aggregateId).toBe('string');
    });

    it('should have all required properties accessible', () => {
      const event = new OrderStatusChangedEvent(
        'order-123',
        OrderStatusEnum.CREATED,
        OrderStatusEnum.PROCESSING,
      );

      expect(event.orderId).toBeDefined();
      expect(event.previousStatus).toBeDefined();
      expect(event.newStatus).toBeDefined();
      expect(event.occurredAt).toBeDefined();
      expect(event.aggregateId).toBeDefined();
    });
  });

  describe('Multiple events', () => {
    it('should create independent event instances', () => {
      const event1 = new OrderStatusChangedEvent(
        'order-1',
        OrderStatusEnum.CREATED,
        OrderStatusEnum.PROCESSING,
      );

      const event2 = new OrderStatusChangedEvent(
        'order-2',
        OrderStatusEnum.PROCESSING,
        OrderStatusEnum.SHIPPED,
      );

      expect(event1.orderId).not.toBe(event2.orderId);
      expect(event1.previousStatus).not.toBe(event2.newStatus);
    });

    it('should track multiple transitions for same order', () => {
      const orderId = 'order-123';

      const event1 = new OrderStatusChangedEvent(
        orderId,
        OrderStatusEnum.CREATED,
        OrderStatusEnum.PROCESSING,
      );

      const event2 = new OrderStatusChangedEvent(
        orderId,
        OrderStatusEnum.PROCESSING,
        OrderStatusEnum.SHIPPED,
      );

      expect(event1.aggregateId).toBe(event2.aggregateId);
      expect(event1.newStatus).toBe(event2.previousStatus);
    });
  });

  describe('Event timing', () => {
    it('should record event occurrence time', () => {
      const event = new OrderStatusChangedEvent(
        'order-123',
        OrderStatusEnum.CREATED,
        OrderStatusEnum.PROCESSING,
      );

      expect(event.occurredAt).toBeInstanceOf(Date);
      expect(event.occurredAt.getTime()).toBeLessThanOrEqual(new Date().getTime());
    });

    it('should allow custom event timing', () => {
      const customTime = new Date('2024-01-01T12:00:00Z');

      const event = new OrderStatusChangedEvent(
        'order-123',
        OrderStatusEnum.CREATED,
        OrderStatusEnum.PROCESSING,
        customTime,
      );

      expect(event.occurredAt).toEqual(customTime);
    });

    it('should maintain chronological order for events', () => {
      const time1 = new Date('2024-01-01T10:00:00');
      const time2 = new Date('2024-01-01T11:00:00');
      const time3 = new Date('2024-01-01T12:00:00');

      const event1 = new OrderStatusChangedEvent(
        'order-123',
        OrderStatusEnum.CREATED,
        OrderStatusEnum.PROCESSING,
        time1,
      );

      const event2 = new OrderStatusChangedEvent(
        'order-123',
        OrderStatusEnum.PROCESSING,
        OrderStatusEnum.SHIPPED,
        time2,
      );

      const event3 = new OrderStatusChangedEvent(
        'order-123',
        OrderStatusEnum.SHIPPED,
        OrderStatusEnum.DELIVERED,
        time3,
      );

      expect(event1.occurredAt.getTime()).toBeLessThan(event2.occurredAt.getTime());
      expect(event2.occurredAt.getTime()).toBeLessThan(event3.occurredAt.getTime());
    });
  });
});
