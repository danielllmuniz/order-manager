import { NextFunction, Request, Response } from 'express';
import { GetOrderStatusController } from './get-order-status.controller';
import { container } from '../../../infrastructure/container';

jest.mock('../../../infrastructure/container', () => ({
  container: {
    getGetOrderStatusUseCase: jest.fn(),
  },
}));

describe('GetOrderStatusController', () => {
  let controller: GetOrderStatusController;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  let mockNext: jest.Mock;
  let mockUseCase: any;

  beforeEach(() => {
    controller = new GetOrderStatusController();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      params: {},
    };

    mockNext = jest.fn();

    mockUseCase = {
      execute: jest.fn(),
    };

    (container.getGetOrderStatusUseCase as jest.Mock).mockReturnValue(mockUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle', () => {
    it('should return 400 when order ID is missing', async () => {
      mockRequest.params = {};

      await controller.handle(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'ValidationError',
        message: 'Order ID is required',
      });
      expect(mockUseCase.execute).not.toHaveBeenCalled();
    });

    it('should get order status successfully with 200 status', async () => {
      const orderId = '550e8400-e29b-41d4-a716-446655440000';
      mockRequest.params = { id: orderId };

      const mockOrderData = {
        id: orderId,
        status: 'PROCESSING',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      mockUseCase.execute.mockResolvedValue(mockOrderData);

      await controller.handle(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrderData,
      });
      expect(mockUseCase.execute).toHaveBeenCalledWith({ id: orderId });
    });

    it('should delegate not found errors to error handler middleware', async () => {
      const orderId = '550e8400-e29b-41d4-a716-446655440000';
      mockRequest.params = { id: orderId };

      const notFoundError = new Error('Order not found');
      notFoundError.name = 'NotFoundError';
      mockUseCase.execute.mockRejectedValue(notFoundError);

      await controller.handle(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      expect(mockNext).toHaveBeenCalledWith(notFoundError);
    });

    it('should delegate generic errors to error handler middleware', async () => {
      const orderId = '550e8400-e29b-41d4-a716-446655440000';
      mockRequest.params = { id: orderId };

      const error = new Error('Database error');
      mockUseCase.execute.mockRejectedValue(error);

      await controller.handle(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should get use case from container', async () => {
      mockRequest.params = { id: '550e8400-e29b-41d4-a716-446655440000' };
      mockUseCase.execute.mockResolvedValue({ id: 'test', status: 'CREATED' });

      await controller.handle(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      expect(container.getGetOrderStatusUseCase).toHaveBeenCalled();
    });

    it('should delegate errors with null message to error handler middleware', async () => {
      mockRequest.params = { id: '550e8400-e29b-41d4-a716-446655440000' };
      const error: any = { name: 'UnknownError' };
      mockUseCase.execute.mockRejectedValue(error);

      await controller.handle(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should not call response methods for errors', async () => {
      mockRequest.params = { id: '550e8400-e29b-41d4-a716-446655440000' };
      const error = new Error('Database error');
      mockUseCase.execute.mockRejectedValue(error);

      await controller.handle(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalledWith(500);
    });
  });
});
