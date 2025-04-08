import 'dotenv/config';
import '../clients/db';
import { updateAllProductRatings } from '../utils/ratingUtils';

const updateRatings = async () => {
  try {
    console.log('Starting to update all product ratings...');
    
    const updatedProducts = await updateAllProductRatings();
    
    console.log(`Successfully updated ratings for ${updatedProducts.length} products.`);
    
    // Display the updated products
    updatedProducts.forEach(product => {
      console.log(`Product: ${product.title}, Rating: ${product.overall_rating}, Reviews: ${product.review_count}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating ratings:', error);
    process.exit(1);
  }
};

// Run the script
updateRatings(); 