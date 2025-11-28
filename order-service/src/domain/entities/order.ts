import { OrderId } from '../value-objects/order-id';
import { OrderStatus, OrderStatusEnum } from '../value-objects/order-status';

export class CannotAdvanceOrderStatusError extends Error {
  constructor(currentStatus: OrderStatusEnum) {
    super(`Cannot advance from ${currentStatus}. Order is already ${currentStatus}`);
    this.name = 'CannotAdvanceOrderStatusError';
  }
}

export class Order {
  private readonly id: OrderId;
  private readonly createdAt: Date;
  private status: OrderStatus;
  private updatedAt: Date;

  private static readonly NEXT_STATUS: Record<OrderStatusEnum, OrderStatusEnum | null> = {
    [OrderStatusEnum.CREATED]: OrderStatusEnum.PROCESSING,
    [OrderStatusEnum.PROCESSING]: OrderStatusEnum.SHIPPED,
    [OrderStatusEnum.SHIPPED]: OrderStatusEnum.DELIVERED,
    [OrderStatusEnum.DELIVERED]: null,
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

  private getNextStatus(): OrderStatusEnum {
    const currentStatusValue = this.status.getValue();
    const nextStatusValue = Order.NEXT_STATUS[currentStatusValue];

    if (nextStatusValue === null) {
      throw new CannotAdvanceOrderStatusError(currentStatusValue);
    }

    return nextStatusValue;
  }

  advance(): void {
    const nextStatusValue = this.getNextStatus();
    this.status = OrderStatus.create(nextStatusValue);
    this.updatedAt = new Date();
  }

  canAdvance(): boolean {
    try {
      this.getNextStatus();
      return true;
    } catch {
      return false;
    }
  }
}
