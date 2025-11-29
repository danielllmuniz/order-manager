import { Request, Response } from 'express';
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

      await controller.handle(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrderData,
      });
    });

    it('should handle use case errors with 500 status', async () => {
      const errorMessage = 'Database connection failed';
      mockUseCase.execute.mockRejectedValue(new Error(errorMessage));

      await controller.handle(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: errorMessage,
      });
    });

    it('should get use case from container', async () => {
      mockUseCase.execute.mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        status: 'CREATED',
      });

      await controller.handle(mockRequest as Request, mockResponse as Response);

      expect(container.getCreateOrderUseCase).toHaveBeenCalled();
    });

    it('should handle unknown errors gracefully', async () => {
      const unknownError = { message: 'Unknown error occurred' };
      mockUseCase.execute.mockRejectedValue(unknownError);

      await controller.handle(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should handle object without message property', async () => {
      const errorObject = { code: 'CUSTOM_ERROR' };
      mockUseCase.execute.mockRejectedValue(errorObject);

      await controller.handle(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });
});
