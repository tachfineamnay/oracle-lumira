import mongoose, { Document, Schema } from 'mongoose';

export interface IUserProfile {
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  specificQuestion?: string;
  objective?: string;
  facePhotoUrl?: string;
  palmPhotoUrl?: string;
  profileCompleted?: boolean;
  submittedAt?: Date;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: Date;
  createdAt: Date;
  updatedAt: Date;
  stripeCustomerId?: string;
  dolibarrCustomerId?: number;
  subscriptionStatus: 'active' | 'inactive' | 'trial';
  totalOrders: number;
  lastOrderAt?: Date;
  profile?: IUserProfile;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  phone: {
    type: String,
    trim: true,
    // Accept E.164 (+XXXXXXXX) OR national numbers starting with 0 (FR-like)
    // - E.164: +[1-9]\d{6,14}
    // - National: 0 followed by 8 to 10 digits (allows 0704126010)
    match: [/^(?:\+?[1-9]\d{6,14}|0\d{8,10})$/, 'Please enter a valid phone number']
  },
  dateOfBirth: {
    type: Date
  },
  stripeCustomerId: {
    type: String,
    unique: true,
    sparse: true
  },
  dolibarrCustomerId: {
    type: Number,
    unique: true,
    sparse: true
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'trial'],
    default: 'inactive'
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  lastOrderAt: {
    type: Date
  },
  profile: {
    type: {
      birthDate: { type: String },
      birthTime: { type: String },
      birthPlace: { type: String },
      specificQuestion: { type: String },
      objective: { type: String },
      facePhotoUrl: { type: String },
      palmPhotoUrl: { type: String },
      profileCompleted: { type: Boolean, default: false },
      submittedAt: { type: Date }
    },
    default: undefined
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete (ret as any).__v;
      return ret;
    }
  }
});

// Indexes - avoid duplicating unique constraints
userSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUser>('User', userSchema);
