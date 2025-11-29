import { randomUUID } from 'crypto';
import { Order } from '../entities/order';
import { OrderStatus, OrderStatusEnum } from '../value-objects/order-status';

export class OrderFactory {
  static create(): Order {
    const id = randomUUID();
    return new Order(id, OrderStatus.created());
  }

  static reconstruct(
    id: string,
    status: OrderStatusEnum,
    createdAt: Date,
  ): Order {
    const orderStatus = OrderStatus.create(status);
    return new Order(id, orderStatus, createdAt);
  }

  static createWithStatus(id: string, status: OrderStatusEnum | string): Order {
    const orderStatus = OrderStatus.create(status);
    return new Order(id, orderStatus);
  }
}
