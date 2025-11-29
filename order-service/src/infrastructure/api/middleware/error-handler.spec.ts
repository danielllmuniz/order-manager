import { Request, Response } from 'express';
import { errorHandler, notFoundHandler } from './error-handler';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      path: '/api/orders',
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      statusCode: 200,
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('errorHandler', () => {
    it('should handle business errors with 400 status', () => {
      const error = new Error('Order already delivered');
      error.name = 'CannotAdvanceOrderStatusError';

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext as any);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'CannotAdvanceOrderStatusError',
        message: 'Order already delivered',
      });
    });

    it('should handle InvalidOrderStatusError with 400 status', () => {
      const error = new Error('Invalid status provided');
      error.name = 'InvalidOrderStatusError';

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext as any);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'InvalidOrderStatusError',
        message: 'Invalid status provided',
      });
    });

    it('should handle ValidationError with 400 status and details', () => {
      const error = new Error('Invalid request data');
      error.name = 'ValidationError';

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext as any);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'ValidationError',
        message: 'Invalid request data',
        details: 'Invalid request data',
      });
    });

    it('should handle NotFoundError with 404 status', () => {
      const error = new Error('Order not found');
      error.name = 'NotFoundError';

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext as any);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'NotFoundError',
        message: 'Order not found',
      });
    });

    it('should handle errors with "not found" in message with 404 status', () => {
      const error = new Error('Resource not found in database');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext as any);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'NotFoundError',
        message: 'Resource not found in database',
      });
    });

    it('should handle MongoError with 503 status', () => {
      const error = new Error('connection refused');
      error.name = 'MongoError';

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext as any);

      expect(mockResponse.status).toHaveBeenCalledWith(503);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'DatabaseError',
        message: 'Database connection error. Please try again later.',
      });
    });

    it('should handle MongooseError with 503 status', () => {
      const error = new Error('connection timeout');
      error.name = 'MongooseError';

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext as any);

      expect(mockResponse.status).toHaveBeenCalledWith(503);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'DatabaseError',
        message: 'Database connection error. Please try again later.',
      });
    });

    it('should handle generic errors with 500 status', () => {
      const error = new Error('Unexpected error');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext as any);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'InternalServerError',
        message: 'An unexpected error occurred. Please try again later.',
      });
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404 status code', () => {
      notFoundHandler(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should include route information in message', () => {
      const testRequest: Partial<Request> = {
        method: 'POST',
        path: '/api/orders/123',
      };

      notFoundHandler(testRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'NotFoundError',
        statusCode: 404,
        message: 'Route POST /api/orders/123 not found',
      });
    });

    it('should set success flag to false', () => {
      notFoundHandler(mockRequest as Request, mockResponse as Response);

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.success).toBe(false);
    });

    it('should format message correctly for different HTTP methods', () => {
      const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

      methods.forEach((method) => {
        jest.clearAllMocks();
        mockResponse = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn().mockReturnThis(),
        };

        const testRequest: Partial<Request> = {
          method,
          path: '/test',
        };

        notFoundHandler(testRequest as Request, mockResponse as Response);

        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            message: `Route ${method} /test not found`,
          }),
        );
      });
    });

    it('should include status code in response body', () => {
      notFoundHandler(mockRequest as Request, mockResponse as Response);

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.statusCode).toBe(404);
    });

    it('should have NotFoundError as error type', () => {
      notFoundHandler(mockRequest as Request, mockResponse as Response);

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.error).toBe('NotFoundError');
    });
  });
});
