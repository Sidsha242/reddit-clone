import { Box } from "@chakra-ui/react";
import * as React from "react";

interface WrapperProps {
  variant?: "small" | "regular"; //optional
  children: React.ReactNode;
}

const Wrapper: React.FunctionComponent<WrapperProps> = ({
  children,
  variant = "regular",
}) => {
  return (
    <Box
      mt={8}
      mx="auto"
      maxW={variant === "regular" ? "800px" : "400px"}
      w="100%"
    >
      {children}
    </Box>
  );
};

export default Wrapper;
