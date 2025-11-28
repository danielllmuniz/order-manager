export class InvalidOrderIdError extends Error {
  constructor(id: string) {
    super(`Invalid order id: ${id}`);
    this.name = 'InvalidOrderIdError';
  }
}

export class OrderId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(id: string): OrderId {
    if (!id || id.trim() === '') {
      throw new InvalidOrderIdError(id ?? 'undefined');
    }
    return new OrderId(id.trim());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: OrderId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
