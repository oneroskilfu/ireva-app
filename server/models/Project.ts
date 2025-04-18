import mongoose, { Schema, Document } from 'mongoose';

// Define the document interface
export interface IProject extends Document {
  name: string;
  location: string;
  description: string;
  type: 'residential' | 'commercial' | 'industrial' | 'mixed-use' | 'land';
  imageUrl: string;
  imageGallery?: string[];
  videoUrl?: string;
  tier: 'standard' | 'premium' | 'elite';
  targetReturn: string;
  minimumInvestment: number;
  term: number;
  totalFunding: number;
  currentFunding: number;
  numberOfInvestors: number;
  status: 'pending' | 'active' | 'completed' | 'suspended';
  size?: string;
  builtYear?: string;
  occupancy?: string;
  cashFlow?: string;
  daysLeft: number;
  amenities?: string[];
  developer?: string;
  developerProfile?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  projectedCashflow?: any;
  documents?: {
    name: string;
    url: string;
    type: string;
  }[];
  latitude?: string;
  longitude?: string;
  accreditedOnly: boolean;
  sustainabilityFeatures?: string[];
  constructionUpdates?: {
    date: Date;
    title: string;
    description: string;
    images?: string[];
  }[];
  completionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
}

// Define the Project schema
const ProjectSchema: Schema = new Schema(
  {
    name: { type: String, required: true, index: true },
    location: { type: String, required: true, index: true },
    description: { type: String, required: true },
    type: { 
      type: String, 
      required: true, 
      enum: ['residential', 'commercial', 'industrial', 'mixed-use', 'land'],
      index: true
    },
    imageUrl: { type: String, required: true },
    imageGallery: [{ type: String }],
    videoUrl: { type: String },
    tier: { 
      type: String, 
      required: true, 
      enum: ['standard', 'premium', 'elite'],
      default: 'standard' 
    },
    targetReturn: { type: String, required: true },
    minimumInvestment: { type: Number, required: true, default: 100000 },
    term: { type: Number, required: true }, // in months
    totalFunding: { type: Number, required: true },
    currentFunding: { type: Number, required: true, default: 0 },
    numberOfInvestors: { type: Number, required: true, default: 0 },
    status: { 
      type: String, 
      required: true, 
      enum: ['pending', 'active', 'completed', 'suspended'],
      default: 'pending',
      index: true
    },
    size: { type: String },
    builtYear: { type: String },
    occupancy: { type: String },
    cashFlow: { type: String },
    daysLeft: { type: Number, required: true },
    amenities: [{ type: String }],
    developer: { type: String },
    developerProfile: { type: String },
    riskLevel: { 
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    projectedCashflow: { type: Schema.Types.Mixed },
    documents: [{
      name: { type: String, required: true },
      url: { type: String, required: true },
      type: { type: String, required: true }
    }],
    latitude: { type: String },
    longitude: { type: String },
    accreditedOnly: { type: Boolean, default: false },
    sustainabilityFeatures: [{ type: String }],
    constructionUpdates: [{
      date: { type: Date, required: true },
      title: { type: String, required: true },
      description: { type: String, required: true },
      images: [{ type: String }]
    }],
    completionDate: { type: Date },
    createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for investments
ProjectSchema.virtual('investments', {
  ref: 'Investment',
  localField: '_id',
  foreignField: 'property'
});

// Virtual for ROI calculation
ProjectSchema.virtual('calculatedROI').get(function(this: IProject) {
  // Example ROI calculation based on project details
  return parseFloat(this.targetReturn);
});

// Indexes for better query performance
ProjectSchema.index({ location: 1, type: 1 });
ProjectSchema.index({ status: 1, daysLeft: 1 });
ProjectSchema.index({ createdAt: -1 });

// Create and export the Project model
const Project = mongoose.model<IProject>('Project', ProjectSchema);

export default Project;