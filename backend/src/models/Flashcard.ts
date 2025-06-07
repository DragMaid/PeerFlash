import mongoose, { Document, Schema } from 'mongoose';

export interface Flashcard {
  front: string;
  back: string;
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  lastReviewed?: Date;
  reviewCount?: number;
  masteryLevel?: number;
}

export interface FlashcardDeck {
  title: string;
  subject: string;
  cards: Flashcard[];
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  ipfsHash?: string;
  createdAt: Date;
  updatedAt?: Date;
  lastStudied?: Date;
  studyCount?: number;
  averageMastery?: number;
}

export interface IFlashcardDeck extends Document {
  title: string;
  subject: string;
  cards: Flashcard[];
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  ipfsHash?: string;
  createdAt: Date;
  updatedAt: Date;
  lastStudied?: Date;
  studyCount: number;
  averageMastery: number;
}

const flashcardSchema = new Schema<Flashcard>({
  front: { type: String, required: true },
  back: { type: String, required: true },
  tags: [{ type: String }],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  lastReviewed: { type: Date },
  reviewCount: { type: Number, default: 0 },
  masteryLevel: { type: Number, default: 0 }
});

const flashcardDeckSchema = new Schema<IFlashcardDeck>({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  cards: [flashcardSchema],
  tags: [{ type: String }],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  ipfsHash: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastStudied: { type: Date },
  studyCount: { type: Number, default: 0 },
  averageMastery: { type: Number, default: 0 }
});

// Update the updatedAt timestamp before saving
flashcardDeckSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Calculate average mastery level
flashcardDeckSchema.methods.calculateAverageMastery = function(): number {
  if (this.cards.length === 0) return 0;
  const totalMastery = this.cards.reduce((sum: number, card: Flashcard) => sum + (card.masteryLevel || 0), 0);
  return totalMastery / this.cards.length;
};

// Update study statistics
flashcardDeckSchema.methods.updateStudyStats = function(): void {
  this.studyCount += 1;
  this.lastStudied = new Date();
  this.averageMastery = this.calculateAverageMastery();
};

export const FlashcardDeck = mongoose.model<IFlashcardDeck>('FlashcardDeck', flashcardDeckSchema); 