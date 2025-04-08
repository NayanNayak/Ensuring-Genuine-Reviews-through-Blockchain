import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { fetchProduct, fetchReviews, submitReview } from "../../api";
import { fetchProductRating } from "../../apiExtended";
import ImageGallery from "react-image-gallery";
import {
  Card,
  Stack,
  Heading,
  Text,
  Button,
  CardBody,
  CardFooter,
  Textarea,
  VStack,
  Divider,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  AlertDescription,
  Box,
  useToast,
  HStack,
  Icon,
  Flex,
} from "@chakra-ui/react";
import { FaStar, FaEthereum } from "react-icons/fa";
import { useBasket } from "../../contexts/BasketContext";
import { useAuth } from "../../contexts/AuthContext";
import StarRating from "../../components/StarRating";
import { Link } from "react-router-dom";

function ProductDetail() {
  const { product_id } = useParams();
  const { addToBasket, items } = useBasket();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { isLoading, isError, data } = useQuery(["product", product_id], () =>
    fetchProduct(product_id)
  );

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery(["reviews", product_id], () =>
    fetchReviews(product_id)
  );

  // Add console log to debug reviews
  useEffect(() => {
    if (reviews) {
      console.log("Reviews loaded:", reviews);
    }
  }, [reviews]);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState(null);
  const [hover, setHover] = useState(null);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);

  // Add state for product rating
  const [productRating, setProductRating] = useState({ overall_rating: 0, review_count: 0 });
  
  // Fetch product rating
  useEffect(() => {
    const getRating = async () => {
      try {
        const ratingData = await fetchProductRating(product_id);
        setProductRating(ratingData);
      } catch (error) {
        console.error("Error fetching product rating:", error);
      }
    };
    
    if (product_id) {
      getRating();
    }
  }, [product_id, reviews]); // Re-fetch when reviews change

  // Check if the current user has already reviewed this product
  useEffect(() => {
    if (reviews && user) {
      const userReview = reviews.find(review => review.user && review.user._id === user._id);
      setHasUserReviewed(!!userReview);
    }
  }, [reviews, user]);

  const reviewMutation = useMutation(
    (newReview) => submitReview(product_id, newReview),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["reviews", product_id]);
        setRating(5);
        setComment("");
        setReviewError(null);
        setHasUserReviewed(true);
        
        // Show success toast
        toast({
          title: "Review submitted",
          description: "Your review has been submitted successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // If the review was stored in blockchain, show a blockchain toast
        if (data.blockchain_stored) {
          setTimeout(() => {
            toast({
              title: "Blockchain Storage",
              description: "Your review is stored in the blockchain.",
              status: "info",
              duration: 5000,
              isClosable: true,
              icon: <Icon as={FaEthereum} />,
            });
          }, 1000); // Show after a short delay
        }
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.message || "Error submitting review.";
        setReviewError(errorMessage);
        
        // Determine the appropriate toast status based on the error
        const isConflict = error.response?.status === 409; // HTTP 409 Conflict
        
        toast({
          title: isConflict ? "Already Reviewed" : "Review submission failed",
          description: errorMessage,
          status: isConflict ? "warning" : "error",
          duration: 5000,
          isClosable: true,
        });
        
        if (isConflict) {
          setHasUserReviewed(true);
        }
      },
    }
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error...</div>;
  }

  const findBasketItem = items.find((item) => item._id === product_id);
  const images = data.photos.map((url) => ({ original: url }));

  const handleSubmitReview = () => {
    if (!comment) {
      setReviewError("Please write a comment for your review.");
      return;
    }
    
    reviewMutation.mutate({ rating, comment });
  };

  return (
    <div>
      <Card direction={{ base: "column", sm: "row" }} overflow="hidden" variant="outline">
        <ImageGallery items={images} showThumbnails={false} />

        <Stack>
          <CardBody>
            <Heading size="md">{data.title}</Heading>
            
            {/* Add overall rating display */}
            <Box my={2}>
              <Flex align="center">
                <StarRating 
                  rating={productRating.overall_rating} 
                  reviewCount={productRating.review_count}
                  size="lg"
                />
                <Text ml={2} fontWeight="bold" fontSize="lg">
                  {productRating.overall_rating.toFixed(1)}
                </Text>
              </Flex>
              <Text fontSize="sm" color="gray.600">
                Based on {productRating.review_count} {productRating.review_count === 1 ? 'review' : 'reviews'}
              </Text>
            </Box>

            <Text maxWidth={400} py="2">
              {data.description}
            </Text>
            <Text color="blue.600" fontSize="2xl">
              {data.price}$
            </Text>
          </CardBody>

          <CardFooter>
            <Button
              variant="solid"
              colorScheme={findBasketItem ? "red" : "whatsapp"}
              bgColor={"green.400"}
              onClick={() => addToBasket(data, findBasketItem)}
            >
              {findBasketItem ? "Remove from basket" : "Add to Basket"}
            </Button>
          </CardFooter>
        </Stack>
      </Card>

      {/* Review Section */}
      <VStack align="stretch" mt={4} p={4} borderWidth="1px" borderRadius="lg">
        <Heading size="md">Product Reviews</Heading>

        {reviewsLoading ? (
          <Text>Loading reviews...</Text>
        ) : reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review._id} p={3} borderWidth="1px" mb={3}>
              <Text fontWeight="bold" color="gray.700">
                User: {review.user?.email || "Anonymous User"}
              </Text>
              <HStack>
                <Text>Rating: </Text>
                <StarRating rating={review.rating} showCount={false} />
              </HStack>
              <Text mt={2}>{review.comment}</Text>
              {review.blockchain_stored && (
                <Box mt={2} p={1} bg="blue.50" borderRadius="md">
                  <HStack>
                    <Icon as={FaEthereum} color="blue.500" />
                    <Text fontSize="xs" color="blue.600">Verified on blockchain</Text>
                  </HStack>
                </Box>
              )}
            </Card>
          ))
        ) : (
          <Text>No reviews yet. Be the first to review this product!</Text>
        )}

        <Divider my={4} />

        {/* Add Review Form - Only shown to logged-in users */}
        {user ? (
          <>
            <Heading size="sm">Write a Review</Heading>
            
            {hasUserReviewed ? (
              <Alert status="info" mb={3} mt={3}>
                <AlertIcon />
                <AlertDescription>You have already submitted a review for this product. Thank you for your feedback!</AlertDescription>
              </Alert>
            ) : (
              <>
                {reviewError && (
                  <Alert status="error" mb={3} mt={3}>
                    <AlertIcon />
                    <AlertDescription>{reviewError}</AlertDescription>
                  </Alert>
                )}
                
                <Box p={3} borderWidth="1px" borderRadius="md" bg="blue.50" mt={3}>
                  <Text fontSize="sm" mb={2}>
                    Only verified buyers who have received this product can submit reviews. The system will automatically verify your purchase.
                  </Text>
                </Box>
                
                <FormControl isRequired mt={3}>
                  <FormLabel>Rating</FormLabel>
                  <HStack spacing={1}>
                    {[...Array(5)].map((_, index) => {
                      const ratingValue = index + 1;
                      return (
                        <Icon
                          key={index}
                          as={FaStar}
                          boxSize={6}
                          color={(hover || rating) >= ratingValue ? "yellow.400" : "gray.300"}
                          cursor="pointer"
                          onClick={() => setRating(ratingValue)}
                          onMouseEnter={() => setHover(ratingValue)}
                          onMouseLeave={() => setHover(null)}
                          transition="color 0.2s"
                        />
                      );
                    })}
                  </HStack>
                </FormControl>
                
                <FormControl isRequired mt={3}>
                  <FormLabel>Comment</FormLabel>
                  <Textarea
                    placeholder="Write your review here..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </FormControl>
                
                <Button
                  mt={4}
                  colorScheme="blue"
                  isLoading={reviewMutation.isLoading}
                  onClick={handleSubmitReview}
                >
                  Submit Review
                </Button>
              </>
            )}
          </>
        ) : (
          <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
            <Text>
              Please <Link to="/signin" style={{ color: 'blue', textDecoration: 'underline' }}>sign in</Link> to leave a review.
            </Text>
          </Box>
        )}
      </VStack>
    </div>
  );
}

export default ProductDetail;
