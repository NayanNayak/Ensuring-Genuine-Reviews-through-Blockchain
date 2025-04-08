import React, { useState, useEffect } from "react";
import {
  Card,
  Text,
  Image,
  Stack,
  Heading,
  CardBody,
  CardFooter,
  Divider,
  ButtonGroup,
  Button,
  Box,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import moment from "moment";
import { useBasket } from "../../contexts/BasketContext";
import StarRating from "../StarRating";
import { fetchProductRating } from "../../apiExtended";

function Cards({ item }) {
  const { addToBasket, items } = useBasket();
  const [rating, setRating] = useState({ overall_rating: 0, review_count: 0 });
  const [isLoadingRating, setIsLoadingRating] = useState(true);

  // Fetch the product rating when the component mounts
  useEffect(() => {
    const getRating = async () => {
      try {
        setIsLoadingRating(true);
        const ratingData = await fetchProductRating(item._id);
        setRating(ratingData);
      } catch (error) {
        console.error("Error fetching rating:", error);
      } finally {
        setIsLoadingRating(false);
      }
    };

    getRating();
  }, [item._id]);

  const findBasketItem = items.find(
    (basket_item) => basket_item._id === item._id
  );

  return (
    <Card maxW="sm">
      <Link to={`/product/${item._id}`}>
        <CardBody>
          <Image
            src={item.photos[0]}
            alt="Product"
            borderRadius="lg"
            loading="lazy"
            boxSize={300}
            objectFit="cover"
          />
          <Stack mt="6" spacing="3">
            <Heading size="md">{item.title}</Heading>
            <Box>
              {!isLoadingRating && (
                <StarRating 
                  rating={rating.overall_rating} 
                  reviewCount={rating.review_count}
                  size="sm"
                />
              )}
            </Box>
            <Text>{moment(item.createdAt).format("DD/MM/YYYY")}</Text>
            <Text color="blue.600" fontSize="2xl">
              {item.price}$
            </Text>
          </Stack>
        </CardBody>
        <Divider />
      </Link>
      <CardFooter>
        <ButtonGroup spacing="2">
          <Button
            variant="solid"
            colorScheme={findBasketItem ? "red" : "whatsapp"}
            bgColor={"green.400"}
            onClick={() => addToBasket(item, findBasketItem)}
          >
            {findBasketItem ? "Remove from Basket" : "Add to Basket"}
          </Button>
          <Button variant="ghost" colorScheme="blue">
            Add to cart
          </Button>
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
}

export default Cards;
