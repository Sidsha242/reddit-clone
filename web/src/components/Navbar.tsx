import { Box, Flex, Button } from "@chakra-ui/react";
import * as React from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import Link from "next/link";

const NavBar: React.FunctionComponent<{}> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  }); // graphql hook to check if user is logged in (fetches current user)

  return (
    <>
      <Flex bg="tan" p={4} position={"sticky"} top={0} zIndex={1}>
        <Box ml={"auto"}>
          {data?.me ? (
            <>
              <Box mr={2}>{data.me.username}</Box>
              <Button
                onClick={() => {
                  logout({});
                }}
                isLoading={logoutFetching}
                variant="link"
              >
                Logout
              </Button>
            </>
          ) : (
            <Flex>
              <Box>
                <Link href="/login">Login</Link>
              </Box>
              <Box ml={2}>
                <Link href="/register">Register</Link>
              </Box>
            </Flex>
          )}
        </Box>
      </Flex>
    </>
  );
};

export default NavBar;
