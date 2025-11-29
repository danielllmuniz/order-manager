import { Document, Schema } from 'mongoose';

export interface OrderDocument extends Document {
  id: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export const orderSchema = new Schema<OrderDocument>(
  {
    id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['created', 'processing', 'shipped', 'delivered'],
      default: 'created',
      index: true,
    },
    createdAt: {
      type: Date,
      required: true,
      index: true,
    },
    updatedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    _id: true,
  },
);

orderSchema.index({ status: 1, createdAt: -1 });

orderSchema.index({ createdAt: -1 });
