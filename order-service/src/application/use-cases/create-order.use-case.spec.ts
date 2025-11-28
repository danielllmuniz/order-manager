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
      const orderId = 'order-123';

      await useCase.execute({ id: orderId });

      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Order));
    });

    it('should publish OrderCreatedEvent', async () => {
      const orderId = 'order-123';

      await useCase.execute({ id: orderId });

      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'order.created',
        expect.objectContaining({
          orderId,
        }),
      );
    });

    it('should return correct response', async () => {
      const orderId = 'order-456';

      const response = await useCase.execute({ id: orderId });

      expect(response).toMatchObject({
        id: orderId,
        status: 'created',
        createdAt: expect.any(Date),
      });
    });

    it('should create order with CREATED status', async () => {
      const orderId = 'order-789';

      const response = await useCase.execute({ id: orderId });

      expect(response.status).toBe('created');
    });

    it('should create independent orders', async () => {
      await useCase.execute({ id: 'order-1' });
      await useCase.execute({ id: 'order-2' });

      expect(mockRepository.save).toHaveBeenCalledTimes(2);
      const firstCall = mockRepository.save.mock.calls[0]![0]!;
      const secondCall = mockRepository.save.mock.calls[1]![0]!;

      expect(firstCall.getId().getValue()).toBe('order-1');
      expect(secondCall.getId().getValue()).toBe('order-2');
    });

    it('should publish event with correct order id', async () => {
      const orderId = 'order-special';

      await useCase.execute({ id: orderId });

      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'order.created',
        expect.objectContaining({
          orderId,
        }),
      );
    });

    it('should handle multiple order creations', async () => {
      const orderIds = ['order-1', 'order-2', 'order-3'];

      for (const id of orderIds) {
        await useCase.execute({ id });
      }

      expect(mockRepository.save).toHaveBeenCalledTimes(3);
      expect(mockEventPublisher.publish).toHaveBeenCalledTimes(3);
    });

    it('should throw error when repository save fails', async () => {
      mockRepository.save.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(useCase.execute({ id: 'order-123' })).rejects.toThrow(
        'Database error',
      );
    });

    it('should throw error when event publisher fails', async () => {
      mockEventPublisher.publish.mockRejectedValueOnce(
        new Error('RabbitMQ error'),
      );

      await expect(useCase.execute({ id: 'order-123' })).rejects.toThrow(
        'RabbitMQ error',
      );
    });
  });

  describe('logging', () => {
    it('should log info when use case starts', async () => {
      await useCase.execute({ id: 'order-123' });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'CreateOrderUseCase started',
        { orderId: 'order-123' },
      );
    });

    it('should log info when use case completes successfully', async () => {
      await useCase.execute({ id: 'order-456' });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'CreateOrderUseCase completed successfully',
        { orderId: 'order-456' },
      );
    });

    it('should log debug for each step', async () => {
      await useCase.execute({ id: 'order-789' });

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Creating order from factory',
        { orderId: 'order-789' },
      );

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Saving order to repository',
        { orderId: 'order-789' },
      );

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Publishing OrderCreatedEvent',
        { orderId: 'order-789' },
      );
    });

    it('should log error when use case fails', async () => {
      mockRepository.save.mockRejectedValueOnce(new Error('DB error'));

      try {
        await useCase.execute({ id: 'order-error' });
      } catch {
        // Expected
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        'CreateOrderUseCase failed',
        expect.any(Error),
        { orderId: 'order-error' },
      );
    });

    it('should log successful save to repository', async () => {
      await useCase.execute({ id: 'order-123' });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Order saved successfully',
        { orderId: 'order-123' },
      );
    });

    it('should log successful event publication', async () => {
      await useCase.execute({ id: 'order-123' });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Event published successfully',
        { orderId: 'order-123' },
      );
    });
  });
});
