import { Order, OrderStatus } from './order';

describe('Order', () => {
  describe('constructor', () => {
    it('should create an order with default values', () => {
      const id = 'order-123';
      const order = new Order(id);

      expect(order.id).toBe(id);
      expect(order.status).toBe(OrderStatus.CREATED);
      expect(order.createdAt).toBeInstanceOf(Date);
      expect(order.updatedAt).toBeInstanceOf(Date);
    });

    it('should create an order with custom status', () => {
      const id = 'order-123';
      const customStatus = OrderStatus.PROCESSING;
      const order = new Order(id, customStatus);

      expect(order.id).toBe(id);
      expect(order.status).toBe(customStatus);
      expect(order.createdAt).toBeInstanceOf(Date);
      expect(order.updatedAt).toBeInstanceOf(Date);
    });

    it('should create an order with custom createdAt date', () => {
      const id = 'order-123';
      const customDate = new Date('2024-01-01');
      const order = new Order(id, OrderStatus.CREATED, customDate);

      expect(order.id).toBe(id);
      expect(order.status).toBe(OrderStatus.CREATED);
      expect(order.createdAt).toBe(customDate);
      expect(order.updatedAt).toBeInstanceOf(Date);
    });

    it('should create an order with all custom parameters', () => {
      const id = 'order-123';
      const customStatus = OrderStatus.SHIPPED;
      const customDate = new Date('2024-01-01');
      const order = new Order(id, customStatus, customDate);

      expect(order.id).toBe(id);
      expect(order.status).toBe(customStatus);
      expect(order.createdAt).toBe(customDate);
      expect(order.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('updateStatus', () => {
    it('should update status and updatedAt when status changes', () => {
      const order = new Order('order-123', OrderStatus.CREATED);
      const initialUpdatedAt = order.updatedAt;

      // Wait a bit to ensure updatedAt will be different
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      order.updateStatus(OrderStatus.PROCESSING);

      expect(order.status).toBe(OrderStatus.PROCESSING);
      expect(order.updatedAt).not.toEqual(initialUpdatedAt);

      jest.useRealTimers();
    });

    it('should not update updatedAt when status is the same', () => {
      const order = new Order('order-123', OrderStatus.CREATED);
      const initialUpdatedAt = order.updatedAt;

      order.updateStatus(OrderStatus.CREATED);

      expect(order.status).toBe(OrderStatus.CREATED);
      expect(order.updatedAt).toEqual(initialUpdatedAt);
    });

    it('should handle status transitions through all states', () => {
      const order = new Order('order-123');

      expect(order.status).toBe(OrderStatus.CREATED);

      order.updateStatus(OrderStatus.PROCESSING);
      expect(order.status).toBe(OrderStatus.PROCESSING);

      order.updateStatus(OrderStatus.SHIPPED);
      expect(order.status).toBe(OrderStatus.SHIPPED);

      order.updateStatus(OrderStatus.DELIVERED);
      expect(order.status).toBe(OrderStatus.DELIVERED);
    });

    it('should not update when status is already the target status', () => {
      const order = new Order('order-123', OrderStatus.PROCESSING);
      const statusBeforeUpdate = order.status;
      const updatedAtBeforeUpdate = order.updatedAt;

      order.updateStatus(OrderStatus.PROCESSING);

      expect(order.status).toBe(statusBeforeUpdate);
      expect(order.updatedAt).toEqual(updatedAtBeforeUpdate);
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
