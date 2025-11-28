export interface GetOrderStatusRequest {
  id: string;
}

export interface GetOrderStatusResponse {
  id: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  canAdvance: boolean;
}
