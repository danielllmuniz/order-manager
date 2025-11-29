import { Order, CannotAdvanceOrderStatusError } from './order';
import { OrderStatus } from '../value-objects/order-status';

describe('Order', () => {
  describe('constructor', () => {
    it('should create an order with CREATED status by default', () => {
      const id = 'order-123';
      const order = new Order(id);

      expect(order.getId()).toBe(id);
      expect(order.getStatus().equals(OrderStatus.created())).toBe(true);
      expect(order.getCreatedAt()).toBeInstanceOf(Date);
      expect(order.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should create an order with custom status', () => {
      const id = 'order-123';
      const customStatus = OrderStatus.processing();
      const order = new Order(id, customStatus);

      expect(order.getId()).toBe(id);
      expect(order.getStatus().equals(customStatus)).toBe(true);
      expect(order.getCreatedAt()).toBeInstanceOf(Date);
      expect(order.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should create an order with custom createdAt date', () => {
      const id = 'order-123';
      const customDate = new Date('2024-01-01');
      const order = new Order(id, OrderStatus.created(), customDate);

      expect(order.getId()).toBe(id);
      expect(order.getStatus().equals(OrderStatus.created())).toBe(true);
      expect(order.getCreatedAt()).toBe(customDate);
      expect(order.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should create an order with all custom parameters', () => {
      const id = 'order-123';
      const customStatus = OrderStatus.shipped();
      const customDate = new Date('2024-01-01');
      const order = new Order(id, customStatus, customDate);

      expect(order.getId()).toBe(id);
      expect(order.getStatus().equals(customStatus)).toBe(true);
      expect(order.getCreatedAt()).toBe(customDate);
      expect(order.getUpdatedAt()).toBeInstanceOf(Date);
    });
  });

  describe('advance', () => {
    it('should advance from CREATED to PROCESSING', () => {
      const id = 'order-123';
      const order = new Order(id);

      order.advance();

      expect(order.getStatus().equals(OrderStatus.processing())).toBe(true);
    });

    it('should advance from PROCESSING to SHIPPED', () => {
      const id = 'order-123';
      const order = new Order(id, OrderStatus.processing());

      order.advance();

      expect(order.getStatus().equals(OrderStatus.shipped())).toBe(true);
    });

    it('should advance from SHIPPED to DELIVERED', () => {
      const id = 'order-123';
      const order = new Order(id, OrderStatus.shipped());

      order.advance();

      expect(order.getStatus().equals(OrderStatus.delivered())).toBe(true);
    });

    it('should advance through all states automatically', () => {
      const id = 'order-123';
      const order = new Order(id);

      expect(order.getStatus().equals(OrderStatus.created())).toBe(true);

      order.advance();
      expect(order.getStatus().equals(OrderStatus.processing())).toBe(true);

      order.advance();
      expect(order.getStatus().equals(OrderStatus.shipped())).toBe(true);

      order.advance();
      expect(order.getStatus().equals(OrderStatus.delivered())).toBe(true);
    });

    it('should update updatedAt when advancing', () => {
      const id = 'order-123';
      const order = new Order(id);
      const initialUpdatedAt = order.getUpdatedAt();

      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      order.advance();

      expect(order.getUpdatedAt()).not.toEqual(initialUpdatedAt);

      jest.useRealTimers();
    });

    it('should throw error when trying to advance from DELIVERED', () => {
      const id = 'order-123';
      const order = new Order(id, OrderStatus.delivered());

      expect(() => {
        order.advance();
      }).toThrow(CannotAdvanceOrderStatusError);
    });

    it('should not advance status if error is thrown', () => {
      const id = 'order-123';
      const order = new Order(id, OrderStatus.delivered());

      try {
        order.advance();
      } catch {
        // Expected error
      }

      expect(order.getStatus().equals(OrderStatus.delivered())).toBe(true);
    });
  });

  describe('canAdvance', () => {
    it('should return true when CREATED', () => {
      const id = 'order-123';
      const order = new Order(id);

      expect(order.canAdvance()).toBe(true);
    });

    it('should return true when PROCESSING', () => {
      const id = 'order-123';
      const order = new Order(id, OrderStatus.processing());

      expect(order.canAdvance()).toBe(true);
    });

    it('should return true when SHIPPED', () => {
      const id = 'order-123';
      const order = new Order(id, OrderStatus.shipped());

      expect(order.canAdvance()).toBe(true);
    });

    it('should return false when DELIVERED', () => {
      const id = 'order-123';
      const order = new Order(id, OrderStatus.delivered());

      expect(order.canAdvance()).toBe(false);
    });

    it('should not throw when checking canAdvance on DELIVERED', () => {
      const id = 'order-123';
      const order = new Order(id, OrderStatus.delivered());

      expect(() => {
        order.canAdvance();
      }).not.toThrow();
    });
  });

  describe('Getters', () => {
    it('should return id through getter', () => {
      const id = 'order-123';
      const order = new Order(id);

      expect(order.getId()).toBe(id);
    });

    it('should return status through getter', () => {
      const status = OrderStatus.processing();
      const id = 'order-123';
      const order = new Order(id, status);

      expect(order.getStatus().equals(status)).toBe(true);
    });

    it('should return createdAt through getter', () => {
      const date = new Date('2024-01-01');
      const id = 'order-123';
      const order = new Order(id, OrderStatus.created(), date);

      expect(order.getCreatedAt()).toBe(date);
    });

    it('should return updatedAt through getter', () => {
      const id = 'order-123';
      const order = new Order(id);
      const updatedAt = order.getUpdatedAt();

      expect(updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Status progression', () => {
    it('should enforce linear status progression', () => {
      const id = 'order-123';
      const order = new Order(id);

      // Status sequence: CREATED → PROCESSING → SHIPPED → DELIVERED
      const statuses = [
        OrderStatus.created(),
        OrderStatus.processing(),
        OrderStatus.shipped(),
        OrderStatus.delivered(),
      ];

      statuses.forEach((_, index) => {
        if (index < statuses.length - 1) {
          expect(order.canAdvance()).toBe(true);
          order.advance();
        }
      });

      expect(order.getStatus().equals(OrderStatus.delivered())).toBe(true);
      expect(order.canAdvance()).toBe(false);
    });

    it('should maintain immutability of createdAt', () => {
      const id = 'order-123';
      const createdDate = new Date('2024-01-01');
      const order = new Order(id, OrderStatus.created(), createdDate);

      const originalCreatedAt = order.getCreatedAt();

      order.advance();
      order.advance();
      order.advance();

      expect(order.getCreatedAt()).toEqual(originalCreatedAt);
    });
  });
});
