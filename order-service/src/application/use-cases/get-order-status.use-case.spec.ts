import { OrderFactory } from '../../domain/factories/order-factory';
import { ILogger } from '../services/logger.interface';
import { IOrderRepository } from '../services/order-repository.interface';
import { GetOrderStatusUseCase, OrderNotFoundError } from './get-order-status.use-case';

describe('GetOrderStatusUseCase', () => {
  let useCase: GetOrderStatusUseCase;
  let mockRepository: jest.Mocked<IOrderRepository>;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };

    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    useCase = new GetOrderStatusUseCase(mockRepository, mockLogger);
  });

  describe('execute', () => {
    it('should return order status when order exists', async () => {
      const orderId = 'order-123';
      const order = OrderFactory.create(orderId);
      mockRepository.findById.mockResolvedValueOnce(order);

      const response = await useCase.execute({ id: orderId });

      expect(response).toMatchObject({
        id: orderId,
        status: 'created',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        canAdvance: true,
      });
    });

    it('should throw OrderNotFoundError when order does not exist', async () => {
      mockRepository.findById.mockResolvedValueOnce(null);

      await expect(
        useCase.execute({ id: 'non-existent-order' }),
      ).rejects.toThrow(OrderNotFoundError);
    });

    it('should include canAdvance flag in response', async () => {
      const order = OrderFactory.create('order-123');
      mockRepository.findById.mockResolvedValueOnce(order);

      const response = await useCase.execute({ id: 'order-123' });

      expect(response.canAdvance).toBe(true);
    });

    it('should return correct status for CREATED order', async () => {
      const order = OrderFactory.create('order-1');
      mockRepository.findById.mockResolvedValueOnce(order);

      const response = await useCase.execute({ id: 'order-1' });

      expect(response.status).toBe('created');
    });

    it('should return correct status for PROCESSING order', async () => {
      const order = OrderFactory.createWithStatus('order-2', 'processing');
      mockRepository.findById.mockResolvedValueOnce(order);

      const response = await useCase.execute({ id: 'order-2' });

      expect(response.status).toBe('processing');
    });

    it('should return correct status for SHIPPED order', async () => {
      const order = OrderFactory.createWithStatus('order-3', 'shipped');
      mockRepository.findById.mockResolvedValueOnce(order);

      const response = await useCase.execute({ id: 'order-3' });

      expect(response.status).toBe('shipped');
    });

    it('should return correct status for DELIVERED order', async () => {
      const order = OrderFactory.createWithStatus('order-4', 'delivered');
      mockRepository.findById.mockResolvedValueOnce(order);

      const response = await useCase.execute({ id: 'order-4' });

      expect(response.status).toBe('delivered');
      expect(response.canAdvance).toBe(false);
    });

    it('should query repository with correct order id', async () => {
      const orderId = 'order-special';
      const order = OrderFactory.create(orderId);
      mockRepository.findById.mockResolvedValueOnce(order);

      await useCase.execute({ id: orderId });

      expect(mockRepository.findById).toHaveBeenCalledWith(orderId);
    });

    it('should return immutable timestamps', async () => {
      const order = OrderFactory.create('order-123');
      const originalCreatedAt = order.getCreatedAt();
      const originalUpdatedAt = order.getUpdatedAt();

      mockRepository.findById.mockResolvedValueOnce(order);

      const response = await useCase.execute({ id: 'order-123' });

      expect(response.createdAt).toEqual(originalCreatedAt);
      expect(response.updatedAt).toEqual(originalUpdatedAt);
    });

    it('should handle repository errors', async () => {
      mockRepository.findById.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(useCase.execute({ id: 'order-123' })).rejects.toThrow(
        'Database error',
      );
    });

    it('should retrieve multiple different orders', async () => {
      const order1 = OrderFactory.create('order-1');
      const order2 = OrderFactory.create('order-2');

      mockRepository.findById.mockResolvedValueOnce(order1);
      const response1 = await useCase.execute({ id: 'order-1' });

      mockRepository.findById.mockResolvedValueOnce(order2);
      const response2 = await useCase.execute({ id: 'order-2' });

      expect(response1.id).toBe('order-1');
      expect(response2.id).toBe('order-2');
    });
  });

  describe('OrderNotFoundError', () => {
    it('should create error with correct message', () => {
      const orderId = 'order-404';
      const error = new OrderNotFoundError(orderId);

      expect(error.message).toContain(orderId);
      expect(error.name).toBe('OrderNotFoundError');
    });
  });
});
