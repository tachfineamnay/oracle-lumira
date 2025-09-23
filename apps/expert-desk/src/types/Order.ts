export interface Order {
  _id: string;
  orderNumber: string;
  level: number;
  levelName: string;
  amount: number;
  status: string;
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    specificQuestion?: string;
  };
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
  expertValidation?: {
    validatorId?: string;
    validatorName?: string;
    validationStatus: 'pending' | 'approved' | 'rejected';
    validationNotes?: string;
    validatedAt?: string;
    rejectionReason?: string;
  };
  revisionCount?: number;
  files?: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
  }>;
  clientInputs?: {
    birthTime?: string;
    birthPlace?: string;
    specificContext?: string;
    lifeQuestion?: string;
  };
  createdAt: string;
  updatedAt: string;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

export interface Stats {
  pending: number;
  paid: number;
  processing: number;
  completed: number;
  awaitingValidation: number;
  treatedToday: number;
  totalTreated: number;
}