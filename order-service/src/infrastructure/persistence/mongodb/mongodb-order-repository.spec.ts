import { Model } from 'mongoose';
import { OrderFactory } from '../../../domain/factories/order-factory';
import { ILogger } from '../../../application/services/logger.interface';
import { MongodbOrderRepository } from './mongodb-order-repository';
import { OrderDocument } from './order.schema';

describe('MongodbOrderRepository', () => {
  let repository: MongodbOrderRepository;
  let mockOrderModel: jest.Mocked<Model<OrderDocument>>;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    mockOrderModel = {
      updateOne: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Model<OrderDocument>>;

    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    repository = new MongodbOrderRepository(mockOrderModel, mockLogger);
  });

  describe('save', () => {
    it('should save an order to MongoDB', async () => {
      const order = OrderFactory.createWithStatus('order-123', 'created');
      (mockOrderModel.updateOne as jest.Mock).mockResolvedValueOnce({
        modifiedCount: 1,
        upsertedCount: 1,
      });

      const result = await repository.save(order);

      expect(result).toEqual(order);
      expect(mockOrderModel.updateOne).toHaveBeenCalledWith(
        { id: 'order-123' },
        expect.objectContaining({
          id: 'order-123',
          status: 'created',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
        { upsert: true },
      );
    });

    it('should return the saved order', async () => {
      const order = OrderFactory.createWithStatus('order-456', 'created');
      (mockOrderModel.updateOne as jest.Mock).mockResolvedValueOnce({});

      const result = await repository.save(order);

      expect(result.getId()).toBe('order-456');
      expect(result.getStatus().toString()).toBe('created');
    });

    it('should log debug when saving order', async () => {
      const order = OrderFactory.createWithStatus('order-789', 'created');
      (mockOrderModel.updateOne as jest.Mock).mockResolvedValueOnce({});

      await repository.save(order);

      expect(mockLogger.debug).toHaveBeenCalledWith('Saving order to MongoDB', {
        orderId: 'order-789',
      });
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Order saved successfully to MongoDB',
        { orderId: 'order-789' },
      );
    });

    it('should handle MongoDB errors', async () => {
      const order = OrderFactory.createWithStatus('order-error', 'created');
      const error = new Error('Database error');
      (mockOrderModel.updateOne as jest.Mock).mockRejectedValueOnce(error);

      await expect(repository.save(order)).rejects.toThrow('Database error');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to save order to MongoDB',
        error,
        { orderId: 'order-error' },
      );
    });

    it('should handle multiple saves', async () => {
      const order1 = OrderFactory.createWithStatus('order-1', 'created');
      const order2 = OrderFactory.createWithStatus('order-2', 'created');
      (mockOrderModel.updateOne as jest.Mock).mockResolvedValue({});

      await repository.save(order1);
      await repository.save(order2);

      expect(mockOrderModel.updateOne).toHaveBeenCalledTimes(2);
    });
  });

  describe('findById', () => {
    it('should find an order by id', async () => {
      const doc: OrderDocument = {
        _id: 'mongo-id',
        id: 'order-123',
        status: 'created',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as OrderDocument;

      (mockOrderModel.findOne as jest.Mock).mockResolvedValueOnce(doc);

      const result = await repository.findById('order-123');

      expect(result).not.toBeNull();
      expect(result?.getId()).toBe('order-123');
      expect(mockOrderModel.findOne).toHaveBeenCalledWith({ id: 'order-123' });
    });

    it('should return null when order is not found', async () => {
      (mockOrderModel.findOne as jest.Mock).mockResolvedValueOnce(null);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Order not found in MongoDB',
        { orderId: 'non-existent' },
      );
    });

    it('should log when finding order', async () => {
      const doc: OrderDocument = {
        _id: 'mongo-id',
        id: 'order-456',
        status: 'processing',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as OrderDocument;

      (mockOrderModel.findOne as jest.Mock).mockResolvedValueOnce(doc);

      await repository.findById('order-456');

      expect(mockLogger.debug).toHaveBeenCalledWith('Finding order from MongoDB', {
        orderId: 'order-456',
      });
      expect(mockLogger.debug).toHaveBeenCalledWith('Order found in MongoDB', {
        orderId: 'order-456',
        status: 'processing',
      });
    });

    it('should reconstruct order with correct status', async () => {
      const doc: OrderDocument = {
        _id: 'mongo-id',
        id: 'order-shipped',
        status: 'shipped',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02'),
      } as unknown as OrderDocument;

      (mockOrderModel.findOne as jest.Mock).mockResolvedValueOnce(doc);

      const result = await repository.findById('order-shipped');

      expect(result?.getStatus().toString()).toBe('shipped');
    });

    it('should handle MongoDB errors during find', async () => {
      const error = new Error('Database connection error');
      (mockOrderModel.findOne as jest.Mock).mockRejectedValueOnce(error);

      await expect(repository.findById('order-123')).rejects.toThrow(
        'Database connection error',
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to find order in MongoDB',
        error,
        { orderId: 'order-123' },
      );
    });

    it('should retrieve multiple different orders', async () => {
      const doc1: OrderDocument = {
        _id: 'mongo-1',
        id: 'order-1',
        status: 'created',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as OrderDocument;

      const doc2: OrderDocument = {
        _id: 'mongo-2',
        id: 'order-2',
        status: 'delivered',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as OrderDocument;

      (mockOrderModel.findOne as jest.Mock)
        .mockResolvedValueOnce(doc1)
        .mockResolvedValueOnce(doc2);

      const result1 = await repository.findById('order-1');
      const result2 = await repository.findById('order-2');

      expect(result1?.getId()).toBe('order-1');
      expect(result2?.getId()).toBe('order-2');
    });
  });

  describe('update', () => {
    it('should update an order in MongoDB', async () => {
      const order = OrderFactory.createWithStatus('order-123', 'processing');
      (mockOrderModel.updateOne as jest.Mock).mockResolvedValueOnce({
        matchedCount: 1,
        modifiedCount: 1,
      });

      const result = await repository.update(order);

      expect(result).toEqual(order);
      expect(mockOrderModel.updateOne).toHaveBeenCalledWith(
        { id: 'order-123' },
        expect.objectContaining({
          id: 'order-123',
          status: 'processing',
        }),
      );
    });

    it('should return the updated order', async () => {
      const order = OrderFactory.createWithStatus('order-789', 'shipped');
      (mockOrderModel.updateOne as jest.Mock).mockResolvedValueOnce({
        matchedCount: 1,
      });

      const result = await repository.update(order);

      expect(result.getId()).toBe('order-789');
      expect(result.getStatus().toString()).toBe('shipped');
    });

    it('should log debug when updating order', async () => {
      const order = OrderFactory.createWithStatus('order-456', 'delivered');
      (mockOrderModel.updateOne as jest.Mock).mockResolvedValueOnce({
        matchedCount: 1,
      });

      await repository.update(order);

      expect(mockLogger.debug).toHaveBeenCalledWith('Updating order in MongoDB', {
        orderId: 'order-456',
      });
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Order updated successfully in MongoDB',
        { orderId: 'order-456' },
      );
    });

    it('should log warning when order not found for update', async () => {
      const order = OrderFactory.createWithStatus('order-not-found', 'created');
      (mockOrderModel.updateOne as jest.Mock).mockResolvedValueOnce({
        matchedCount: 0,
      });

      await repository.update(order);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Order not found for update in MongoDB',
        { orderId: 'order-not-found' },
      );
    });

    it('should handle MongoDB errors during update', async () => {
      const order = OrderFactory.createWithStatus('order-error', 'created');
      const error = new Error('Update failed');
      (mockOrderModel.updateOne as jest.Mock).mockRejectedValueOnce(error);

      await expect(repository.update(order)).rejects.toThrow('Update failed');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to update order in MongoDB',
        error,
        { orderId: 'order-error' },
      );
    });

    it('should update multiple orders', async () => {
      const order1 = OrderFactory.createWithStatus('order-1', 'processing');
      const order2 = OrderFactory.createWithStatus('order-2', 'shipped');
      (mockOrderModel.updateOne as jest.Mock).mockResolvedValue({
        matchedCount: 1,
      });

      await repository.update(order1);
      await repository.update(order2);

      expect(mockOrderModel.updateOne).toHaveBeenCalledTimes(2);
    });
  });
});
