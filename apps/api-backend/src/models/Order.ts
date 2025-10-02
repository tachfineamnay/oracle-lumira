import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  userName?: string; // Added for user name
  level: 1 | 2 | 3 | 4;
  levelName: 'Simple' | 'Intuitive' | 'Alchimique' | 'Intégrale';
  amount: number; // in cents
  currency: string;
  status: 'pending' | 'paid' | 'processing' | 'awaiting_validation' | 'completed' | 'failed' | 'refunded';
  paymentIntentId?: string;
  stripeSessionId?: string;
  
  // Additional payment fields for Stripe integration
  service?: string;
  duration?: number; // in minutes
  expertId?: string;
  paidAt?: Date;
  
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
  
  // Client uploaded files (nouveaux format S3)
  files?: [{
    name: string; // Nom d'affichage
    url: string; // URL publique S3
    key: string; // Clé S3 pour gestion
    contentType: string; // Type MIME
    size: number;
    type: 'face_photo' | 'palm_photo'; // Type fonctionnel
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
  
  // Generated content
  generatedContent?: {
    archetype?: string;
    reading?: string;
    audioUrl?: string;
    pdfUrl?: string;
    mandalaSvg?: string;
    ritual?: string;
    blockagesAnalysis?: string;
    soulProfile?: string;
  };
  
  // Expert validation
  expertReview?: {
    expertId?: string;
    expertName?: string;
    assignedAt?: Date;
    status: 'pending' | 'approved' | 'rejected' | 'revision_needed';
    notes?: string;
    reviewedAt?: Date;
  };

  // Expert validation system for content validation
  expertValidation?: {
    validatorId?: string;
    validatorName?: string;
    validationStatus: 'pending' | 'approved' | 'rejected';
    validationNotes?: string;
    validatedAt?: Date;
    rejectionReason?: string;
  };

  // Revision tracking
  revisionCount?: number;
  
  // Delivery
  deliveredAt?: Date;
  deliveryMethod?: 'email' | 'whatsapp';
  
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  userName: {
    type: String,
    required: false
  },
  level: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4]
  },
  levelName: {
    type: String,
    required: true,
    enum: ['Simple', 'Intuitive', 'Alchimique', 'Intégrale']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'eur'
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'processing', 'awaiting_validation', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentIntentId: String,
  stripeSessionId: String,
  
  // Additional fields for payment integration
  service: String,
  duration: Number,
  expertId: String,
  paidAt: Date,
  
  formData: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: String,
    dateOfBirth: Date,
    specificQuestion: String,
    preferences: {
      audioVoice: { type: String, enum: ['masculine', 'feminine'] },
      deliveryFormat: { type: String, enum: ['email', 'whatsapp'] }
    }
  },
  
  files: [{
    name: { type: String, required: true }, // Nom d'affichage
    url: { type: String, required: true }, // URL publique S3
    key: { type: String, required: true }, // Clé S3
    contentType: { type: String, required: true }, // Type MIME
    size: { type: Number, required: true },
    type: { type: String, enum: ['face_photo', 'palm_photo'], required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  clientInputs: {
    birthTime: String,
    birthPlace: String,
    specificContext: String,
    lifeQuestion: String
  },
  
  expertPrompt: String,
  expertInstructions: String,
  
  generatedContent: {
    archetype: String,
    reading: String,
    audioUrl: String,
    pdfUrl: String,
    mandalaSvg: String,
    ritual: String,
    blockagesAnalysis: String,
    soulProfile: String
  },
  
  expertReview: {
    expertId: String,
    expertName: String,
    assignedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'revision_needed'],
      default: 'pending'
    },
    notes: String,
    reviewedAt: Date
  },

  expertValidation: {
    validatorId: String,
    validatorName: String,
    validationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    validationNotes: String,
    validatedAt: Date,
    rejectionReason: String
  },

  revisionCount: {
    type: Number,
    default: 0
  },
  
  deliveredAt: Date,
  deliveryMethod: { type: String, enum: ['email', 'whatsapp'] }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc: any, ret: any) => {
      delete ret.__v;
      return ret;
    }
  }
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Find the last order of the day
    const lastOrder = await Order.findOne({
      orderNumber: new RegExp(`^LU${year}${month}${day}`)
    }).sort({ orderNumber: -1 });
    
    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-3));
      sequence = lastSequence + 1;
    }
    
    this.orderNumber = `LU${year}${month}${day}${sequence.toString().padStart(3, '0')}`;
  }
  next();
});

// Indexes - avoid duplicating unique constraints  
orderSchema.index({ userId: 1 });
orderSchema.index({ userEmail: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ level: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'expertReview.status': 1 });
orderSchema.index({ 'expertValidation.validationStatus': 1 });
orderSchema.index({ status: 1, 'expertValidation.validationStatus': 1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
