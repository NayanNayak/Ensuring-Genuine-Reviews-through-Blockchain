import React from 'react';
import { useQuery } from 'react-query';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Tooltip,
  Flex,
  Icon,
  useClipboard,
  Button,
} from '@chakra-ui/react';
import { fetchUserDeliveries } from '../../api';
import { FaInfoCircle, FaCopy, FaCheckCircle } from 'react-icons/fa';

function DeliveryList() {
  const { isLoading, error, data } = useQuery('userDeliveries', fetchUserDeliveries);

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Error loading deliveries: {error.message}
      </Alert>
    );
  }

  // If no deliveries found
  if (!data || data.length === 0) {
    return (
      <Box mt={5}>
        <Heading size="md" mb={4}>My Deliveries</Heading>
        <Alert status="info">
          <AlertIcon />
          You don't have any deliveries yet.
        </Alert>
      </Box>
    );
  }

  return (
    <Box mt={5}>
      <Heading size="md" mb={4}>My Deliveries</Heading>
      
      <Box mb={4} p={4} borderWidth="1px" borderRadius="md" bg="blue.50">
        <Flex align="center">
          <Icon as={FaInfoCircle} color="blue.500" mr={2} />
          <Text fontSize="sm">
            Your Standard Delivery Codes (SDCs) are listed below. Use these codes when submitting product reviews.
          </Text>
        </Flex>
      </Box>
      
      <Table variant="simple" size="sm" borderWidth="1px" borderRadius="md">
        <Thead bg="gray.100">
          <Tr>
            <Th>Product</Th>
            <Th>Order ID</Th>
            <Th>Delivery Status</Th>
            <Th>SDC</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((delivery) => (
            <SDCRow key={delivery._id} delivery={delivery} />
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}

// Separate component for each row to handle clipboard functionality
function SDCRow({ delivery }) {
  const { hasCopied, onCopy } = useClipboard(
    delivery.standard_delivery_code || ""
  );

  return (
    <Tr>
      <Td>
        <Tooltip label={`Product ID: ${delivery.product._id}`} placement="top">
          <Text fontWeight="medium">{delivery.product.title || 'Product'}</Text>
        </Tooltip>
      </Td>
      <Td>
        <Text fontSize="sm" color="gray.600">
          {delivery.order._id ? delivery.order._id.substring(0, 8) + '...' : delivery.order}
        </Text>
      </Td>
      <Td>
        <Badge
          colorScheme={
            delivery.delivery_status === 'Delivered'
              ? 'green'
              : delivery.delivery_status === 'In Progress'
              ? 'yellow'
              : 'gray'
          }
          px={2}
          py={1}
          borderRadius="full"
        >
          {delivery.delivery_status}
        </Badge>
      </Td>
      <Td>
        {delivery.standard_delivery_code ? (
          <Flex align="center">
            <Text fontWeight="bold" color="blue.600" letterSpacing="wider">
              {delivery.standard_delivery_code}
            </Text>
          </Flex>
        ) : (
          <Text color="gray.500">Not available yet</Text>
        )}
      </Td>
      <Td>
        {delivery.standard_delivery_code && (
          <Button
            size="xs"
            leftIcon={hasCopied ? <FaCheckCircle /> : <FaCopy />}
            onClick={onCopy}
            colorScheme={hasCopied ? "green" : "gray"}
            variant="outline"
          >
            {hasCopied ? "Copied" : "Copy SDC"}
          </Button>
        )}
      </Td>
    </Tr>
  );
}

export default DeliveryList; 