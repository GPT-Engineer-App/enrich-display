import React from "react";
import { Container, VStack, Text } from "@chakra-ui/react";
import Navigation from "../components/Navigation.jsx";

const ToggleItems = () => {
  return (
    <Container maxW="container.lg" py={10}>
      <Navigation />
      <VStack spacing={8} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">
          Toggle Items
        </Text>
        <Text>Content for toggle items goes here...</Text>
      </VStack>
    </Container>
  );
};

export default ToggleItems;
