import { Order } from '../entities/order';
import { OrderId } from '../value-objects/order-id';
import { OrderStatus, OrderStatusEnum } from '../value-objects/order-status';

export class OrderFactory {
  static create(id: string): Order {
    const orderId = OrderId.create(id);
    return new Order(orderId, OrderStatus.created());
  }

  static reconstruct(
    id: string,
    status: OrderStatusEnum,
    createdAt: Date,
  ): Order {
    const orderId = OrderId.create(id);
    const orderStatus = OrderStatus.create(status);
    return new Order(orderId, orderStatus, createdAt);
  }

  static createWithStatus(id: string, status: OrderStatusEnum | string): Order {
    const orderId = OrderId.create(id);
    const orderStatus = OrderStatus.create(status);
    return new Order(orderId, orderStatus);
  }
}
