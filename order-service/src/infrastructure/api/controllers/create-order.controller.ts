import { NextFunction, Request, Response } from 'express';
import { container } from '../../../infrastructure/container';

export class CreateOrderController {
  async handle(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = container.getCreateOrderUseCase();
      const response = await useCase.execute();

      res.status(201).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }
}
