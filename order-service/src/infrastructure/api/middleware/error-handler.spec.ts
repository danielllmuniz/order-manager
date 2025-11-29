import { Request, Response } from 'express';
import { errorHandler, notFoundHandler } from './error-handler';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let statusCode: number;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      path: '/api/orders',
    };

    statusCode = 200;
    mockResponse = {
      status: jest.fn().mockImplementation((code) => {
        statusCode = code;
        return mockResponse;
      }),
      statusCode: 200,
      json: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('errorHandler', () => {
    it('should use custom status code when not 200', () => {
      const error = new Error('Database error');
      mockResponse.statusCode = 500;

      errorHandler(error, mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: true,
        statusCode: 500,
        message: 'Database error',
      });
    });

    it('should default to 500 status code when statusCode is 200', () => {
      const error = new Error('Internal error');
      mockResponse.statusCode = 200;

      errorHandler(error, mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: true,
        statusCode: 500,
        message: 'Internal error',
      });
    });

    it('should use default message when error message is empty', () => {
      const error = new Error();
      mockResponse.statusCode = 400;

      errorHandler(error, mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: true,
        statusCode: 400,
        message: 'Internal Server Error',
      });
    });

    it('should handle 400 Bad Request errors', () => {
      const error = new Error('Invalid input');
      mockResponse.statusCode = 400;

      errorHandler(error, mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: true,
        statusCode: 400,
        message: 'Invalid input',
      });
    });

    it('should handle 404 Not Found errors', () => {
      const error = new Error('Resource not found');
      mockResponse.statusCode = 404;

      errorHandler(error, mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: true,
        statusCode: 404,
        message: 'Resource not found',
      });
    });

    it('should always set error flag to true', () => {
      const error = new Error('Any error');
      mockResponse.statusCode = 500;

      errorHandler(error, mockRequest as Request, mockResponse as Response);

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.error).toBe(true);
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
        error: true,
        statusCode: 404,
        message: 'Route POST /api/orders/123 not found',
      });
    });

    it('should set error flag to true', () => {
      notFoundHandler(mockRequest as Request, mockResponse as Response);

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.error).toBe(true);
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
  });
});
