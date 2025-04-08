import Boom from 'boom';
import web3Review from './web3Review';
import ipfsService from './ipfsService';

/**
 * Submit a review using Web3 (IPFS + Blockchain)
 */
export const submitWeb3Review = async (req, res, next) => {
  try {
    const { user_id } = req.payload;
    const { product_id, rating, comment, image_data } = req.body;

    // Ensure the user is verified (this should be handled by middleware)
    if (!req.web3Verified) {
      return next(Boom.unauthorized('You are not authorized to submit a Web3 review'));
    }

    // Prepare review data
    const reviewData = {
      user_id,
      product_id,
      rating,
      comment,
      created_at: new Date().toISOString()
    };

    // If image is provided, upload it to IPFS
    if (image_data) {
      try {
        // Convert base64 to buffer
        const imageBuffer = Buffer.from(image_data.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        
        // Upload image to IPFS
        const imageHash = await ipfsService.uploadImageToIPFS(imageBuffer);
        
        // Add image hash to review data
        reviewData.image_hash = imageHash;
      } catch (imageError) {
        console.error('Error uploading image to IPFS:', imageError);
        // Continue without image if there's an error
      }
    }

    // Add review to blockchain
    const { tx, ipfsHash } = await web3Review.addReview(
      user_id,
      product_id,
      reviewData
    );

    // Return success response
    res.json({
      success: true,
      message: 'Review submitted successfully to blockchain',
      data: {
        transaction_hash: tx.transactionHash,
        ipfs_hash: ipfsHash,
        block_number: tx.blockNumber,
        blockchain_stored: true
      }
    });
  } catch (error) {
    console.error('Error submitting Web3 review:', error);
    return next(Boom.badImplementation('Failed to submit review to blockchain'));
  }
};

/**
 * Get reviews for a product from the blockchain (admin only)
 */
export const getWeb3Reviews = async (req, res, next) => {
  try {
    const { product_id } = req.params;

    // Fetch reviews from blockchain
    const reviews = await web3Review.fetchReviews(product_id);

    // Return reviews
    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching Web3 reviews:', error);
    return next(Boom.badImplementation('Failed to fetch reviews from blockchain'));
  }
};

export default {
  submitWeb3Review,
  getWeb3Reviews
}; 