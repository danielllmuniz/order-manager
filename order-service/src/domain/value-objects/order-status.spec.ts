import { OrderStatus, OrderStatusEnum, InvalidOrderStatusError } from './order-status';

describe('OrderStatus', () => {
  describe('create', () => {
    it('should create OrderStatus from enum value', () => {
      const status = OrderStatus.create(OrderStatusEnum.CREATED);

      expect(status.getValue()).toBe(OrderStatusEnum.CREATED);
    });

    it('should create OrderStatus from string value', () => {
      const status = OrderStatus.create('created');

      expect(status.getValue()).toBe(OrderStatusEnum.CREATED);
    });

    it('should create all valid statuses', () => {
      const created = OrderStatus.create('created');
      const processing = OrderStatus.create('processing');
      const shipped = OrderStatus.create('shipped');
      const delivered = OrderStatus.create('delivered');

      expect(created.getValue()).toBe(OrderStatusEnum.CREATED);
      expect(processing.getValue()).toBe(OrderStatusEnum.PROCESSING);
      expect(shipped.getValue()).toBe(OrderStatusEnum.SHIPPED);
      expect(delivered.getValue()).toBe(OrderStatusEnum.DELIVERED);
    });

    it('should throw error for invalid status', () => {
      expect(() => OrderStatus.create('invalid-status')).toThrow(InvalidOrderStatusError);
      expect(() => OrderStatus.create('pending')).toThrow(InvalidOrderStatusError);
      expect(() => OrderStatus.create('')).toThrow(InvalidOrderStatusError);
    });

    it('should throw error for null or undefined', () => {
      expect(() => OrderStatus.create(null as any)).toThrow(InvalidOrderStatusError);
      expect(() => OrderStatus.create(undefined as any)).toThrow(InvalidOrderStatusError);
    });
  });

  describe('Factory methods', () => {
    it('should create CREATED status using factory method', () => {
      const status = OrderStatus.created();

      expect(status.getValue()).toBe(OrderStatusEnum.CREATED);
    });

    it('should create PROCESSING status using factory method', () => {
      const status = OrderStatus.processing();

      expect(status.getValue()).toBe(OrderStatusEnum.PROCESSING);
    });

    it('should create SHIPPED status using factory method', () => {
      const status = OrderStatus.shipped();

      expect(status.getValue()).toBe(OrderStatusEnum.SHIPPED);
    });

    it('should create DELIVERED status using factory method', () => {
      const status = OrderStatus.delivered();

      expect(status.getValue()).toBe(OrderStatusEnum.DELIVERED);
    });

    it('should create independent instances with factory methods', () => {
      const status1 = OrderStatus.created();
      const status2 = OrderStatus.created();

      expect(status1.equals(status2)).toBe(true);
      expect(status1 === status2).toBe(false);
    });
  });

  describe('getValue', () => {
    it('should return the enum value', () => {
      const status = OrderStatus.created();

      expect(status.getValue()).toBe(OrderStatusEnum.CREATED);
    });

    it('should return correct value for each status', () => {
      expect(OrderStatus.created().getValue()).toBe('created');
      expect(OrderStatus.processing().getValue()).toBe('processing');
      expect(OrderStatus.shipped().getValue()).toBe('shipped');
      expect(OrderStatus.delivered().getValue()).toBe('delivered');
    });
  });

  describe('equals', () => {
    it('should return true for equal statuses', () => {
      const status1 = OrderStatus.created();
      const status2 = OrderStatus.created();

      expect(status1.equals(status2)).toBe(true);
    });

    it('should return false for different statuses', () => {
      const created = OrderStatus.created();
      const processing = OrderStatus.processing();

      expect(created.equals(processing)).toBe(false);
    });

    it('should handle comparison with factory-created statuses', () => {
      const created1 = OrderStatus.created();
      const created2 = OrderStatus.create(OrderStatusEnum.CREATED);

      expect(created1.equals(created2)).toBe(true);
    });

    it('should compare same instance with itself', () => {
      const status = OrderStatus.created();

      expect(status.equals(status)).toBe(true);
    });

    it('should compare all status combinations', () => {
      const statuses = [
        OrderStatus.created(),
        OrderStatus.processing(),
        OrderStatus.shipped(),
        OrderStatus.delivered(),
      ];

      // Each status should equal itself
      statuses.forEach((status) => {
        expect(status.equals(status)).toBe(true);
      });

      // Different statuses should not be equal
      for (let i = 0; i < statuses.length; i++) {
        for (let j = i + 1; j < statuses.length; j++) {
          expect(statuses[i].equals(statuses[j])).toBe(false);
        }
      }
    });
  });

  describe('toString', () => {
    it('should convert OrderStatus to string', () => {
      const status = OrderStatus.created();

      expect(status.toString()).toBe('created');
    });

    it('should convert all statuses to string', () => {
      expect(OrderStatus.created().toString()).toBe('created');
      expect(OrderStatus.processing().toString()).toBe('processing');
      expect(OrderStatus.shipped().toString()).toBe('shipped');
      expect(OrderStatus.delivered().toString()).toBe('delivered');
    });

    it('should convert OrderStatus to string in template literals', () => {
      const status = OrderStatus.processing();
      const message = `Current status: ${status}`;

      expect(message).toBe('Current status: processing');
    });
  });

  describe('InvalidOrderStatusError', () => {
    it('should create error with correct message', () => {
      try {
        OrderStatus.create('invalid');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidOrderStatusError);
        expect(error.message).toContain('Invalid order status');
        expect((error as InvalidOrderStatusError).name).toBe('InvalidOrderStatusError');
      }
    });

    it('should include status value in error message', () => {
      try {
        OrderStatus.create('test-status');
      } catch (error) {
        expect((error as Error).message).toContain('test-status');
      }
    });
  });

  describe('Enum values', () => {
    it('should have all expected enum values', () => {
      expect(OrderStatusEnum.CREATED).toBe('created');
      expect(OrderStatusEnum.PROCESSING).toBe('processing');
      expect(OrderStatusEnum.SHIPPED).toBe('shipped');
      expect(OrderStatusEnum.DELIVERED).toBe('delivered');
    });

    it('should have correct count of enum values', () => {
      const values = Object.values(OrderStatusEnum);
      expect(values).toHaveLength(4);
    });

    it('should contain all status values in enum', () => {
      const values = Object.values(OrderStatusEnum);

      expect(values).toContain('created');
      expect(values).toContain('processing');
      expect(values).toContain('shipped');
      expect(values).toContain('delivered');
    });
  });

  describe('Behavior', () => {
    it('should maintain value after multiple operations', () => {
      const status = OrderStatus.created();
      const original = status.getValue();

      status.toString();
      status.equals(OrderStatus.created());
      status.getValue();

      expect(status.getValue()).toBe(original);
    });
  });

  describe('Type safety', () => {
    it('should maintain type information', () => {
      const status: OrderStatus = OrderStatus.created();

      expect(status).toBeInstanceOf(OrderStatus);
    });

    it('should work with functions expecting OrderStatus', () => {
      const expectOrderStatus = (status: OrderStatus): boolean => {
        return status instanceof OrderStatus;
      };

      expect(expectOrderStatus(OrderStatus.created())).toBe(true);
      expect(expectOrderStatus(OrderStatus.processing())).toBe(true);
    });
  });
});
