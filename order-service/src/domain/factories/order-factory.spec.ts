import { OrderStatus, OrderStatusEnum } from '../value-objects/order-status';
import { OrderFactory } from './order-factory';

describe('OrderFactory', () => {
  describe('create', () => {
    it('should create a new order with CREATED status', () => {
      const order = OrderFactory.create();

      expect(typeof order.getId()).toBe('string');
      expect(order.getId().length).toBeGreaterThan(0);
      expect(order.getStatus().equals(OrderStatus.created())).toBe(true);
      expect(order.getCreatedAt()).toBeInstanceOf(Date);
      expect(order.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should create different orders with different ids', () => {
      const order1 = OrderFactory.create();
      const order2 = OrderFactory.create();

      expect(typeof order1.getId()).toBe('string');
      expect(typeof order2.getId()).toBe('string');
      expect(order1.getId()).not.toBe(order2.getId());
    });

    it('should generate UUID v4 format ids', () => {
      const order = OrderFactory.create();
      const id = order.getId();
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuidRegex.test(id)).toBe(true);
    });
  });

  describe('reconstruct', () => {
    it('should reconstruct an order from persistence', () => {
      const id = 'order-123';
      const status = OrderStatusEnum.PROCESSING;
      const createdAt = new Date('2024-01-01');

      const order = OrderFactory.reconstruct(id, status, createdAt);

      expect(order.getId()).toBe(id);
      expect(order.getStatus().getValue()).toBe(status);
      expect(order.getCreatedAt()).toBe(createdAt);
    });

    it('should reconstruct order in different states', () => {
      const createdDate = new Date('2024-01-01');
      const createdOrder = OrderFactory.reconstruct(
        'order-1',
        OrderStatusEnum.CREATED,
        createdDate,
      );

      const processingDate = new Date('2024-01-02');
      const processingOrder = OrderFactory.reconstruct(
        'order-2',
        OrderStatusEnum.PROCESSING,
        processingDate,
      );

      const shippedDate = new Date('2024-01-03');
      const shippedOrder = OrderFactory.reconstruct(
        'order-3',
        OrderStatusEnum.SHIPPED,
        shippedDate,
      );

      const deliveredDate = new Date('2024-01-04');
      const deliveredOrder = OrderFactory.reconstruct(
        'order-4',
        OrderStatusEnum.DELIVERED,
        deliveredDate,
      );

      expect(createdOrder.getStatus().equals(OrderStatus.created())).toBe(true);
      expect(processingOrder.getStatus().equals(OrderStatus.processing())).toBe(true);
      expect(shippedOrder.getStatus().equals(OrderStatus.shipped())).toBe(true);
      expect(deliveredOrder.getStatus().equals(OrderStatus.delivered())).toBe(true);
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

      expect(order.getId()).toBe('order-123');
      expect(order.getStatus().equals(OrderStatus.created())).toBe(true);
    });

    it('should create an order with PROCESSING status', () => {
      const order = OrderFactory.createWithStatus('order-123', OrderStatusEnum.PROCESSING);

      expect(order.getId()).toBe('order-123');
      expect(order.getStatus().equals(OrderStatus.processing())).toBe(true);
    });

    it('should create an order with SHIPPED status', () => {
      const order = OrderFactory.createWithStatus('order-123', OrderStatusEnum.SHIPPED);

      expect(order.getId()).toBe('order-123');
      expect(order.getStatus().equals(OrderStatus.shipped())).toBe(true);
    });

    it('should create an order with DELIVERED status', () => {
      const order = OrderFactory.createWithStatus('order-123', OrderStatusEnum.DELIVERED);

      expect(order.getId()).toBe('order-123');
      expect(order.getStatus().equals(OrderStatus.delivered())).toBe(true);
    });

    it('should throw error with invalid status', () => {
      expect(() =>
        OrderFactory.createWithStatus('order-123', 'invalid-status' as any),
      ).toThrow();
    });
  });
});
