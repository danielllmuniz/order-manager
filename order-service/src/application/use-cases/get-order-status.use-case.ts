import {
  GetOrderStatusRequest,
  GetOrderStatusResponse,
} from '../dtos/get-order-status.dto';
import { ILogger } from '../services/logger.interface';
import { IOrderRepository } from '../services/order-repository.interface';

export class OrderNotFoundError extends Error {
  constructor(orderId: string) {
    super(`Order not found: ${orderId}`);
    this.name = 'OrderNotFoundError';
  }
}

export class GetOrderStatusUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(request: GetOrderStatusRequest): Promise<GetOrderStatusResponse> {
    this.logger.info('GetOrderStatusUseCase started', { orderId: request.id });

    try {
      this.logger.debug('Fetching order from repository', { orderId: request.id });
      const order = await this.orderRepository.findById(request.id);

      if (!order) {
        this.logger.warn('Order not found', { orderId: request.id });
        throw new OrderNotFoundError(request.id);
      }

      this.logger.debug('Order fetched successfully', {
        orderId: request.id,
        status: order.getStatus().toString(),
      });

      const response = {
        id: order.getId().getValue(),
        status: order.getStatus().toString(),
        createdAt: order.getCreatedAt(),
        updatedAt: order.getUpdatedAt(),
        canAdvance: order.canAdvance(),
      };

      this.logger.info('GetOrderStatusUseCase completed successfully', {
        orderId: request.id,
      });

      return response;
    } catch (error) {
      this.logger.error('GetOrderStatusUseCase failed', error, {
        orderId: request.id,
      });
      throw error;
    }
  }
}
