import { connect, Mongoose } from 'mongoose';
import { OrderFactory } from '../../../domain/factories/order-factory';
import { MongodbOrderRepository } from './mongodb-order-repository';
import { OrderDocument, orderSchema } from './order.schema';
import { Model } from 'mongoose';

/**
 * Real MongoDB Integration Tests for OrderRepository
 *
 * These tests connect to a real MongoDB instance and test actual CRUD operations.
 * Requires: docker-compose up -d
 *
 * To run: npm test -- mongodb-order-repository.real.integration.spec.ts
 */
describe('MongodbOrderRepository - Real Integration Tests', () => {
  let mongoConnection: Mongoose | null = null;
  let orderModel: Model<OrderDocument> | null = null;
  let repository: MongodbOrderRepository | null = null;
  let isMongoAvailable = false;

  const mockLogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:admin@localhost:27017/order-service-test?authSource=admin';

    try {
      mongoConnection = await connect(mongoUri, {
        connectTimeoutMS: 10000,
        socketTimeoutMS: 10000,
        serverSelectionTimeoutMS: 10000,
      });

      orderModel = mongoConnection.model<OrderDocument>('Order', orderSchema, 'orders_integration_real');
      repository = new MongodbOrderRepository(orderModel, mockLogger);
      isMongoAvailable = true;
    } catch {
      console.log('⚠️  MongoDB not available - skipping integration tests');
      console.log('Start MongoDB with: docker-compose up -d');
      isMongoAvailable = false;
    }
  }, 20000);

  afterAll(async () => {
    if (mongoConnection) {
      try {
        await orderModel!.deleteMany({});
        await mongoConnection.disconnect();
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  beforeEach(async () => {
    if (!isMongoAvailable) {
      pending('MongoDB is not available');
    }
    if (orderModel) {
      try {
        await orderModel.deleteMany({});
        jest.clearAllMocks();
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  describe('Save Operations', () => {
    it('should save an order and retrieve it from database', async () => {
      const order = OrderFactory.create('integration-order-1');
      const savedOrder = await repository!.save(order);

      expect(savedOrder).toBeDefined();
      expect(savedOrder.getId().getValue()).toBe('integration-order-1');

      const foundInDb = await orderModel!.findOne({ id: 'integration-order-1' });
      expect(foundInDb).toBeDefined();
      expect(foundInDb?.status).toBe('created');
    });

    it('should update existing order when saving with same id', async () => {
      const order1 = OrderFactory.create('upsert-test');
      await repository!.save(order1);

      const order2 = OrderFactory.createWithStatus('upsert-test', 'processing');
      await repository!.save(order2);

      const found = await orderModel!.findOne({ id: 'upsert-test' });
      expect(found?.status).toBe('processing');

      const docCount = await orderModel!.countDocuments({ id: 'upsert-test' });
      expect(docCount).toBe(1);
    });

    it('should save multiple orders without conflicts', async () => {
      const orders = Array.from({ length: 5 }, (_, i) => OrderFactory.create(`batch-${i}`));

      for (const order of orders) {
        await repository!.save(order);
      }

      const count = await orderModel!.countDocuments({});
      expect(count).toBe(5);
    });
  });

  describe('Find Operations', () => {
    it('should find saved order by id', async () => {
      const order = OrderFactory.create('find-test-1');
      await repository!.save(order);

      const found = await repository!.findById('find-test-1');

      expect(found).not.toBeNull();
      expect(found?.getId().getValue()).toBe('find-test-1');
      expect(found?.getStatus().toString()).toBe('created');
    });

    it('should return null for non-existent order', async () => {
      const found = await repository!.findById('non-existent-id-12345');
      expect(found).toBeNull();
    });

    it('should retrieve order with correct status values', async () => {
      const statuses = ['created', 'processing', 'shipped', 'delivered'];

      for (const status of statuses) {
        const order = OrderFactory.createWithStatus(`status-${status}`, status);
        await repository!.save(order);
      }

      for (const status of statuses) {
        const found = await repository!.findById(`status-${status}`);
        expect(found?.getStatus().toString()).toBe(status);
      }
    });
  });

  describe('Update Operations', () => {
    it('should update order status in database', async () => {
      const order = OrderFactory.create('update-test-1');
      await repository!.save(order);

      const updatedOrder = OrderFactory.createWithStatus('update-test-1', 'processing');
      await repository!.update(updatedOrder);

      const found = await orderModel!.findOne({ id: 'update-test-1' });
      expect(found?.status).toBe('processing');
    });

    it('should handle status progression correctly', async () => {
      const orderId = 'progression-test';
      let order = OrderFactory.create(orderId);
      await repository!.save(order);

      order = OrderFactory.createWithStatus(orderId, 'processing');
      await repository!.update(order);
      let found = await repository!.findById(orderId);
      expect(found?.getStatus().toString()).toBe('processing');

      order = OrderFactory.createWithStatus(orderId, 'shipped');
      await repository!.update(order);
      found = await repository!.findById(orderId);
      expect(found?.getStatus().toString()).toBe('shipped');

      order = OrderFactory.createWithStatus(orderId, 'delivered');
      await repository!.update(order);
      found = await repository!.findById(orderId);
      expect(found?.getStatus().toString()).toBe('delivered');
    });
  });

  describe('Data Integrity', () => {
    it('should maintain referential integrity across operations', async () => {
      const orderId = 'integrity-test';
      const order = OrderFactory.create(orderId);

      const saved = await repository!.save(order);
      const found = await repository!.findById(orderId);
      const updated = OrderFactory.createWithStatus(orderId, 'processing');
      await repository!.update(updated);
      const finalFound = await repository!.findById(orderId);

      expect(saved.getId().getValue()).toBe(found?.getId().getValue());
      expect(found?.getId().getValue()).toBe(finalFound?.getId().getValue());
    });

    it('should ensure id uniqueness constraint', async () => {
      const orderId = 'unique-test';
      const order1 = OrderFactory.create(orderId);
      const order2 = OrderFactory.create(orderId);

      await repository!.save(order1);
      await repository!.save(order2);

      const count = await orderModel!.countDocuments({ id: orderId });
      expect(count).toBe(1);
    });
  });

  describe('Performance', () => {
    it('should handle bulk save operations efficiently', async () => {
      const bulkOrders = Array.from({ length: 10 }, (_, i) =>
        OrderFactory.create(`bulk-${i}`),
      );

      await Promise.all(bulkOrders.map((order) => repository!.save(order)));

      const count = await orderModel!.countDocuments();
      expect(count).toBe(10);
    });
  });
});
