import { OrderStatusChangedEvent } from '../../domain/events/order-status-changed-event';
import {
  UpdateOrderStatusRequest,
  UpdateOrderStatusResponse,
} from '../dtos/update-order-status.dto';
import { IEventPublisher } from '../services/event-publisher.interface';
import { ILogger } from '../services/logger.interface';
import { IOrderRepository } from '../services/order-repository.interface';

export class UpdateOrderStatusUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly eventPublisher: IEventPublisher,
    private readonly logger: ILogger,
  ) {}

  async execute(
    request: UpdateOrderStatusRequest,
  ): Promise<UpdateOrderStatusResponse> {
    this.logger.info('UpdateOrderStatusUseCase started', { orderId: request.id });

    try {
      this.logger.debug('Fetching order from repository', { orderId: request.id });
      const order = await this.orderRepository.findById(request.id);

      if (!order) {
        this.logger.warn('Order not found', { orderId: request.id });
        throw new Error(`Order not found: ${request.id}`);
      }

      const previousStatus = order.getStatus().getValue();
      this.logger.debug('Order found', {
        orderId: request.id,
        currentStatus: previousStatus,
      });

      this.logger.debug('Advancing order status', { orderId: request.id });
      order.advance();
      const newStatus = order.getStatus().getValue();
      this.logger.debug('Order status advanced', {
        orderId: request.id,
        previousStatus,
        newStatus,
      });

      this.logger.debug('Updating order in repository', { orderId: request.id });
      await this.orderRepository.update(order);
      this.logger.info('Order updated successfully', {
        orderId: request.id,
        newStatus,
      });

      this.logger.debug('Publishing OrderStatusChangedEvent', {
        orderId: request.id,
        previousStatus,
        newStatus,
        eventName: 'order.status.changed',
      });
      const event = new OrderStatusChangedEvent(
        order.getId(),
        previousStatus,
        newStatus,
      );
      await this.eventPublisher.publish('order.status.changed', event);
      this.logger.info('Event published successfully', {
        orderId: request.id,
        eventName: 'order.status.changed',
      });

      const response = {
        id: order.getId(),
        previousStatus,
        newStatus,
        updatedAt: order.getUpdatedAt(),
      };

      this.logger.info('UpdateOrderStatusUseCase completed successfully', {
        orderId: request.id,
      });

      return response;
    } catch (error) {
      this.logger.error('UpdateOrderStatusUseCase failed', error, {
        orderId: request.id,
      });
      throw error;
    }
  }
}
