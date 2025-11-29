import { Order } from '../../domain/entities/order';
import { IEventPublisher } from '../services/event-publisher.interface';
import { ILogger } from '../services/logger.interface';
import { IOrderRepository } from '../services/order-repository.interface';
import { CreateOrderUseCase } from './create-order.use-case';

describe('CreateOrderUseCase', () => {
  let useCase: CreateOrderUseCase;
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

    useCase = new CreateOrderUseCase(mockRepository, mockEventPublisher, mockLogger);
  });

  describe('execute', () => {
    it('should create an order and save to repository', async () => {
      await useCase.execute();

      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Order));
    });

    it('should publish OrderCreatedEvent', async () => {
      await useCase.execute();

      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'order.created',
        expect.objectContaining({
          orderId: expect.any(String),
          aggregateId: expect.any(String),
          occurredAt: expect.any(Date),
        }),
      );
    });

    it('should return correct response', async () => {
      const response = await useCase.execute();

      expect(response).toMatchObject({
        id: expect.any(String),
        status: 'created',
        createdAt: expect.any(Date),
      });
    });

    it('should create order with CREATED status', async () => {
      const response = await useCase.execute();

      expect(response.status).toBe('created');
    });

    it('should create independent orders', async () => {
      await useCase.execute();
      await useCase.execute();

      expect(mockRepository.save).toHaveBeenCalledTimes(2);
      const firstCall = mockRepository.save.mock.calls[0]![0]!;
      const secondCall = mockRepository.save.mock.calls[1]![0]!;

      expect(typeof firstCall.getId()).toBe('string');
      expect(typeof secondCall.getId()).toBe('string');
      expect(firstCall.getId()).not.toBe(secondCall.getId());
    });

    it('should handle multiple order creations', async () => {
      for (let i = 0; i < 3; i++) {
        await useCase.execute();
      }

      expect(mockRepository.save).toHaveBeenCalledTimes(3);
      expect(mockEventPublisher.publish).toHaveBeenCalledTimes(3);
    });

    it('should throw error when repository save fails', async () => {
      mockRepository.save.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(useCase.execute()).rejects.toThrow(
        'Database error',
      );
    });

    it('should throw error when event publisher fails', async () => {
      mockEventPublisher.publish.mockRejectedValueOnce(
        new Error('RabbitMQ error'),
      );

      await expect(useCase.execute()).rejects.toThrow(
        'RabbitMQ error',
      );
    });
  });

  describe('logging', () => {
    it('should log debug when creating order', async () => {
      await useCase.execute();

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Creating order from factory',
      );
    });

    it('should log info when order is saved', async () => {
      await useCase.execute();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Order saved successfully',
        expect.any(Object),
      );
    });

    it('should log info when use case completes successfully', async () => {
      await useCase.execute();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'CreateOrderUseCase completed successfully',
        expect.any(Object),
      );
    });

    it('should log error when use case fails', async () => {
      const error = new Error('Test error');
      mockRepository.save.mockRejectedValueOnce(error);

      try {
        await useCase.execute();
      } catch {
        // Expected
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        'CreateOrderUseCase failed',
        expect.any(Error),
      );
    });
  });
});
