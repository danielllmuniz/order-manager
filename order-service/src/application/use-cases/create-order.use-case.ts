import { OrderCreatedEvent } from '../../domain/events/order-created-event';
import { OrderFactory } from '../../domain/factories/order-factory';
import {
  CreateOrderResponse,
} from '../dtos/create-order.dto';
import { IEventPublisher } from '../services/event-publisher.interface';
import { ILogger } from '../services/logger.interface';
import { IOrderRepository } from '../services/order-repository.interface';

export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly eventPublisher: IEventPublisher,
    private readonly logger: ILogger,
  ) {}

  async execute(): Promise<CreateOrderResponse> {
    try {
      this.logger.debug('Creating order from factory');
      const order = OrderFactory.create();
      const orderId = order.getId().getValue();

      this.logger.debug('Order created successfully', {
        orderId,
        status: order.getStatus().toString(),
      });

      this.logger.debug('Saving order to repository', { orderId });
      await this.orderRepository.save(order);
      this.logger.info('Order saved successfully', { orderId });

      this.logger.debug('Publishing OrderCreatedEvent', { orderId });
      const event = new OrderCreatedEvent(orderId);
      await this.eventPublisher.publish('order.created', event);
      this.logger.info('Event published successfully', { orderId });

      const response = {
        id: orderId,
        status: order.getStatus().toString(),
        createdAt: order.getCreatedAt(),
      };

      this.logger.info('CreateOrderUseCase completed successfully', {
        orderId,
      });

      return response;
    } catch (error) {
      this.logger.error('CreateOrderUseCase failed', error);
      throw error;
    }
  }
}
