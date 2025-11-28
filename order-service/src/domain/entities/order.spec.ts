import { Order, InvalidOrderStatusTransitionError } from './order';
import { OrderId } from '../value-objects/order-id';
import { OrderStatus } from '../value-objects/order-status';

describe('Order', () => {
  describe('constructor', () => {
    it('should create an order with default values', () => {
      const id = OrderId.create('order-123');
      const order = new Order(id);

      expect(order.getId().equals(id)).toBe(true);
      expect(order.getStatus().equals(OrderStatus.created())).toBe(true);
      expect(order.getCreatedAt()).toBeInstanceOf(Date);
      expect(order.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should create an order with custom status', () => {
      const id = OrderId.create('order-123');
      const customStatus = OrderStatus.processing();
      const order = new Order(id, customStatus);

      expect(order.getId().equals(id)).toBe(true);
      expect(order.getStatus().equals(customStatus)).toBe(true);
      expect(order.getCreatedAt()).toBeInstanceOf(Date);
      expect(order.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should create an order with custom createdAt date', () => {
      const id = OrderId.create('order-123');
      const customDate = new Date('2024-01-01');
      const order = new Order(id, OrderStatus.created(), customDate);

      expect(order.getId().equals(id)).toBe(true);
      expect(order.getStatus().equals(OrderStatus.created())).toBe(true);
      expect(order.getCreatedAt()).toBe(customDate);
      expect(order.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should create an order with all custom parameters', () => {
      const id = OrderId.create('order-123');
      const customStatus = OrderStatus.shipped();
      const customDate = new Date('2024-01-01');
      const order = new Order(id, customStatus, customDate);

      expect(order.getId().equals(id)).toBe(true);
      expect(order.getStatus().equals(customStatus)).toBe(true);
      expect(order.getCreatedAt()).toBe(customDate);
      expect(order.getUpdatedAt()).toBeInstanceOf(Date);
    });
  });

  describe('updateStatus', () => {
    it('should update status and updatedAt when status changes to valid transition', () => {
      const id = OrderId.create('order-123');
      const order = new Order(id, OrderStatus.created());
      const initialUpdatedAt = order.getUpdatedAt();

      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      order.updateStatus(OrderStatus.processing());

      expect(order.getStatus().equals(OrderStatus.processing())).toBe(true);
      expect(order.getUpdatedAt()).not.toEqual(initialUpdatedAt);

      jest.useRealTimers();
    });

    it('should not update updatedAt when status is the same', () => {
      const id = OrderId.create('order-123');
      const order = new Order(id, OrderStatus.created());
      const initialUpdatedAt = order.getUpdatedAt();

      order.updateStatus(OrderStatus.created());

      expect(order.getStatus().equals(OrderStatus.created())).toBe(true);
      expect(order.getUpdatedAt()).toEqual(initialUpdatedAt);
    });

    it('should handle valid status transitions through all states', () => {
      const id = OrderId.create('order-123');
      const order = new Order(id);

      expect(order.getStatus().equals(OrderStatus.created())).toBe(true);

      order.updateStatus(OrderStatus.processing());
      expect(order.getStatus().equals(OrderStatus.processing())).toBe(true);

      order.updateStatus(OrderStatus.shipped());
      expect(order.getStatus().equals(OrderStatus.shipped())).toBe(true);

      order.updateStatus(OrderStatus.delivered());
      expect(order.getStatus().equals(OrderStatus.delivered())).toBe(true);
    });

    it('should throw error when attempting invalid status transition', () => {
      const id = OrderId.create('order-123');
      const order = new Order(id, OrderStatus.created());

      expect(() => {
        order.updateStatus(OrderStatus.shipped());
      }).toThrow(InvalidOrderStatusTransitionError);

      expect(() => {
        order.updateStatus(OrderStatus.delivered());
      }).toThrow(InvalidOrderStatusTransitionError);
    });

    it('should throw error when attempting to transition from PROCESSING to CREATED', () => {
      const id = OrderId.create('order-123');
      const order = new Order(id, OrderStatus.processing());

      expect(() => {
        order.updateStatus(OrderStatus.created());
      }).toThrow(InvalidOrderStatusTransitionError);
    });

    it('should throw error when attempting to transition from DELIVERED', () => {
      const id = OrderId.create('order-123');
      const order = new Order(id, OrderStatus.delivered());

      expect(() => {
        order.updateStatus(OrderStatus.shipped());
      }).toThrow(InvalidOrderStatusTransitionError);

      expect(() => {
        order.updateStatus(OrderStatus.processing());
      }).toThrow(InvalidOrderStatusTransitionError);
    });

    it('should not update status when invalid transition is attempted', () => {
      const id = OrderId.create('order-123');
      const order = new Order(id, OrderStatus.created());

      try {
        order.updateStatus(OrderStatus.delivered());
      } catch {
        // Expected error
      }

      expect(order.getStatus().equals(OrderStatus.created())).toBe(true);
    });
  });

  describe('Getters', () => {
    it('should return id through getter', () => {
      const id = OrderId.create('order-123');
      const order = new Order(id);

      expect(order.getId().equals(id)).toBe(true);
    });

    it('should return status through getter', () => {
      const status = OrderStatus.processing();
      const id = OrderId.create('order-123');
      const order = new Order(id, status);

      expect(order.getStatus().equals(status)).toBe(true);
    });

    it('should return createdAt through getter', () => {
      const date = new Date('2024-01-01');
      const id = OrderId.create('order-123');
      const order = new Order(id, OrderStatus.created(), date);

      expect(order.getCreatedAt()).toBe(date);
    });

    it('should return updatedAt through getter', () => {
      const id = OrderId.create('order-123');
      const order = new Order(id);
      const updatedAt = order.getUpdatedAt();

      expect(updatedAt).toBeInstanceOf(Date);
    });
  });
});
