import { OrderStatus, OrderStatusEnum } from '../value-objects/order-status';
import { OrderFactory } from './order-factory';

describe('OrderFactory', () => {
  describe('create', () => {
    it('should create a new order with CREATED status', () => {
      const id = 'order-123';
      const order = OrderFactory.create(id);

      expect(order.getId().getValue()).toBe(id);
      expect(order.getStatus().equals(OrderStatus.created())).toBe(true);
      expect(order.getCreatedAt()).toBeInstanceOf(Date);
      expect(order.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should create different orders with different ids', () => {
      const order1 = OrderFactory.create('order-1');
      const order2 = OrderFactory.create('order-2');

      expect(order1.getId().getValue()).toBe('order-1');
      expect(order2.getId().getValue()).toBe('order-2');
      expect(order1.getId().equals(order2.getId())).toBe(false);
    });

    it('should throw error when creating order with empty id', () => {
      expect(() => OrderFactory.create('')).toThrow();
      expect(() => OrderFactory.create('   ')).toThrow();
    });
  });

  describe('reconstruct', () => {
    it('should reconstruct an order from persistence', () => {
      const id = 'order-123';
      const status = OrderStatusEnum.PROCESSING;
      const createdAt = new Date('2024-01-01');

      const order = OrderFactory.reconstruct(id, status, createdAt);

      expect(order.getId().getValue()).toBe(id);
      expect(order.getStatus().getValue()).toBe(status);
      expect(order.getCreatedAt()).toBe(createdAt);
    });

    it('should reconstruct order in different states', () => {
      const createdOrder = OrderFactory.reconstruct(
        'order-1',
        OrderStatusEnum.CREATED,
        new Date('2024-01-01'),
      );

      const processingOrder = OrderFactory.reconstruct(
        'order-2',
        OrderStatusEnum.PROCESSING,
        new Date('2024-01-02'),
      );

      const shippedOrder = OrderFactory.reconstruct(
        'order-3',
        OrderStatusEnum.SHIPPED,
        new Date('2024-01-03'),
      );

      const deliveredOrder = OrderFactory.reconstruct(
        'order-4',
        OrderStatusEnum.DELIVERED,
        new Date('2024-01-04'),
      );

      expect(createdOrder.getStatus().equals(OrderStatus.created())).toBe(true);
      expect(processingOrder.getStatus().equals(OrderStatus.processing())).toBe(true);
      expect(shippedOrder.getStatus().equals(OrderStatus.shipped())).toBe(true);
      expect(deliveredOrder.getStatus().equals(OrderStatus.delivered())).toBe(true);
    });

    it('should throw error when reconstructing with invalid id', () => {
      expect(() =>
        OrderFactory.reconstruct('', OrderStatusEnum.CREATED, new Date()),
      ).toThrow();
    });

    it('should throw error when reconstructing with invalid status', () => {
      expect(() =>
        OrderFactory.reconstruct('order-123', 'invalid-status' as any, new Date()),
      ).toThrow();
    });
  });

  describe('createWithStatus', () => {
    it('should create an order with CREATED status', () => {
      const order = OrderFactory.createWithStatus('order-123', OrderStatusEnum.CREATED);

      expect(order.getId().getValue()).toBe('order-123');
      expect(order.getStatus().equals(OrderStatus.created())).toBe(true);
    });

    it('should create an order with PROCESSING status', () => {
      const order = OrderFactory.createWithStatus('order-123', OrderStatusEnum.PROCESSING);

      expect(order.getId().getValue()).toBe('order-123');
      expect(order.getStatus().equals(OrderStatus.processing())).toBe(true);
    });

    it('should create an order with SHIPPED status', () => {
      const order = OrderFactory.createWithStatus('order-123', OrderStatusEnum.SHIPPED);

      expect(order.getId().getValue()).toBe('order-123');
      expect(order.getStatus().equals(OrderStatus.shipped())).toBe(true);
    });

    it('should create an order with DELIVERED status', () => {
      const order = OrderFactory.createWithStatus('order-123', OrderStatusEnum.DELIVERED);

      expect(order.getId().getValue()).toBe('order-123');
      expect(order.getStatus().equals(OrderStatus.delivered())).toBe(true);
    });

    it('should throw error with invalid status', () => {
      expect(() =>
        OrderFactory.createWithStatus('order-123', 'invalid-status' as any),
      ).toThrow();
    });
  });
});
