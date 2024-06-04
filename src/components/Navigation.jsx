import React from "react";
import { HStack, Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <HStack spacing={4} mb={8}>
      <Button as={Link} to="/" colorScheme="teal">
        Home
      </Button>
      <Button as={Link} to="/toggle-items" colorScheme="teal">
        Toggle Items
      </Button>
    </HStack>
  );
};

export default Navigation;
