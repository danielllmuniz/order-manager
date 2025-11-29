import { Request, Response } from 'express';
// import { CreateOrderRequest } from '../../../application/dtos/create-order.dto';
// import { manualContainer } from '../../../main/container/manual-container';

export class CreateOrderController {
  async handle(req: Request, res: Response): Promise<void> {
    try {
      // const service = manualContainer.createOrderService;
      // const request = new CreateOrderRequest();
      // request.status = req.body.status;
      // request.customerId = req.body.customerId;
      // request.items = req.body.items;

      // const response = await service.execute(request);

      // res.status(201).json({
      //   success: true,
      //   data: response,
      //   message: 'Order created successfully',
      // });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
