import Review from '../../models/review';
import Boom from 'boom';
import ReviewSchema from './validations';
import Delivery from '../../models/delivery';
import web3Review from '../../blockchain/web3Review';
import ipfsService from '../../blockchain/ipfsService';
import { updateProductRating } from '../../utils/ratingUtils';

const Create = async (req, res, next) => {
  const { error } = ReviewSchema.validate(req.body);
  if (error) {
    return next(Boom.badRequest(error.details[0].message));
  }

  const { user_id } = req.payload; // Auto-fetch user ID from login
  const { product_id, rating, comment, image_data } = req.body;

  try {
    // Check if the user has already reviewed this product
    const existingReview = await Review.findOne({
      user: user_id,
      product: product_id
    });

    if (existingReview) {
      return next(Boom.conflict('You have already reviewed this product. You can only submit one review per product.'));
    }

    // Automatically check if the user has a valid delivery for this product
    const delivery = await Delivery.findOne({
      user: user_id,
      product: product_id,
      delivery_status: 'Delivered'
    });

    if (!delivery) {
      return next(Boom.unauthorized('You are not authorized to review this product. You must have purchased and received this product to review it.'));
    }

    // Create the review in MongoDB (Web2)
    const review = new Review({
      user: user_id,
      product: product_id,
      rating,
      comment,
    });

    const savedReview = await review.save();

    // Store the review in blockchain (Web3)
    let blockchainStored = false;
    let ipfsHash = null;
    let transactionHash = null;

    try {
      // Prepare review data for blockchain
      const reviewData = {
        user_id,
        product_id,
        rating,
        comment,
        review_id: savedReview._id.toString(),
        created_at: new Date().toISOString()
      };

      // Verify the reviewer on blockchain
      const isVerified = await web3Review.isReviewerVerified(user_id, product_id);
      if (!isVerified) {
        await web3Review.verifyReviewer(user_id, product_id);
      }

      // Add review to blockchain
      const result = await web3Review.addReview(user_id, product_id, reviewData);
      blockchainStored = true;
      ipfsHash = result.ipfsHash;
      transactionHash = result.tx.transactionHash;

      // Update the MongoDB review with blockchain info
      savedReview.blockchain_stored = true;
      savedReview.ipfs_hash = ipfsHash;
      savedReview.transaction_hash = transactionHash;
      await savedReview.save();
      
      // Update the overall rating for the product
      await updateProductRating(product_id);
      
    } catch (blockchainError) {
      console.error('Error storing review in blockchain:', blockchainError);
      // Don't fail the entire request if blockchain storage fails
      // Just return the MongoDB review without blockchain info
      
      // Check if it's a local IPFS node connection error
      if (blockchainError.message && blockchainError.message.includes('Cannot connect to local IPFS node')) {
        return res.status(500).json({
          message: 'Cannot connect to local IPFS node. Please make sure IPFS daemon is running on your machine.',
          review: savedReview
        });
      }
      
      // Remove Infura-specific error handling since we're using local IPFS
    }

    // Return the review with blockchain info
    res.json({
      ...savedReview.toJSON(),
      blockchain_stored: blockchainStored,
      ipfs_hash: ipfsHash,
      transaction_hash: transactionHash
    });
  } catch (e) {
    next(e);
  }
};

const ListAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({})
    .populate({
      path: 'user',
      select: 'email', // Include email, exclude sensitive fields
    })
      .populate('product');
    
    res.json(reviews);
  } catch (e) {
    next(e);
  }
};

const GetReviewsByProduct = async (req, res, next) => {
  const { product_id } = req.params;

  try {
    const reviews = await Review.find({ product: product_id })
    .populate({
      path: 'user',
      select: 'email', // Include email, exclude sensitive fields
    });
    
    res.json(reviews);
  } catch (e) {
    next(e);
  }
};

const Delete = async (req, res, next) => {
  const { reviewId } = req.params;

  try {
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return next(Boom.notFound('Review not found.'));
    }
    
    // If the review is stored in blockchain, don't allow deletion
    if (review.blockchain_stored) {
      return next(Boom.methodNotAllowed('This review is stored in blockchain and cannot be deleted.'));
    }

    const deletedReview = await Review.findByIdAndDelete(reviewId);
    res.json({ message: 'Review deleted successfully' });
  } catch (e) {
    next(e);
  }
};

export default {
  Create,
  ListAllReviews,
  GetReviewsByProduct,
  Delete,
};
