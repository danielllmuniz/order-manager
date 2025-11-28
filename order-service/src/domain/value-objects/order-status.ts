export enum OrderStatusEnum {
  CREATED = 'created',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
}

export class InvalidOrderStatusError extends Error {
  constructor(status: string) {
    super(`Invalid order status: ${status}`);
    this.name = 'InvalidOrderStatusError';
  }
}

export class OrderStatus {
  private readonly value: OrderStatusEnum;

  private constructor(value: OrderStatusEnum) {
    this.value = value;
  }

  static create(value: OrderStatusEnum | string): OrderStatus {
    if (!Object.values(OrderStatusEnum).includes(value as OrderStatusEnum)) {
      throw new InvalidOrderStatusError(value);
    }
    return new OrderStatus(value as OrderStatusEnum);
  }

  static created(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.CREATED);
  }

  static processing(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.PROCESSING);
  }

  static shipped(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.SHIPPED);
  }

  static delivered(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.DELIVERED);
  }

  getValue(): OrderStatusEnum {
    return this.value;
  }

  equals(other: OrderStatus): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
