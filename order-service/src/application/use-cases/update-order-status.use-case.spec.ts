import { CannotAdvanceOrderStatusError } from '../../domain/entities/order';
import { OrderFactory } from '../../domain/factories/order-factory';
import { IEventPublisher } from '../services/event-publisher.interface';
import { ILogger } from '../services/logger.interface';
import { IOrderRepository } from '../services/order-repository.interface';
import { UpdateOrderStatusUseCase } from './update-order-status.use-case';

describe('UpdateOrderStatusUseCase', () => {
  let useCase: UpdateOrderStatusUseCase;
  let mockRepository: jest.Mocked<IOrderRepository>;
  let mockEventPublisher: jest.Mocked<IEventPublisher>;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };

    mockEventPublisher = {
      publish: jest.fn(),
    };

    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    useCase = new UpdateOrderStatusUseCase(mockRepository, mockEventPublisher, mockLogger);
  });

  describe('execute', () => {
    it('should advance order status from CREATED to PROCESSING', async () => {
      const order = OrderFactory.create();
      const orderId = order.getId();
      mockRepository.findById.mockResolvedValueOnce(order);

      const response = await useCase.execute({ id: orderId });

      expect(response.previousStatus).toBe('created');
      expect(response.newStatus).toBe('processing');
    });

    it('should update order in repository', async () => {
      const order = OrderFactory.create();
      const orderId = order.getId();
      mockRepository.findById.mockResolvedValueOnce(order);

      await useCase.execute({ id: orderId });

      expect(mockRepository.update).toHaveBeenCalledWith(order);
    });

    it('should publish OrderStatusChangedEvent', async () => {
      const order = OrderFactory.create();
      const orderId = order.getId();
      mockRepository.findById.mockResolvedValueOnce(order);

      await useCase.execute({ id: orderId });

      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'order.status.changed',
        expect.objectContaining({
          orderId: expect.any(String),
          previousStatus: 'created',
          newStatus: 'processing',
        }),
      );
    });

    it('should handle transition from PROCESSING to SHIPPED', async () => {
      const order = OrderFactory.createWithStatus(
        'generated-id',
        'processing',
      );
      const orderId = order.getId();
      mockRepository.findById.mockResolvedValueOnce(order);

      const response = await useCase.execute({ id: orderId });

      expect(response.previousStatus).toBe('processing');
      expect(response.newStatus).toBe('shipped');
    });

    it('should handle transition from SHIPPED to DELIVERED', async () => {
      const order = OrderFactory.createWithStatus('generated-id', 'shipped');
      const orderId = order.getId();
      mockRepository.findById.mockResolvedValueOnce(order);

      const response = await useCase.execute({ id: orderId });

      expect(response.previousStatus).toBe('shipped');
      expect(response.newStatus).toBe('delivered');
    });

    it('should throw error when trying to advance from DELIVERED', async () => {
      const order = OrderFactory.createWithStatus('generated-id', 'delivered');
      const orderId = order.getId();
      mockRepository.findById.mockResolvedValueOnce(order);

      await expect(useCase.execute({ id: orderId })).rejects.toThrow(
        CannotAdvanceOrderStatusError,
      );
    });

    it('should throw error when order not found', async () => {
      mockRepository.findById.mockResolvedValueOnce(null);

      await expect(useCase.execute({ id: 'non-existent' })).rejects.toThrow();
    });

    it('should return correct response structure', async () => {
      const order = OrderFactory.create();
      const orderId = order.getId();
      mockRepository.findById.mockResolvedValueOnce(order);

      const response = await useCase.execute({ id: orderId });

      expect(response).toMatchObject({
        id: orderId,
        previousStatus: expect.any(String),
        newStatus: expect.any(String),
        updatedAt: expect.any(Date),
      });
    });

    it('should not publish event if order advancement fails', async () => {
      const order = OrderFactory.createWithStatus('generated-id', 'delivered');
      const orderId = order.getId();
      mockRepository.findById.mockResolvedValueOnce(order);

      try {
        await useCase.execute({ id: orderId });
      } catch {
        // Expected error
      }

      expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });

    it('should not update repository if order advancement fails', async () => {
      const order = OrderFactory.createWithStatus('generated-id', 'delivered');
      const orderId = order.getId();
      mockRepository.findById.mockResolvedValueOnce(order);

      try {
        await useCase.execute({ id: orderId });
      } catch {
        // Expected error
      }

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should handle complete order lifecycle', async () => {
      const order1 = OrderFactory.create();
      const orderId = order1.getId();
      mockRepository.findById.mockResolvedValueOnce(order1);
      let response = await useCase.execute({ id: orderId });
      expect(response.newStatus).toBe('processing');

      const order2 = OrderFactory.createWithStatus(orderId, 'processing');
      mockRepository.findById.mockResolvedValueOnce(order2);
      response = await useCase.execute({ id: orderId });
      expect(response.newStatus).toBe('shipped');

      const order3 = OrderFactory.createWithStatus(orderId, 'shipped');
      mockRepository.findById.mockResolvedValueOnce(order3);
      response = await useCase.execute({ id: orderId });
      expect(response.newStatus).toBe('delivered');

      expect(mockEventPublisher.publish).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple concurrent status updates', async () => {
      const order1 = OrderFactory.create();
      const order2 = OrderFactory.create();
      const id1 = order1.getId();
      const id2 = order2.getId();

      mockRepository.findById
        .mockResolvedValueOnce(order1)
        .mockResolvedValueOnce(order2);

      await Promise.all([
        useCase.execute({ id: id1 }),
        useCase.execute({ id: id2 }),
      ]);

      expect(mockRepository.update).toHaveBeenCalledTimes(2);
      expect(mockEventPublisher.publish).toHaveBeenCalledTimes(2);
    });

    it('should handle repository update failure', async () => {
      const order = OrderFactory.create();
      const orderId = order.getId();
      mockRepository.findById.mockResolvedValueOnce(order);
      mockRepository.update.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(useCase.execute({ id: orderId })).rejects.toThrow(
        'Database error',
      );
    });

    it('should handle event publisher failure', async () => {
      const order = OrderFactory.create();
      const orderId = order.getId();
      mockRepository.findById.mockResolvedValueOnce(order);
      mockEventPublisher.publish.mockRejectedValueOnce(
        new Error('RabbitMQ error'),
      );

      await expect(useCase.execute({ id: orderId })).rejects.toThrow(
        'RabbitMQ error',
      );
    });
  });
});
