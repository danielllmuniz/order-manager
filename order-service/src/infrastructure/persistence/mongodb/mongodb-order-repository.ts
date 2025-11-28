import { Model } from 'mongoose';
import { ILogger } from '../../../application/services/logger.interface';
import { Order } from '../../../domain/entities/order';
import { OrderFactory } from '../../../domain/factories/order-factory';
import { IOrderRepository } from '../../../domain/repositories/order-repository';
import { OrderDocument } from './order.schema';

export class MongodbOrderRepository implements IOrderRepository {
  constructor(
    private readonly orderModel: Model<OrderDocument>,
    private readonly logger: ILogger,
  ) {}

  async save(order: Order): Promise<Order> {
    try {
      this.logger.debug('Saving order to MongoDB', {
        orderId: order.getId().getValue(),
      });

      const orderData = {
        id: order.getId().getValue(),
        status: order.getStatus().toString(),
        createdAt: order.getCreatedAt(),
        updatedAt: order.getUpdatedAt(),
      };

      await this.orderModel.updateOne({ id: order.getId().getValue() }, orderData, {
        upsert: true,
      });

      this.logger.debug('Order saved successfully to MongoDB', {
        orderId: order.getId().getValue(),
      });

      return order;
    } catch (error) {
      this.logger.error('Failed to save order to MongoDB', error, {
        orderId: order.getId().getValue(),
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

      // Update timestamps from database
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
      this.logger.debug('Updating order in MongoDB', {
        orderId: order.getId().getValue(),
      });

      const orderData = {
        id: order.getId().getValue(),
        status: order.getStatus().toString(),
        createdAt: order.getCreatedAt(),
        updatedAt: order.getUpdatedAt(),
      };

      const result = await this.orderModel.updateOne(
        { id: order.getId().getValue() },
        orderData,
      );

      if (result.matchedCount === 0) {
        this.logger.warn('Order not found for update in MongoDB', {
          orderId: order.getId().getValue(),
        });
      }

      this.logger.debug('Order updated successfully in MongoDB', {
        orderId: order.getId().getValue(),
      });

      return order;
    } catch (error) {
      this.logger.error('Failed to update order in MongoDB', error, {
        orderId: order.getId().getValue(),
      });
      throw error;
    }
  }
}
