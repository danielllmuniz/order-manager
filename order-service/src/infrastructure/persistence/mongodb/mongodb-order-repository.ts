import { Model } from 'mongoose';
import { ILogger } from '../../../application/services/logger.interface';
import { IOrderRepository } from '../../../application/services/order-repository.interface';
import { Order } from '../../../domain/entities/order';
import { OrderFactory } from '../../../domain/factories/order-factory';
import { OrderDocument } from './order.schema';

export class MongodbOrderRepository implements IOrderRepository {
  constructor(
    private readonly orderModel: Model<OrderDocument>,
    private readonly logger: ILogger,
  ) {}

  async save(order: Order): Promise<Order> {
    try {
      const orderId = order.getId();
      this.logger.debug('Saving order to MongoDB', {
        orderId,
      });

      const orderData = {
        id: orderId,
        status: order.getStatus().toString(),
        createdAt: order.getCreatedAt(),
        updatedAt: order.getUpdatedAt(),
      };

      await this.orderModel.updateOne({ id: orderId }, orderData, {
        upsert: true,
      });

      this.logger.debug('Order saved successfully to MongoDB', {
        orderId,
      });

      return order;
    } catch (error) {
      const orderId = order.getId();
      this.logger.error('Failed to save order to MongoDB', error, {
        orderId,
      });
      throw error;
    }
  }

  async findById(id: string): Promise<Order | null> {
    try {
      this.logger.debug('Finding order from MongoDB', { orderId: id });

      const doc = await this.orderModel.findOne({ id });

      if (!doc) {
        this.logger.debug('Order not found in MongoDB', { orderId: id });
        return null;
      }

      const order = OrderFactory.createWithStatus(id, doc.status);

      const reconstructed = Object.create(Object.getPrototypeOf(order));
      Object.assign(reconstructed, order);
      reconstructed['createdAt'] = doc.createdAt;
      reconstructed['updatedAt'] = doc.updatedAt;

      this.logger.debug('Order found in MongoDB', {
        orderId: id,
        status: doc.status,
      });

      return reconstructed;
    } catch (error) {
      this.logger.error('Failed to find order in MongoDB', error, { orderId: id });
      throw error;
    }
  }

  async update(order: Order): Promise<Order> {
    try {
      const orderId = order.getId();
      this.logger.debug('Updating order in MongoDB', {
        orderId,
      });

      const orderData = {
        id: orderId,
        status: order.getStatus().toString(),
        createdAt: order.getCreatedAt(),
        updatedAt: order.getUpdatedAt(),
      };

      const result = await this.orderModel.updateOne(
        { id: orderId },
        orderData,
      );

      if (result.matchedCount === 0) {
        this.logger.warn('Order not found for update in MongoDB', {
          orderId,
        });
      }

      this.logger.debug('Order updated successfully in MongoDB', {
        orderId,
      });

      return order;
    } catch (error) {
      const orderId = order.getId();
      this.logger.error('Failed to update order in MongoDB', error, {
        orderId,
      });
      throw error;
    }
  }
}
