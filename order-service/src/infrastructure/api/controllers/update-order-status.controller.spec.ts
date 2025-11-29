import { Request, Response } from 'express';
import { UpdateOrderStatusController } from './update-order-status.controller';
import { CannotAdvanceOrderStatusError } from '../../../domain/entities/order';
import { OrderStatusEnum } from '../../../domain/value-objects/order-status';
import { container } from '../../../infrastructure/container';

jest.mock('../../../infrastructure/container', () => ({
  container: {
    getUpdateOrderStatusUseCase: jest.fn(),
  },
}));

describe('UpdateOrderStatusController', () => {
  let controller: UpdateOrderStatusController;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  let mockUseCase: any;

  beforeEach(() => {
    controller = new UpdateOrderStatusController();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      params: {},
    };

    mockUseCase = {
      execute: jest.fn(),
    };

    (container.getUpdateOrderStatusUseCase as jest.Mock).mockReturnValue(mockUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle', () => {
    it('should return 400 when order ID is missing', async () => {
      mockRequest.params = {};

      await controller.handle(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Order ID is required',
      });
      expect(mockUseCase.execute).not.toHaveBeenCalled();
    });

    it('should update order status successfully with 200 status', async () => {
      const orderId = '550e8400-e29b-41d4-a716-446655440000';
      mockRequest.params = { id: orderId };

      const mockOrderData = {
        id: orderId,
        status: 'PROCESSING',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      mockUseCase.execute.mockResolvedValue(mockOrderData);

      await controller.handle(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrderData,
      });
      expect(mockUseCase.execute).toHaveBeenCalledWith({ id: orderId });
    });

    it('should return 400 when cannot advance order status', async () => {
      const orderId = '550e8400-e29b-41d4-a716-446655440000';
      mockRequest.params = { id: orderId };

      const error = new CannotAdvanceOrderStatusError(OrderStatusEnum.DELIVERED);
      mockUseCase.execute.mockRejectedValue(error);

      await controller.handle(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: error.message,
      });
    });

    it('should return 404 when order is not found', async () => {
      const orderId = '550e8400-e29b-41d4-a716-446655440000';
      mockRequest.params = { id: orderId };

      const notFoundError = new Error('Order not found');
      notFoundError.name = 'OrderNotFoundError';
      mockUseCase.execute.mockRejectedValue(notFoundError);

      await controller.handle(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Order not found',
      });
    });

    it('should return 500 for generic errors', async () => {
      const orderId = '550e8400-e29b-41d4-a716-446655440000';
      mockRequest.params = { id: orderId };

      const error = new Error('Database error');
      mockUseCase.execute.mockRejectedValue(error);

      await controller.handle(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error',
      });
    });

    it('should get use case from container', async () => {
      mockRequest.params = { id: '550e8400-e29b-41d4-a716-446655440000' };
      mockUseCase.execute.mockResolvedValue({
        id: 'test',
        status: 'PROCESSING',
      });

      await controller.handle(mockRequest as Request, mockResponse as Response);

      expect(container.getUpdateOrderStatusUseCase).toHaveBeenCalled();
    });

    it('should handle error instances other than CannotAdvanceOrderStatusError', async () => {
      mockRequest.params = { id: '550e8400-e29b-41d4-a716-446655440000' };
      const error = new TypeError('Type mismatch');
      mockUseCase.execute.mockRejectedValue(error);

      await controller.handle(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });
});
