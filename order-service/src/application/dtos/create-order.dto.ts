export interface CreateOrderRequest {
  id: string;
}

export interface CreateOrderResponse {
  id: string;
  status: string;
  createdAt: Date;
}
