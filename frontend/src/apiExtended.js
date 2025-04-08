import axios from "axios";

// Fetch Product Rating
export const fetchProductRating = async (product_id) => {
  try {
    const { data } = await axios.get(
      `${process.env.REACT_APP_BASE_ENDPOINT}/product/${product_id}/rating`
    );
    return data;
  } catch (error) {
    console.error("Error fetching product rating:", error);
    return { overall_rating: 0, review_count: 0 }; // Default values if fetch fails
  }
}; 