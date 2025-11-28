export interface UpdateOrderStatusRequest {
  id: string;
}

export interface UpdateOrderStatusResponse {
  id: string;
  previousStatus: string;
  newStatus: string;
  updatedAt: Date;
}
