
export interface CreateOrderDTO {
  customerId: string;
}

export interface OrderStatusResponseDTO {
  id: string;
  status: string;
  updatedAt: string;
}
