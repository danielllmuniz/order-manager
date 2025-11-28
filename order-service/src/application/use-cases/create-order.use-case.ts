import { OrderCreatedEvent } from '../../domain/events/order-created-event';
import { OrderFactory } from '../../domain/factories/order-factory';
import {
  CreateOrderRequest,
  CreateOrderResponse,
} from '../dtos/create-order.dto';
import { IOrderRepository } from '../repositories/order-repository.interface';
import { IEventPublisher } from '../services/event-publisher.interface';

export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly eventPublisher: IEventPublisher,
  ) {}

  async execute(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    const order = OrderFactory.create(request.id);

    await this.orderRepository.save(order);

    const event = new OrderCreatedEvent(order.getId().getValue());
    await this.eventPublisher.publish('order.created', event);

    return {
      id: order.getId().getValue(),
      status: order.getStatus().toString(),
      createdAt: order.getCreatedAt(),
    };
  }
}
