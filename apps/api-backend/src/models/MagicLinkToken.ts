import mongoose, { Document, Schema } from 'mongoose';

/**
 * Oracle Lumira - Magic link tokens (Sanctuaire authentication)
 *
 * Security properties:
 * - only a SHA-256 hash of the token is stored (database dump cannot be replayed)
 * - single use (`usedAt` set atomically with a conditional update)
 * - short TTL (`expiresAt`) enforced in code + TTL index for housekeeping
 * - purpose scoped so the token cannot be reused for another feature
 * - the token is bound to the *verified* email inbox, never to a payment
 */
export type MagicLinkPurpose = 'sanctuaire_login';

export interface IMagicLinkToken extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  tokenHash: string;
  purpose: MagicLinkPurpose;
  expiresAt: Date;
  usedAt?: Date | null;
  requestedIp?: string;
  orderReference?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MagicLinkTokenSchema = new Schema<IMagicLinkToken>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    purpose: {
      type: String,
      enum: ['sanctuaire_login'],
      default: 'sanctuaire_login',
      required: true,
    },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date, default: null },
    requestedIp: { type: String },
    orderReference: { type: String },
  },
  {
    timestamps: true,
    collection: 'magic_link_tokens',
  }
);

// Housekeeping: MongoDB removes expired documents automatically.
MagicLinkTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const MagicLinkToken = mongoose.model<IMagicLinkToken>('MagicLinkToken', MagicLinkTokenSchema);

export default MagicLinkToken;
