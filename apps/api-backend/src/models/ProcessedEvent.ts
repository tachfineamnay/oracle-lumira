import { Schema, model, Document } from 'mongoose';

// Interface for ProcessedEvent document
export interface IProcessedEvent extends Document {
  eventId: string;
  eventType: string;
  processedAt: Date;
  data?: Record<string, any>;
}

// Schema definition
const ProcessedEventSchema = new Schema<IProcessedEvent>({
  eventId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  eventType: {
    type: String,
    required: true
  },
  processedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  data: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'processed_events'
});

// Create and export the model
const ProcessedEvent = model<IProcessedEvent>('ProcessedEvent', ProcessedEventSchema);

export default ProcessedEvent;
export { ProcessedEvent };
