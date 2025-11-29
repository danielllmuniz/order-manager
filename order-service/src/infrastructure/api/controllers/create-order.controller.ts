import { Request, Response } from 'express';
import { container } from '../../../infrastructure/container';

export class CreateOrderController {
  async handle(req: Request, res: Response): Promise<void> {
    try {
      const useCase = container.getCreateOrderUseCase();
      const response = await useCase.execute();

      res.status(201).json({
        success: true,
        data: response,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
