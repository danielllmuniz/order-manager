import { NextFunction, Request, Response } from 'express';
import { container } from '../../../infrastructure/container';

export class UpdateOrderStatusController {
  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Order ID is required',
      });
      return;
    }

    try {
      const useCase = container.getUpdateOrderStatusUseCase();
      const response = await useCase.execute({ id });

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }
}
