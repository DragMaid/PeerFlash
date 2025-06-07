import mongoose, { Document, Schema } from 'mongoose';

export interface Flashcard {
  front: string;
  back: string;
}

export interface FlashcardDeck {
  title: string;
  subject: string;
  cards: Flashcard[];
  tags?: string[];
  difficulty?: string;
  ipfsHash?: string;
  createdAt: Date;
}

export interface Credential {
  type: string;
  subject: string;
  score: number;
  date: Date;
  ipfsHash?: string;
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  xrplAddress: string;
  xrplSecret: string;
  flashcards: FlashcardDeck[];
  credentials: Credential[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  xrplAddress: {
    type: String,
    required: true,
    unique: true
  },
  xrplSecret: {
    type: String,
    required: true
  },
  flashcards: [{
    title: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    cards: [{
      front: {
        type: String,
        required: true
      },
      back: {
        type: String,
        required: true
      }
    }],
    tags: [String],
    difficulty: String,
    ipfsHash: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  credentials: [{
    type: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    ipfsHash: String
  }]
}, {
  timestamps: true
});

const User = mongoose.model<IUser>('User', userSchema);

export default User; 