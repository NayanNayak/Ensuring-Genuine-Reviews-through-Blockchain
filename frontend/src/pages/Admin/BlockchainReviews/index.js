import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Card,
  CardBody,
  Spinner,
  Alert,
  AlertIcon,
  Icon,
  Tooltip,
  useToast,
  Divider,
  Image,
} from '@chakra-ui/react';
import { FaEthereum, FaSearch, FaLink, FaStar } from 'react-icons/fa';
import { useQuery } from 'react-query';
import axios from 'axios';

// Function to fetch blockchain reviews
const fetchBlockchainReviews = async (productId) => {
  const token = localStorage.getItem('access-token');
  
  if (!token) {
    throw new Error('User is not authenticated');
  }
  
  const { data } = await axios.get(
    `${process.env.REACT_APP_BASE_ENDPOINT}/web3-review/product/${productId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  return data.data;
};

function BlockchainReviews() {
  const [productId, setProductId] = useState('');
  const [searchedProductId, setSearchedProductId] = useState('');
  const toast = useToast();
  
  // Query for blockchain reviews
  const {
    data: reviews,
    isLoading,
    isError,
    error,
  } = useQuery(
    ['blockchainReviews', searchedProductId],
    () => fetchBlockchainReviews(searchedProductId),
    {
      enabled: !!searchedProductId,
      onError: (err) => {
        toast({
          title: 'Error fetching reviews',
          description: err.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );
  
  // Handle search
  const handleSearch = () => {
    if (!productId) {
      toast({
        title: 'Product ID required',
        description: 'Please enter a product ID to search',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setSearchedProductId(productId);
  };
  
  // Function to render stars for display
  const renderStars = (starRating) => {
    return (
      <HStack spacing={1}>
        {[...Array(5)].map((_, i) => (
          <Icon
            key={i}
            as={FaStar}
            color={i < starRating ? "yellow.400" : "gray.300"}
            boxSize={4}
          />
        ))}
      </HStack>
    );
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  
  return (
    <div>
      <nav>
        <ul className="admin-menu">
          <li>
            <Link to="/admin">Home</Link>
          </li>
          <li>
            <Link to="/admin/orders">Order</Link>
          </li>
          <li>
            <Link to="/admin/products">Products</Link>
          </li>
          <li>
            <Link to="/admin/blockchain-reviews">Blockchain Reviews</Link>
          </li>
        </ul>
      </nav>
      
      <Box mt={10} p={5}>
        <HStack mb={5} align="center">
          <Icon as={FaEthereum} boxSize={8} color="blue.500" mr={2} />
          <Heading size="lg">Blockchain-Verified Reviews</Heading>
        </HStack>
        
        <Text mb={5}>
          These reviews are stored on the blockchain and IPFS, ensuring their authenticity and immutability.
        </Text>
        
        <Card mb={5}>
          <CardBody>
            <VStack align="start" spacing={4}>
              <Heading size="md">Search Reviews by Product ID</Heading>
              
              <HStack width="100%">
                <Input
                  placeholder="Enter Product ID"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  flex={1}
                />
                <Button
                  leftIcon={<FaSearch />}
                  colorScheme="blue"
                  onClick={handleSearch}
                  isLoading={isLoading}
                >
                  Search
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
        
        {isLoading && (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" />
            <Text mt={4}>Loading blockchain reviews...</Text>
          </Box>
        )}
        
        {isError && (
          <Alert status="error" mb={5}>
            <AlertIcon />
            <Text>Error fetching blockchain reviews: {error.message}</Text>
          </Alert>
        )}
        
        {reviews && reviews.length === 0 && searchedProductId && (
          <Alert status="info" mb={5}>
            <AlertIcon />
            <Text>No blockchain reviews found for this product.</Text>
          </Alert>
        )}
        
        {reviews && reviews.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>
              Blockchain Reviews for Product: {searchedProductId}
            </Heading>
            
            <Table variant="simple" mb={5}>
              <Thead>
                <Tr>
                  <Th>User ID</Th>
                  <Th>Rating</Th>
                  <Th>Comment</Th>
                  <Th>IPFS Hash</Th>
                  <Th>Timestamp</Th>
                </Tr>
              </Thead>
              <Tbody>
                {reviews.map((review, index) => (
                  <Tr key={index}>
                    <Td>{review.user_id}</Td>
                    <Td>{review.rating}</Td>
                    <Td>{review.comment}</Td>
                    <Td>
                      <Tooltip label="View on IPFS">
                        <Button
                          as="a"
                          href={`https://ipfs.io/ipfs/${review.ipfsHash}`}
                          target="_blank"
                          size="xs"
                          leftIcon={<FaLink />}
                          variant="outline"
                        >
                          {review.ipfsHash.substring(0, 8)}...
                        </Button>
                      </Tooltip>
                    </Td>
                    <Td>{formatDate(review.timestamp)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            
            <Divider my={5} />
            
            <Heading size="md" mb={4}>
              Detailed Review Cards
            </Heading>
            
            <VStack spacing={4} align="stretch">
              {reviews.map((review, index) => (
                <Card key={index} p={4}>
                  <HStack justify="space-between" mb={3}>
                    <Badge colorScheme="green" p={2} borderRadius="md">
                      <HStack>
                        <Icon as={FaEthereum} />
                        <Text>Blockchain Verified</Text>
                      </HStack>
                    </Badge>
                    <Text fontSize="sm" color="gray.500">
                      {formatDate(review.timestamp)}
                    </Text>
                  </HStack>
                  
                  <Text fontWeight="bold" mb={2}>
                    User ID: {review.user_id}
                  </Text>
                  
                  <HStack mb={3}>
                    <Text>Rating:</Text>
                    {renderStars(review.rating)}
                  </HStack>
                  
                  <Text mb={3}>{review.comment}</Text>
                  
                  {review.image_hash && (
                    <Box mb={3}>
                      <Image
                        src={`https://ipfs.io/ipfs/${review.image_hash}`}
                        alt="Review image"
                        borderRadius="md"
                        maxH="200px"
                        objectFit="cover"
                      />
                    </Box>
                  )}
                  
                  <HStack mt={2}>
                    <Tooltip label="View on IPFS">
                      <Button
                        as="a"
                        href={`https://ipfs.io/ipfs/${review.ipfsHash}`}
                        target="_blank"
                        size="sm"
                        leftIcon={<FaLink />}
                        colorScheme="blue"
                        variant="outline"
                      >
                        View on IPFS
                      </Button>
                    </Tooltip>
                  </HStack>
                </Card>
              ))}
            </VStack>
          </Box>
        )}
      </Box>
    </div>
  );
}

export default BlockchainReviews; 