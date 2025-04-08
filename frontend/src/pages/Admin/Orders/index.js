import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  Text,
  Button,
  useToast,
  Badge,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../style.css";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { fetchOrders, markOrderAsDelivered } from "../../../api";

function Orders() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [processingOrderId, setProcessingOrderId] = useState(null);

  const { isLoading, isError, data, error } = useQuery(
    "admin:orders",
    fetchOrders
  );

  // Mutation for marking an order as delivered
  const deliverMutation = useMutation(
    (order_id) => markOrderAsDelivered(order_id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("admin:orders");
        toast({
          title: "Success",
          description: "Order marked as delivered and SDC generated",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setProcessingOrderId(null); // Reset processing state
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "An error occurred",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setProcessingOrderId(null); // Reset processing state even on error
      },
    }
  );

  const handleDeliver = (order_id) => {
    if (processingOrderId) {
      // If another order is already being processed, show a warning
      toast({
        title: "Please wait",
        description: "Another order is currently being processed",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setProcessingOrderId(order_id);
    deliverMutation.mutate(order_id);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error {error.message}</div>;
  }
  
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
      <Box mt={10}>
        <Text fontSize="2xl" p={5}>
          Orders
        </Text>

        <Table variant="simple">
          <TableCaption>Orders Management</TableCaption>
          <Thead>
            <Tr>
              <Th>User</Th>
              <Th>Address</Th>
              <Th>Items</Th>
              <Th>Delivery Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((item) => {
              // Check if this order has any deliveries
              const isDelivered = item.deliveryStatus === "Delivered";
              
              return (
                <Tr key={item._id}>
                  {item.user === null ? (
                    <Td>No Name</Td>
                  ) : (
                    <Td>{item.user.email}</Td>
                  )}
                  <Td>{item.adress}</Td>
                  <Td isNumeric>{item.items.length}</Td>
                  <Td>
                    <Badge
                      colorScheme={isDelivered ? "green" : "yellow"}
                    >
                      {isDelivered ? "Delivered" : "Pending"}
                    </Badge>
                  </Td>
                  <Td>
                    <Button
                      colorScheme="green"
                      size="sm"
                      onClick={() => handleDeliver(item._id)}
                      isLoading={processingOrderId === item._id}
                      isDisabled={isDelivered || processingOrderId !== null}
                    >
                      {isDelivered ? "Already Delivered" : "Mark as Delivered"}
                    </Button>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    </div>
  );
}

export default Orders;
