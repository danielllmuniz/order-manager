export interface DomainEvent {
  occurredAt: Date;
  aggregateId: string;
}
