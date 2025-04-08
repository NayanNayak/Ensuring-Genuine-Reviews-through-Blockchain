import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'product',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  // Blockchain-related fields
  blockchain_stored: {
    type: Boolean,
    default: false
  },
  ipfs_hash: {
    type: String,
    default: null
  },
  transaction_hash: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Review = mongoose.model('review', ReviewSchema);

export default Review;
