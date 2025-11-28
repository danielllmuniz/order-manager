import {
  GetOrderStatusRequest,
  GetOrderStatusResponse,
} from '../dtos/get-order-status.dto';
import { IOrderRepository } from '../repositories/order-repository.interface';

export class OrderNotFoundError extends Error {
  constructor(orderId: string) {
    super(`Order not found: ${orderId}`);
    this.name = 'OrderNotFoundError';
  }
}

export class GetOrderStatusUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(request: GetOrderStatusRequest): Promise<GetOrderStatusResponse> {
    const order = await this.orderRepository.findById(request.id);

    if (!order) {
      throw new OrderNotFoundError(request.id);
    }

    return {
      id: order.getId().getValue(),
      status: order.getStatus().toString(),
      createdAt: order.getCreatedAt(),
      updatedAt: order.getUpdatedAt(),
      canAdvance: order.canAdvance(),
    };
  }
}
