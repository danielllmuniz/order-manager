import { IEventPublisher } from '../../../application/services/event-publisher.interface';
import { ILogger } from '../../../application/services/logger.interface';
import { DomainEvent } from '../../../domain/events/domain-event';

interface IMessageBroker {
  publish(eventType: string, message: Record<string, unknown>): Promise<void>;
}

export class RabbitmqEventPublisher implements IEventPublisher {
  constructor(
    private readonly messageBroker: IMessageBroker,
    private readonly logger: ILogger,
  ) {}

  async publish(eventName: string, event: DomainEvent): Promise<void> {
    try {
      this.logger.debug(`Publishing event: ${eventName}`, {
        eventType: event.constructor.name,
      });

      const eventPayload = {
        ...event,
        eventName,
      };

      await this.messageBroker.publish(event.constructor.name, eventPayload);

      this.logger.info(`Event published successfully: ${eventName}`);
    } catch (error) {
      this.logger.error(`Failed to publish event ${eventName}:`, error);
      throw error;
    }
  }
}
