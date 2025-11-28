export enum OrderStatus {
  CREATED = 'created',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered'
}

export class Order {
  public readonly id: string;
  public readonly createdAt: Date;
  public status: OrderStatus;
  public updatedAt: Date;

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

  updateStatus(newStatus: OrderStatus) {
    if (this.status === newStatus) return;
    this.status = newStatus;
    this.updatedAt = new Date();
  }
}
