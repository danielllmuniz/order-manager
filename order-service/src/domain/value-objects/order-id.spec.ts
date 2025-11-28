import { OrderId, InvalidOrderIdError } from './order-id';

describe('OrderId', () => {
  describe('create', () => {
    it('should create an OrderId with valid string', () => {
      const id = OrderId.create('order-123');

      expect(id.getValue()).toBe('order-123');
    });

    it('should create OrderId with special characters', () => {
      const id = OrderId.create('order-123-abc');

      expect(id.getValue()).toBe('order-123-abc');
    });

    it('should create OrderId with numbers only', () => {
      const id = OrderId.create('123456');

      expect(id.getValue()).toBe('123456');
    });

    it('should trim whitespace from OrderId', () => {
      const id = OrderId.create('  order-123  ');

      expect(id.getValue()).toBe('order-123');
    });

    it('should trim tabs and newlines', () => {
      const id = OrderId.create('\t\norder-123\n\t');

      expect(id.getValue()).toBe('order-123');
    });

    it('should throw error when OrderId is empty string', () => {
      expect(() => OrderId.create('')).toThrow(InvalidOrderIdError);
    });

    it('should throw error when OrderId is only whitespace', () => {
      expect(() => OrderId.create('   ')).toThrow(InvalidOrderIdError);
      expect(() => OrderId.create('\t')).toThrow(InvalidOrderIdError);
      expect(() => OrderId.create('\n')).toThrow(InvalidOrderIdError);
    });

    it('should throw error when OrderId is undefined', () => {
      expect(() => OrderId.create(undefined as any)).toThrow(InvalidOrderIdError);
    });

    it('should throw error when OrderId is null', () => {
      expect(() => OrderId.create(null as any)).toThrow(InvalidOrderIdError);
    });
  });

  describe('equals', () => {
    it('should return true when comparing equal OrderIds', () => {
      const id1 = OrderId.create('order-123');
      const id2 = OrderId.create('order-123');

      expect(id1.equals(id2)).toBe(true);
    });

    it('should return false when comparing different OrderIds', () => {
      const id1 = OrderId.create('order-123');
      const id2 = OrderId.create('order-456');

      expect(id1.equals(id2)).toBe(false);
    });

    it('should handle comparison with whitespace trimming', () => {
      const id1 = OrderId.create('order-123');
      const id2 = OrderId.create('  order-123  ');

      expect(id1.equals(id2)).toBe(true);
    });

    it('should be case sensitive', () => {
      const id1 = OrderId.create('Order-123');
      const id2 = OrderId.create('order-123');

      expect(id1.equals(id2)).toBe(false);
    });

    it('should compare same instance with itself', () => {
      const id = OrderId.create('order-123');

      expect(id.equals(id)).toBe(true);
    });
  });

  describe('getValue', () => {
    it('should return the OrderId value', () => {
      const value = 'order-123';
      const id = OrderId.create(value);

      expect(id.getValue()).toBe(value);
    });

    it('should return trimmed value', () => {
      const id = OrderId.create('  order-123  ');

      expect(id.getValue()).toBe('order-123');
    });
  });

  describe('toString', () => {
    it('should convert OrderId to string', () => {
      const id = OrderId.create('order-123');

      expect(id.toString()).toBe('order-123');
    });

    it('should convert OrderId to string in template literals', () => {
      const id = OrderId.create('order-123');
      const message = `Order: ${id}`;

      expect(message).toBe('Order: order-123');
    });
  });

  describe('InvalidOrderIdError', () => {
    it('should create error with correct message', () => {
      try {
        OrderId.create('');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidOrderIdError);
        expect(error.message).toContain('Invalid order id');
        expect((error as InvalidOrderIdError).name).toBe('InvalidOrderIdError');
      }
    });

    it('should handle error for undefined id', () => {
      try {
        OrderId.create(undefined as any);
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidOrderIdError);
        expect((error as InvalidOrderIdError).name).toBe('InvalidOrderIdError');
      }
    });
  });

  describe('Behavior', () => {
    it('should maintain value after multiple operations', () => {
      const id = OrderId.create('order-123');
      const original = id.getValue();

      id.toString();
      id.equals(OrderId.create('order-123'));
      id.getValue();

      expect(id.getValue()).toBe(original);
    });
  });
});
