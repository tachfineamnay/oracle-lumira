import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  userId?: mongoose.Types.ObjectId; // Optional for guest orders
  userEmail: string;
  
  // Service configuration
  service: 'basic' | 'premium' | 'vip';
  level: 1 | 2 | 3 | 4;
  levelName: 'Simple' | 'Intuitive' | 'Alchimique' | 'Intégrale';
  expertId?: mongoose.Types.ObjectId;
  duration: number; // in minutes
  
  // Payment information
  amount: number; // in cents
  currency: string;
  status: 'pending' | 'confirmed' | 'paid' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentIntentId?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  
  // User form data
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: Date;
    specificQuestion?: string;
    preferences?: {
      audioVoice?: 'masculine' | 'feminine';
      deliveryFormat?: 'email' | 'whatsapp';
    };
  };
  
  // Client uploaded files
  files?: [{
    filename: string;
    originalName: string;
    path: string;
    mimetype: string;
    size: number;
    uploadedAt: Date;
  }];
  
  // Client additional inputs
  clientInputs?: {
    birthTime?: string;
    birthPlace?: string;
    specificContext?: string;
    lifeQuestion?: string;
  };
  
  // Expert processing
  expertPrompt?: string;
  expertInstructions?: string;
  expertNotes?: string;
  
  // Session management for live consultations
  sessionUrl?: string;
  sessionStartTime?: Date;
  sessionEndTime?: Date;
  actualDuration?: number;
  
  // Quality control
  rating?: number;
  review?: string;
  
  // Content delivery
  generatedContent?: {
    audioUrl?: string;
    transcript?: string;
    additionalFiles?: string[];
    deliveryStatus?: 'pending' | 'sent' | 'delivered' | 'failed';
    deliveredAt?: Date;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  completedAt?: Date;
  
  // Notification preferences
  notifications?: {
    sms?: boolean;
    email?: boolean;
    whatsapp?: boolean;
  };
  
  // Metadata
  metadata?: {
    source?: string;
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
  };
}

const OrderSchema: Schema = new Schema({
  orderNumber: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false // Allow guest orders
  },
  userEmail: { 
    type: String, 
    required: true,
    trim: true,
    lowercase: true
  },
  
  // Service configuration
  service: { 
    type: String, 
    enum: ['basic', 'premium', 'vip'], 
    required: true 
  },
  level: { 
    type: Number, 
    enum: [1, 2, 3, 4], 
    required: true 
  },
  levelName: { 
    type: String, 
    enum: ['Simple', 'Intuitive', 'Alchimique', 'Intégrale'], 
    required: true 
  },
  expertId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Expert',
    required: false
  },
  duration: { 
    type: Number, 
    required: true,
    min: 15 // minimum 15 minutes
  },
  
  // Payment information
  amount: { 
    type: Number, 
    required: true,
    min: 0
  },
  currency: { 
    type: String, 
    default: 'eur',
    enum: ['eur', 'usd']
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'paid', 'processing', 'completed', 'failed', 'refunded', 'cancelled'], 
    default: 'pending' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'], 
    default: 'pending' 
  },
  paymentIntentId: { 
    type: String, 
    sparse: true
  },
  stripeSessionId: { 
    type: String, 
    sparse: true
  },
  stripePaymentIntentId: { 
    type: String, 
    sparse: true,
    unique: true
  },
  
  // User form data
  formData: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    dateOfBirth: { type: Date },
    specificQuestion: { type: String, maxlength: 1000 },
    preferences: {
      audioVoice: { type: String, enum: ['masculine', 'feminine'] },
      deliveryFormat: { type: String, enum: ['email', 'whatsapp'] }
    }
  },
  
  // Client uploaded files
  files: [{
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Client additional inputs
  clientInputs: {
    birthTime: { type: String },
    birthPlace: { type: String },
    specificContext: { type: String, maxlength: 2000 },
    lifeQuestion: { type: String, maxlength: 1000 }
  },
  
  // Expert processing
  expertPrompt: { type: String, maxlength: 5000 },
  expertInstructions: { type: String, maxlength: 2000 },
  expertNotes: { type: String, maxlength: 1000 },
  
  // Session management
  sessionUrl: { type: String, trim: true },
  sessionStartTime: { type: Date },
  sessionEndTime: { type: Date },
  actualDuration: { type: Number, min: 0 },
  
  // Quality control
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String, maxlength: 500 },
  
  // Content delivery
  generatedContent: {
    audioUrl: { type: String },
    transcript: { type: String },
    additionalFiles: [{ type: String }],
    deliveryStatus: { 
      type: String, 
      enum: ['pending', 'sent', 'delivered', 'failed'],
      default: 'pending'
    },
    deliveredAt: { type: Date }
  },
  
  // Timestamps
  paidAt: { type: Date },
  completedAt: { type: Date },
  
  // Notification preferences
  notifications: {
    sms: { type: Boolean, default: false },
    email: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: false }
  },
  
  // Metadata
  metadata: {
    source: { type: String },
    referrer: { type: String },
    userAgent: { type: String },
    ipAddress: { type: String }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ expertId: 1, createdAt: -1 });
OrderSchema.index({ userEmail: 1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ stripePaymentIntentId: 1 });
OrderSchema.index({ 'formData.email': 1 });

// Virtual for full customer name
OrderSchema.virtual('customerFullName').get(function() {
  return `${this.formData.firstName} ${this.formData.lastName}`;
});

// Virtual for service display name
OrderSchema.virtual('serviceDisplayName').get(function() {
  const serviceNames = {
    basic: 'Consultation Basique',
    premium: 'Consultation Premium',
    vip: 'Consultation VIP'
  };
  return serviceNames[this.service] || this.service;
});

// Pre-save middleware to validate session times
OrderSchema.pre('save', function(next) {
  if (this.sessionStartTime && this.sessionEndTime) {
    if (this.sessionEndTime <= this.sessionStartTime) {
      return next(new Error('Session end time must be after start time'));
    }
    
    // Calculate actual duration
    this.actualDuration = Math.floor(
      (this.sessionEndTime.getTime() - this.sessionStartTime.getTime()) / (1000 * 60)
    );
  }
  
  // Update completion timestamp
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Update payment timestamp
  if (this.paymentStatus === 'completed' && !this.paidAt) {
    this.paidAt = new Date();
  }
  
  next();
});

// Method to calculate refund amount
OrderSchema.methods.calculateRefundAmount = function(): number {
  if (this.paymentStatus !== 'completed') return 0;
  
  const actualDuration = this.actualDuration || 0;
  const bookedDuration = this.duration;
  
  if (actualDuration >= bookedDuration) return 0;
  
  // Refund proportional to unused time (minimum 50% if session started)
  const usedRatio = actualDuration / bookedDuration;
  const refundRatio = Math.max(0, 1 - usedRatio);
  
  return Math.floor(this.amount * refundRatio) / 100; // Convert from cents and round
};

// Method to check if order can be cancelled
OrderSchema.methods.canBeCancelled = function(): boolean {
  return ['pending', 'confirmed', 'paid'].includes(this.status) && 
         this.paymentStatus !== 'refunded';
};

// Method to check if session can start
OrderSchema.methods.canStartSession = function(): boolean {
  return this.status === 'confirmed' && 
         this.paymentStatus === 'completed' &&
         !this.sessionStartTime;
};

// Method to generate session URL
OrderSchema.methods.generateSessionUrl = function(): string {
  const baseUrl = process.env.FRONTEND_URL || 'https://lumira.com';
  return `${baseUrl}/session/${this._id}?token=${this.orderNumber}`;
};

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
