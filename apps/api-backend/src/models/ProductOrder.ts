import mongoose, { Document, Schema } from 'mongoose';

export type ProductOrderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface IProductOrder extends Document {
  _id: mongoose.Types.ObjectId;
  productId: string;
  customerId?: string;
  customerEmail?: string;
  amount: number;
  currency: string;
  status: ProductOrderStatus;
  paymentIntentId: string; // Stripe PaymentIntent id
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
}

const ProductOrderSchema = new Schema<IProductOrder>({
  productId: { type: String, required: true, index: true },
  customerId: { type: String },
  customerEmail: { type: String, lowercase: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, default: 'eur' },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  paymentIntentId: { type: String, required: true, unique: true, index: true },
  completedAt: { type: Date },
  metadata: { type: Schema.Types.Mixed },
}, {
  timestamps: true,
  toJSON: {
    transform: (doc: any, ret: any) => {
      delete ret.__v;
      return ret;
    }
  }
});

ProductOrderSchema.index({ createdAt: -1 });

export const ProductOrder = mongoose.model<IProductOrder>('ProductOrder', ProductOrderSchema);

