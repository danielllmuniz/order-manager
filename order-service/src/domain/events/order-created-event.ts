import { DomainEvent } from './domain-event';

export class OrderCreatedEvent implements DomainEvent {
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    readonly orderId: string,
    occurredAt?: Date,
  ) {
    this.occurredAt = occurredAt ?? new Date();
    this.aggregateId = orderId;
  }
}
