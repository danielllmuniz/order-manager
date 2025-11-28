import { CannotAdvanceOrderStatusError } from '../../domain/entities/order';
import { OrderFactory } from '../../domain/factories/order-factory';
import { IOrderRepository } from '../repositories/order-repository.interface';
import { IEventPublisher } from '../services/event-publisher.interface';
import { UpdateOrderStatusUseCase } from './update-order-status.use-case';

describe('UpdateOrderStatusUseCase', () => {
  let useCase: UpdateOrderStatusUseCase;
  let mockRepository: jest.Mocked<IOrderRepository>;
  let mockEventPublisher: jest.Mocked<IEventPublisher>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };

    mockEventPublisher = {
      publish: jest.fn(),
    };

    useCase = new UpdateOrderStatusUseCase(mockRepository, mockEventPublisher);
  });

  describe('execute', () => {
    it('should advance order status from CREATED to PROCESSING', async () => {
      const order = OrderFactory.create('order-123');
      mockRepository.findById.mockResolvedValueOnce(order);

      const response = await useCase.execute({ id: 'order-123' });

      expect(response.previousStatus).toBe('created');
      expect(response.newStatus).toBe('processing');
    });

    it('should update order in repository', async () => {
      const order = OrderFactory.create('order-123');
      mockRepository.findById.mockResolvedValueOnce(order);

      await useCase.execute({ id: 'order-123' });

      expect(mockRepository.update).toHaveBeenCalledWith(order);
    });

    it('should publish OrderStatusChangedEvent', async () => {
      const orderId = 'order-123';
      const order = OrderFactory.create(orderId);
      mockRepository.findById.mockResolvedValueOnce(order);

      await useCase.execute({ id: orderId });

      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'order.status-changed',
        expect.objectContaining({
          orderId,
          previousStatus: 'created',
          newStatus: 'processing',
        }),
      );
    });

    it('should handle transition from PROCESSING to SHIPPED', async () => {
      const order = OrderFactory.createWithStatus('order-456', 'processing');
      mockRepository.findById.mockResolvedValueOnce(order);

      const response = await useCase.execute({ id: 'order-456' });

      expect(response.previousStatus).toBe('processing');
      expect(response.newStatus).toBe('shipped');
    });

    it('should handle transition from SHIPPED to DELIVERED', async () => {
      const order = OrderFactory.createWithStatus('order-789', 'shipped');
      mockRepository.findById.mockResolvedValueOnce(order);

      const response = await useCase.execute({ id: 'order-789' });

      expect(response.previousStatus).toBe('shipped');
      expect(response.newStatus).toBe('delivered');
    });

    it('should throw error when trying to advance from DELIVERED', async () => {
      const order = OrderFactory.createWithStatus('order-delivered', 'delivered');
      mockRepository.findById.mockResolvedValueOnce(order);

      await expect(useCase.execute({ id: 'order-delivered' })).rejects.toThrow(
        CannotAdvanceOrderStatusError,
      );
    });

    it('should throw error when order not found', async () => {
      mockRepository.findById.mockResolvedValueOnce(null);

      await expect(useCase.execute({ id: 'non-existent' })).rejects.toThrow();
    });

    it('should return correct response structure', async () => {
      const order = OrderFactory.create('order-123');
      mockRepository.findById.mockResolvedValueOnce(order);

      const response = await useCase.execute({ id: 'order-123' });

      expect(response).toMatchObject({
        id: 'order-123',
        previousStatus: expect.any(String),
        newStatus: expect.any(String),
        updatedAt: expect.any(Date),
      });
    });

    it('should not publish event if order advancement fails', async () => {
      const order = OrderFactory.createWithStatus('order-delivered', 'delivered');
      mockRepository.findById.mockResolvedValueOnce(order);

      try {
        await useCase.execute({ id: 'order-delivered' });
      } catch {
        // Expected error
      }

      expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });

    it('should not update repository if order advancement fails', async () => {
      const order = OrderFactory.createWithStatus('order-delivered', 'delivered');
      mockRepository.findById.mockResolvedValueOnce(order);

      try {
        await useCase.execute({ id: 'order-delivered' });
      } catch {
        // Expected error
      }

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should handle complete order lifecycle', async () => {
      const order1 = OrderFactory.create('order-lifecycle');
      mockRepository.findById.mockResolvedValueOnce(order1);
      let response = await useCase.execute({ id: 'order-lifecycle' });
      expect(response.newStatus).toBe('processing');

      const order2 = OrderFactory.createWithStatus(
        'order-lifecycle',
        'processing',
      );
      mockRepository.findById.mockResolvedValueOnce(order2);
      response = await useCase.execute({ id: 'order-lifecycle' });
      expect(response.newStatus).toBe('shipped');

      const order3 = OrderFactory.createWithStatus('order-lifecycle', 'shipped');
      mockRepository.findById.mockResolvedValueOnce(order3);
      response = await useCase.execute({ id: 'order-lifecycle' });
      expect(response.newStatus).toBe('delivered');

      expect(mockEventPublisher.publish).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple concurrent status updates', async () => {
      const order1 = OrderFactory.create('order-1');
      const order2 = OrderFactory.create('order-2');

      mockRepository.findById
        .mockResolvedValueOnce(order1)
        .mockResolvedValueOnce(order2);

      await Promise.all([
        useCase.execute({ id: 'order-1' }),
        useCase.execute({ id: 'order-2' }),
      ]);

      expect(mockRepository.update).toHaveBeenCalledTimes(2);
      expect(mockEventPublisher.publish).toHaveBeenCalledTimes(2);
    });

    it('should handle repository update failure', async () => {
      const order = OrderFactory.create('order-123');
      mockRepository.findById.mockResolvedValueOnce(order);
      mockRepository.update.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(useCase.execute({ id: 'order-123' })).rejects.toThrow(
        'Database error',
      );
    });

    it('should handle event publisher failure', async () => {
      const order = OrderFactory.create('order-123');
      mockRepository.findById.mockResolvedValueOnce(order);
      mockEventPublisher.publish.mockRejectedValueOnce(
        new Error('RabbitMQ error'),
      );

      await expect(useCase.execute({ id: 'order-123' })).rejects.toThrow(
        'RabbitMQ error',
      );
    });
  });
});
