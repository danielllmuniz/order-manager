import { OrderId } from '../value-objects/order-id';
import { OrderStatus, OrderStatusEnum } from '../value-objects/order-status';

export class InvalidOrderStatusTransitionError extends Error {
  constructor(currentStatus: OrderStatusEnum, newStatus: OrderStatusEnum) {
    super(`Cannot transition from ${currentStatus} to ${newStatus}`);
    this.name = 'InvalidOrderStatusTransitionError';
  }
}

export class Order {
  private readonly id: OrderId;
  private readonly createdAt: Date;
  private status: OrderStatus;
  private updatedAt: Date;

  private static readonly VALID_TRANSITIONS: Record<OrderStatusEnum, OrderStatusEnum[]> = {
    [OrderStatusEnum.CREATED]: [OrderStatusEnum.PROCESSING],
    [OrderStatusEnum.PROCESSING]: [OrderStatusEnum.SHIPPED],
    [OrderStatusEnum.SHIPPED]: [OrderStatusEnum.DELIVERED],
    [OrderStatusEnum.DELIVERED]: [],
  };

  constructor(
    id: OrderId,
    status?: OrderStatus,
    createdAt?: Date,
  ) {
    this.id = id;
    this.status = status ?? OrderStatus.created();
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = new Date();
  }

  getId(): OrderId {
    return this.id;
  }

  getStatus(): OrderStatus {
    return this.status;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  updateStatus(newStatus: OrderStatus): void {
    if (this.status.equals(newStatus)) return;

    const currentStatusValue = this.status.getValue();
    const newStatusValue = newStatus.getValue();
    const validTransitions = Order.VALID_TRANSITIONS[currentStatusValue];

    if (!validTransitions.includes(newStatusValue)) {
      throw new InvalidOrderStatusTransitionError(currentStatusValue, newStatusValue);
    }

    this.status = newStatus;
    this.updatedAt = new Date();
  }
}
