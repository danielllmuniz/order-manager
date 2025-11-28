import { OrderCreatedEvent } from '../../domain/events/order-created-event';
import { OrderFactory } from '../../domain/factories/order-factory';
import {
  CreateOrderRequest,
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

  async execute(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    this.logger.info('CreateOrderUseCase started', { orderId: request.id });

    try {
      this.logger.debug('Creating order from factory', { orderId: request.id });
      const order = OrderFactory.create(request.id);
      this.logger.debug('Order created successfully', {
        orderId: request.id,
        status: order.getStatus().toString(),
      });

      this.logger.debug('Saving order to repository', { orderId: request.id });
      await this.orderRepository.save(order);
      this.logger.info('Order saved successfully', { orderId: request.id });

      this.logger.debug('Publishing OrderCreatedEvent', { orderId: request.id });
      const event = new OrderCreatedEvent(order.getId().getValue());
      await this.eventPublisher.publish('order.created', event);
      this.logger.info('Event published successfully', { orderId: request.id });

      const response = {
        id: order.getId().getValue(),
        status: order.getStatus().toString(),
        createdAt: order.getCreatedAt(),
      };

      this.logger.info('CreateOrderUseCase completed successfully', {
        orderId: request.id,
      });

      return response;
    } catch (error) {
      this.logger.error('CreateOrderUseCase failed', error, {
        orderId: request.id,
      });
      throw error;
    }
  }
}
