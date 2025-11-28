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
      unique: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['created', 'processing', 'shipped', 'delivered'],
      default: 'created',
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  },
);
