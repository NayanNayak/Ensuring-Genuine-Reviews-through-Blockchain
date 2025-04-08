import Review from '../models/review';
import Product from '../models/product';

/**
 * Calculate and update the overall rating for a product
 * @param {string} productId - The ID of the product
 * @returns {Promise<Object>} - The updated product with overall rating
 */
export const updateProductRating = async (productId) => {
  try {
    // Find all reviews for the product
    const reviews = await Review.find({ product: productId });
    
    // Calculate the average rating
    let totalRating = 0;
    const reviewCount = reviews.length;
    
    if (reviewCount > 0) {
      totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviewCount;
      
      // Update the product with the new overall rating
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { 
          overall_rating: parseFloat(averageRating.toFixed(1)), 
          review_count: reviewCount 
        },
        { new: true }
      );
      
      return updatedProduct;
    } else {
      // No reviews, set rating to 0
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { overall_rating: 0, review_count: 0 },
        { new: true }
      );
      
      return updatedProduct;
    }
  } catch (error) {
    console.error('Error updating product rating:', error);
    throw new Error(`Failed to update product rating: ${error.message}`);
  }
};

/**
 * Get the overall rating for a product
 * @param {string} productId - The ID of the product
 * @returns {Promise<Object>} - Object containing overall_rating and review_count
 */
export const getProductRating = async (productId) => {
  try {
    const product = await Product.findById(productId).select('overall_rating review_count');
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    return {
      overall_rating: product.overall_rating,
      review_count: product.review_count
    };
  } catch (error) {
    console.error('Error getting product rating:', error);
    throw new Error(`Failed to get product rating: ${error.message}`);
  }
};

/**
 * Update ratings for all products in the database
 * @returns {Promise<Array>} - Array of updated products
 */
export const updateAllProductRatings = async () => {
  try {
    // Get all products
    const products = await Product.find({});
    const updatedProducts = [];
    
    // Update rating for each product
    for (const product of products) {
      const updatedProduct = await updateProductRating(product._id);
      updatedProducts.push(updatedProduct);
    }
    
    return updatedProducts;
  } catch (error) {
    console.error('Error updating all product ratings:', error);
    throw new Error(`Failed to update all product ratings: ${error.message}`);
  }
};

export default {
  updateProductRating,
  getProductRating,
  updateAllProductRatings
}; 