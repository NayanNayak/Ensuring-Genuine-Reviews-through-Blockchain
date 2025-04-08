import React from "react";
import Cards from "../../components/Card";
import { Grid, Box, Flex, Button, Text, Center } from "@chakra-ui/react";
import { useInfiniteQuery } from "react-query";
import { fetchProductList } from "../../api.js";

function Products() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery("products", fetchProductList, {
    getNextPageParam: (lastGroup, allGroups) => {
      const morePagesExist = lastGroup?.length === 12;

      if (!morePagesExist) {
        return;
      } else {
        return allGroups.length + 1;
      }
    },
  });

  if (status === "loading") return (
    <Center h="200px">
      <Text>Loading products...</Text>
    </Center>
  );

  if (status === "error") return (
    <Center h="200px">
      <Text color="red.500">An error has occurred: {error.message}</Text>
    </Center>
  );

  return (
    <div>
      <div className="products">
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
          {data.pages.map((group, i) => (
            <React.Fragment key={i}>
              {group.map((item) => (
                <Box w="100%" key={item._id}>
                  <Cards item={item} />
                </Box>
              ))}
            </React.Fragment>
          ))}
        </Grid>
      </div>
      <Flex mt="10" justifyContent="center">
        <Button
          onClick={() => fetchNextPage()}
          isLoading={isFetchingNextPage}
          disabled={!hasNextPage || isFetchingNextPage}
        >
          {isFetchingNextPage
            ? "Loading more..."
            : hasNextPage
            ? "Load More"
            : "Nothing more to load"}
        </Button>
      </Flex>
    </div>
  );
}

export default Products;
