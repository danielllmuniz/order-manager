import { OrderStatusChangedEvent } from '../../domain/events/order-status-changed-event';
import {
  UpdateOrderStatusRequest,
  UpdateOrderStatusResponse,
} from '../dtos/update-order-status.dto';
import { IOrderRepository } from '../repositories/order-repository.interface';
import { IEventPublisher } from '../services/event-publisher.interface';

export class UpdateOrderStatusUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly eventPublisher: IEventPublisher,
  ) {}

  async execute(
    request: UpdateOrderStatusRequest,
  ): Promise<UpdateOrderStatusResponse> {
    const order = await this.orderRepository.findById(request.id);

    if (!order) {
      throw new Error(`Order not found: ${request.id}`);
    }

    const previousStatus = order.getStatus().getValue();

    order.advance();

    const newStatus = order.getStatus().getValue();

    await this.orderRepository.update(order);

    const event = new OrderStatusChangedEvent(
      order.getId().getValue(),
      previousStatus,
      newStatus,
    );
    await this.eventPublisher.publish('order.status-changed', event);

    return {
      id: order.getId().getValue(),
      previousStatus,
      newStatus,
      updatedAt: order.getUpdatedAt(),
    };
  }
}
