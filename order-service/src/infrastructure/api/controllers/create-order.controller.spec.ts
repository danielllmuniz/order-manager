import { NextFunction, Request, Response } from 'express';
import { CreateOrderController } from './create-order.controller';
import { container } from '../../../infrastructure/container';

jest.mock('../../../infrastructure/container', () => ({
  container: {
    getCreateOrderUseCase: jest.fn(),
  },
}));

describe('CreateOrderController', () => {
  let controller: CreateOrderController;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  let mockNext: jest.Mock;
  let mockUseCase: any;

  beforeEach(() => {
    controller = new CreateOrderController();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      body: {},
    };

    mockNext = jest.fn();

    mockUseCase = {
      execute: jest.fn(),
    };

    (container.getCreateOrderUseCase as jest.Mock).mockReturnValue(mockUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle', () => {
    it('should create order successfully with 201 status', async () => {
      const mockOrderData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        status: 'CREATED',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      mockUseCase.execute.mockResolvedValue(mockOrderData);

      await controller.handle(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrderData,
      });
    });

    it('should delegate use case errors to error handler middleware', async () => {
      const error = new Error('Database connection failed');
      mockUseCase.execute.mockRejectedValue(error);

      await controller.handle(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should get use case from container', async () => {
      mockUseCase.execute.mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        status: 'CREATED',
      });

      await controller.handle(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      expect(container.getCreateOrderUseCase).toHaveBeenCalled();
    });

    it('should delegate unknown errors to error handler middleware', async () => {
      const unknownError = new TypeError('Type mismatch');
      mockUseCase.execute.mockRejectedValue(unknownError);

      await controller.handle(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      expect(mockNext).toHaveBeenCalledWith(unknownError);
    });

    it('should not call response.json on error', async () => {
      const error = new Error('Some error');
      mockUseCase.execute.mockRejectedValue(error);

      await controller.handle(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });
});
