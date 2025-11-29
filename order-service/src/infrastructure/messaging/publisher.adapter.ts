import { DomainEvent } from 'domain/events/domain-event';
import { IEventPublisher } from '../../application/services/event-publisher.interface';
import { RabbitMQConnection } from './rabbitmq.connection';

export class RabbitMQMessagePublisherAdapter implements IEventPublisher {
  private readonly EXCHANGE_NAME = 'orders.events';

  async publish(eventName: string, event: DomainEvent): Promise<void> {
    await RabbitMQConnection.publish(
      this.EXCHANGE_NAME,
      eventName,
      event,
    );
  }
}
