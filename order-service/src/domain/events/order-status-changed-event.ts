import { DomainEvent } from './domain-event';
import { OrderStatusEnum } from '../value-objects/order-status';

export class OrderStatusChangedEvent implements DomainEvent {
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    readonly orderId: string,
    readonly previousStatus: OrderStatusEnum,
    readonly newStatus: OrderStatusEnum,
    occurredAt?: Date,
  ) {
    this.occurredAt = occurredAt ?? new Date();
    this.aggregateId = orderId;
  }
}
