import { Box, Link as ChakraLink, Flex, Button } from "@chakra-ui/react";
import * as React from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import NextLink from "next/link";

interface NavBarProps {}

const NavBar: React.FunctionComponent<NavBarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  }); // graphql hook to check if user is logged in (fetches current user)

  // Since navbar is rendered on index page it is getting server side rendered
  // therefore pause:true; so that it does not fetch the user data on the server side

  let body = null;

  if (fetching) {
    // data is loading
    body = null;
  } else if (!data?.me) {
    // user not logged in
    body = (
      <>
        <NextLink href="/login" passHref>
          <ChakraLink mr={2}>login</ChakraLink>
        </NextLink>
        <NextLink href="/register" passHref>
          <ChakraLink>register</ChakraLink>
        </NextLink>
      </>
    );
  } else {
    // user is logged in
    body = (
      <Flex>
        <Box>{data.me.username}</Box>
        <Button
          variant="link"
          ml={4}
          onClick={() => logout({})}
          isLoading={logoutFetching}
        >
          logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bg="tan" p={4} color="white">
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};

export default NavBar;
