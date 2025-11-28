import { OrderCreatedEvent } from './order-created-event';

describe('OrderCreatedEvent', () => {
  describe('constructor', () => {
    it('should create an OrderCreatedEvent with required parameters', () => {
      const orderId = 'order-123';

      const event = new OrderCreatedEvent(orderId);

      expect(event.orderId).toBe(orderId);
      expect(event.occurredAt).toBeInstanceOf(Date);
      expect(event.aggregateId).toBe(orderId);
    });

    it('should create event with custom occurredAt', () => {
      const orderId = 'order-123';
      const customDate = new Date('2024-01-01T10:00:00');

      const event = new OrderCreatedEvent(orderId, customDate);

      expect(event.orderId).toBe(orderId);
      expect(event.occurredAt).toBe(customDate);
    });

    it('should auto-generate occurredAt when not provided', () => {
      const orderId = 'order-123';
      const beforeCreation = new Date();

      const event = new OrderCreatedEvent(orderId);

      const afterCreation = new Date();

      expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(event.occurredAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    });
  });

  describe('aggregateId', () => {
    it('should set aggregateId to orderId', () => {
      const orderId = 'order-456';
      const event = new OrderCreatedEvent(orderId);

      expect(event.aggregateId).toBe(orderId);
    });

    it('should maintain consistency between orderId and aggregateId', () => {
      const event = new OrderCreatedEvent('order-789');

      expect(event.aggregateId).toBe(event.orderId);
    });
  });

  describe('Event properties', () => {
    it('should implement DomainEvent interface', () => {
      const event = new OrderCreatedEvent('order-123');

      expect(event).toHaveProperty('occurredAt');
      expect(event).toHaveProperty('aggregateId');
      expect(event.occurredAt).toBeInstanceOf(Date);
      expect(typeof event.aggregateId).toBe('string');
    });

    it('should have all required properties accessible', () => {
      const event = new OrderCreatedEvent('order-123');

      expect(event.orderId).toBeDefined();
      expect(event.occurredAt).toBeDefined();
      expect(event.aggregateId).toBeDefined();
    });
  });

  describe('Multiple events', () => {
    it('should create independent event instances', () => {
      const event1 = new OrderCreatedEvent('order-1');
      const event2 = new OrderCreatedEvent('order-2');

      expect(event1.orderId).not.toBe(event2.orderId);
      expect(event1.aggregateId).not.toBe(event2.aggregateId);
    });

    it('should track creation of multiple orders', () => {
      const orderIds = ['order-1', 'order-2', 'order-3'];
      const events = orderIds.map((id) => new OrderCreatedEvent(id));

      events.forEach((event, index) => {
        expect(event.orderId).toBe(orderIds[index]);
        expect(event.aggregateId).toBe(orderIds[index]);
      });
    });
  });

  describe('Event timing', () => {
    it('should record event occurrence time', () => {
      const event = new OrderCreatedEvent('order-123');

      expect(event.occurredAt).toBeInstanceOf(Date);
      expect(event.occurredAt.getTime()).toBeLessThanOrEqual(new Date().getTime());
    });

    it('should allow custom event timing', () => {
      const customTime = new Date('2024-01-01T12:00:00Z');

      const event = new OrderCreatedEvent('order-123', customTime);

      expect(event.occurredAt).toEqual(customTime);
    });

    it('should maintain chronological order for events', () => {
      const time1 = new Date('2024-01-01T10:00:00');
      const time2 = new Date('2024-01-01T11:00:00');
      const time3 = new Date('2024-01-01T12:00:00');

      const event1 = new OrderCreatedEvent('order-1', time1);
      const event2 = new OrderCreatedEvent('order-2', time2);
      const event3 = new OrderCreatedEvent('order-3', time3);

      expect(event1.occurredAt.getTime()).toBeLessThan(event2.occurredAt.getTime());
      expect(event2.occurredAt.getTime()).toBeLessThan(event3.occurredAt.getTime());
    });
  });
});
