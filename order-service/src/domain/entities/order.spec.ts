import { Order, OrderStatus, InvalidOrderStatusTransitionError } from './order';

describe('Order', () => {
  describe('constructor', () => {
    it('should create an order with default values', () => {
      const id = 'order-123';
      const order = new Order(id);

      expect(order.getId()).toBe(id);
      expect(order.getStatus()).toBe(OrderStatus.CREATED);
      expect(order.getCreatedAt()).toBeInstanceOf(Date);
      expect(order.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should create an order with custom status', () => {
      const id = 'order-123';
      const customStatus = OrderStatus.PROCESSING;
      const order = new Order(id, customStatus);

      expect(order.getId()).toBe(id);
      expect(order.getStatus()).toBe(customStatus);
      expect(order.getCreatedAt()).toBeInstanceOf(Date);
      expect(order.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should create an order with custom createdAt date', () => {
      const id = 'order-123';
      const customDate = new Date('2024-01-01');
      const order = new Order(id, OrderStatus.CREATED, customDate);

      expect(order.getId()).toBe(id);
      expect(order.getStatus()).toBe(OrderStatus.CREATED);
      expect(order.getCreatedAt()).toBe(customDate);
      expect(order.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should create an order with all custom parameters', () => {
      const id = 'order-123';
      const customStatus = OrderStatus.SHIPPED;
      const customDate = new Date('2024-01-01');
      const order = new Order(id, customStatus, customDate);

      expect(order.getId()).toBe(id);
      expect(order.getStatus()).toBe(customStatus);
      expect(order.getCreatedAt()).toBe(customDate);
      expect(order.getUpdatedAt()).toBeInstanceOf(Date);
    });
  });

  describe('updateStatus', () => {
    it('should update status and updatedAt when status changes to valid transition', () => {
      const order = new Order('order-123', OrderStatus.CREATED);
      const initialUpdatedAt = order.getUpdatedAt();

      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      order.updateStatus(OrderStatus.PROCESSING);

      expect(order.getStatus()).toBe(OrderStatus.PROCESSING);
      expect(order.getUpdatedAt()).not.toEqual(initialUpdatedAt);

      jest.useRealTimers();
    });

    it('should not update updatedAt when status is the same', () => {
      const order = new Order('order-123', OrderStatus.CREATED);
      const initialUpdatedAt = order.getUpdatedAt();

      order.updateStatus(OrderStatus.CREATED);

      expect(order.getStatus()).toBe(OrderStatus.CREATED);
      expect(order.getUpdatedAt()).toEqual(initialUpdatedAt);
    });

    it('should handle valid status transitions through all states', () => {
      const order = new Order('order-123');

      expect(order.getStatus()).toBe(OrderStatus.CREATED);

      order.updateStatus(OrderStatus.PROCESSING);
      expect(order.getStatus()).toBe(OrderStatus.PROCESSING);

      order.updateStatus(OrderStatus.SHIPPED);
      expect(order.getStatus()).toBe(OrderStatus.SHIPPED);

      order.updateStatus(OrderStatus.DELIVERED);
      expect(order.getStatus()).toBe(OrderStatus.DELIVERED);
    });

    it('should throw error when attempting invalid status transition', () => {
      const order = new Order('order-123', OrderStatus.CREATED);

      expect(() => {
        order.updateStatus(OrderStatus.SHIPPED);
      }).toThrow(InvalidOrderStatusTransitionError);

      expect(() => {
        order.updateStatus(OrderStatus.DELIVERED);
      }).toThrow(InvalidOrderStatusTransitionError);
    });

    it('should throw error when attempting to transition from PROCESSING to CREATED', () => {
      const order = new Order('order-123', OrderStatus.PROCESSING);

      expect(() => {
        order.updateStatus(OrderStatus.CREATED);
      }).toThrow(InvalidOrderStatusTransitionError);
    });

    it('should throw error when attempting to transition from DELIVERED', () => {
      const order = new Order('order-123', OrderStatus.DELIVERED);

      expect(() => {
        order.updateStatus(OrderStatus.SHIPPED);
      }).toThrow(InvalidOrderStatusTransitionError);

      expect(() => {
        order.updateStatus(OrderStatus.PROCESSING);
      }).toThrow(InvalidOrderStatusTransitionError);
    });

    it('should not update status when invalid transition is attempted', () => {
      const order = new Order('order-123', OrderStatus.CREATED);

      try {
        order.updateStatus(OrderStatus.DELIVERED);
      } catch {
        // Expected error
      }

      expect(order.getStatus()).toBe(OrderStatus.CREATED);
    });
  });

  describe('Getters', () => {
    it('should return id through getter', () => {
      const id = 'order-123';
      const order = new Order(id);

      expect(order.getId()).toBe(id);
    });

    it('should return status through getter', () => {
      const status = OrderStatus.PROCESSING;
      const order = new Order('order-123', status);

      expect(order.getStatus()).toBe(status);
    });

    it('should return createdAt through getter', () => {
      const date = new Date('2024-01-01');
      const order = new Order('order-123', OrderStatus.CREATED, date);

      expect(order.getCreatedAt()).toBe(date);
    });

    it('should return updatedAt through getter', () => {
      const order = new Order('order-123');
      const updatedAt = order.getUpdatedAt();

      expect(updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('OrderStatus enum', () => {
    it('should have all expected status values', () => {
      expect(OrderStatus.CREATED).toBe('created');
      expect(OrderStatus.PROCESSING).toBe('processing');
      expect(OrderStatus.SHIPPED).toBe('shipped');
      expect(OrderStatus.DELIVERED).toBe('delivered');
    });
  });
});
