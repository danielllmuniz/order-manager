import { Request, Response } from 'express';
import { CannotAdvanceOrderStatusError } from '../../../domain/entities/order';
import { container } from '../../../infrastructure/container';

export class UpdateOrderStatusController {
  async handle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Order ID is required',
        });
        return;
      }

      const useCase = container.getUpdateOrderStatusUseCase();
      const response = await useCase.execute({ id });

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error: any) {
      if (error instanceof CannotAdvanceOrderStatusError) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }

      if (error.name === 'OrderNotFoundError') {
        res.status(404).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
