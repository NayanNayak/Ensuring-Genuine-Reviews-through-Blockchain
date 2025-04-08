import Boom from 'boom';
import Delivery from '../models/delivery';
import web3Review from './web3Review';

/**
 * Middleware to validate if a user is authorized to submit a review
 * using the Standard Delivery Code (SDC) system
 */
export const validateReviewer = async (req, res, next) => {
  try {
    const { user_id } = req.payload; // Auto-fetch user ID from login
    const { product_id } = req.body;

    // Check if the user has a valid delivery for this product using the Web2 backend
    const delivery = await Delivery.findOne({
      user: user_id,
      product: product_id,
      delivery_status: 'Delivered'
    });

    if (!delivery) {
      return next(Boom.unauthorized('You are not authorized to review this product. You must have purchased and received this product to review it.'));
    }

    // Check if the user has already reviewed this product on the blockchain
    const hasReviewed = await web3Review.hasUserReviewed(user_id, product_id);
    if (hasReviewed) {
      return next(Boom.conflict('You have already reviewed this product on the blockchain'));
    }

    // Check if the reviewer is already verified on the blockchain
    const isVerified = await web3Review.isReviewerVerified(user_id, product_id);
    
    // If not verified, verify the reviewer on the blockchain
    if (!isVerified) {
      await web3Review.verifyReviewer(user_id, product_id);
    }

    // Attach verification status to the request
    req.web3Verified = true;
    
    next();
  } catch (error) {
    console.error('Error in Web3 authentication middleware:', error);
    return next(Boom.badImplementation('Error validating reviewer on blockchain'));
  }
};

export default {
  validateReviewer
}; 