import { DomainEvent } from '../../domain/events/domain-event';

export interface IEventPublisher {
  publish(eventName: string, event: DomainEvent): Promise<void>;
}
