export enum OrderStatus {
  CREATED = 'created',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered'
}

export class InvalidOrderStatusTransitionError extends Error {
  constructor(currentStatus: OrderStatus, newStatus: OrderStatus) {
    super(`Cannot transition from ${currentStatus} to ${newStatus}`);
    this.name = 'InvalidOrderStatusTransitionError';
  }
}

export class Order {
  private readonly id: string;
  private readonly createdAt: Date;
  private status: OrderStatus;
  private updatedAt: Date;

  private static readonly VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.CREATED]: [OrderStatus.PROCESSING],
    [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [],
  };

  constructor(
    id: string,
    status?: OrderStatus,
    createdAt?: Date,
  ) {
    this.id = id;
    this.status = status ?? OrderStatus.CREATED;
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = new Date();
  }

  getId(): string {
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
    if (this.status === newStatus) return;

    const validTransitions = Order.VALID_TRANSITIONS[this.status];

    if (!validTransitions.includes(newStatus)) {
      throw new InvalidOrderStatusTransitionError(this.status, newStatus);
    }

    this.status = newStatus;
    this.updatedAt = new Date();
  }
}
