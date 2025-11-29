import mongoose, { Model } from 'mongoose';

import { IEventPublisher } from '../../application/services/event-publisher.interface';
import { ILogger } from '../../application/services/logger.interface';
import { IOrderRepository } from '../../application/services/order-repository.interface';
import { CreateOrderUseCase } from '../../application/use-cases/create-order.use-case';
import { GetOrderStatusUseCase } from '../../application/use-cases/get-order-status.use-case';
import { UpdateOrderStatusUseCase } from '../../application/use-cases/update-order-status.use-case';

import { ConsoleLogger } from '../logging/console-logger';

import { RabbitMQMessagePublisherAdapter } from '../messaging/publisher.adapter';

import { MongodbOrderRepository } from '../persistence/mongodb/mongodb-order-repository';
import { OrderDocument, orderSchema } from '../persistence/mongodb/order.schema';

export class AppContainer {
  private static instance: AppContainer;

  private logger: ILogger | null = null;
  private eventPublisher: IEventPublisher | null = null;
  private orderRepository: IOrderRepository | null = null;
  private orderModel: Model<OrderDocument> | null = null;

  private constructor() {}

  static getInstance(): AppContainer {
    if (!AppContainer.instance) {
      AppContainer.instance = new AppContainer();
    }
    return AppContainer.instance;
  }

  async initialize(): Promise<void> {
    this.initializeLogger();
    this.initializeOrderModel();
    this.initializeEventPublisher();
    this.initializeOrderRepository();

    this.logger?.info('Dependency Injection Container initialized successfully');
  }

  private initializeLogger(): void {
    if (!this.logger) {
      this.logger = new ConsoleLogger();
    }
  }

  private initializeOrderModel(): void {
    if (!this.orderModel) {
      try {
        this.orderModel = mongoose.model<OrderDocument>('Order', orderSchema, 'orders');
      } catch {
        this.orderModel = mongoose.model<OrderDocument>('Order');
      }
    }
  }

  private initializeEventPublisher(): void {
    if (!this.eventPublisher) {
      this.eventPublisher = new RabbitMQMessagePublisherAdapter();
    }
  }

  private initializeOrderRepository(): void {
    if (!this.orderRepository) {
      if (!this.logger) {
        throw new Error('Logger must be initialized before OrderRepository');
      }
      if (!this.orderModel) {
        throw new Error('OrderModel must be initialized before OrderRepository');
      }
      this.orderRepository = new MongodbOrderRepository(this.orderModel, this.logger);
    }
  }

  getLogger(): ILogger {
    if (!this.logger) {
      this.initializeLogger();
    }
    return this.logger!;
  }

  getEventPublisher(): IEventPublisher {
    if (!this.eventPublisher) {
      this.initializeEventPublisher();
    }
    return this.eventPublisher!;
  }

  getOrderRepository(): IOrderRepository {
    if (!this.orderRepository) {
      this.initializeOrderRepository();
    }
    return this.orderRepository!;
  }

  getCreateOrderUseCase(): CreateOrderUseCase {
    return new CreateOrderUseCase(
      this.getOrderRepository(),
      this.getEventPublisher(),
      this.getLogger(),
    );
  }

  getGetOrderStatusUseCase(): GetOrderStatusUseCase {
    return new GetOrderStatusUseCase(
      this.getOrderRepository(),
      this.getLogger(),
    );
  }

  getUpdateOrderStatusUseCase(): UpdateOrderStatusUseCase {
    return new UpdateOrderStatusUseCase(
      this.getOrderRepository(),
      this.getEventPublisher(),
      this.getLogger(),
    );
  }

  async cleanup(): Promise<void> {
    this.logger?.info('Cleaning up Dependency Injection Container');
    this.logger = null;
    this.eventPublisher = null;
    this.orderRepository = null;
    this.orderModel = null;
  }
}

export const container = AppContainer.getInstance();
