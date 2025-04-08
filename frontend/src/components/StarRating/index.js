import React from 'react';
import { HStack, Icon, Text, Tooltip } from '@chakra-ui/react';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';

/**
 * A reusable star rating component
 * @param {Object} props
 * @param {number} props.rating - The rating value (0-5)
 * @param {number} props.reviewCount - The number of reviews
 * @param {boolean} props.showCount - Whether to show the review count
 * @param {string} props.size - The size of the stars (sm, md, lg)
 * @param {boolean} props.showTooltip - Whether to show a tooltip with the exact rating
 */
const StarRating = ({ 
  rating = 0, 
  reviewCount = 0, 
  showCount = true, 
  size = "md",
  showTooltip = true
}) => {
  // Map size to icon size
  const sizeMap = {
    sm: 3,
    md: 4,
    lg: 5
  };
  
  const boxSize = sizeMap[size] || 4;
  
  // Function to render stars
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon
          key={`star-${i}`}
          as={FaStar}
          color="yellow.400"
          boxSize={boxSize}
        />
      );
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <Icon
          key="half-star"
          as={FaStarHalfAlt}
          color="yellow.400"
          boxSize={boxSize}
        />
      );
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Icon
          key={`empty-${i}`}
          as={FaStar}
          color="gray.300"
          boxSize={boxSize}
        />
      );
    }
    
    return stars;
  };
  
  const starsElement = (
    <HStack spacing={0.5}>
      {renderStars()}
    </HStack>
  );
  
  return (
    <HStack spacing={1} align="center">
      {showTooltip ? (
        <Tooltip label={`${rating.toFixed(1)} out of 5 stars`} placement="top">
          {starsElement}
        </Tooltip>
      ) : (
        starsElement
      )}
      
      {showCount && reviewCount > 0 && (
        <Text fontSize={size === "sm" ? "xs" : "sm"} color="gray.500">
          ({reviewCount})
        </Text>
      )}
    </HStack>
  );
};

export default StarRating; 