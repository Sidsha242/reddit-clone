import NavBar from "../components/Navbar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import Layout from "../components/Layout";
import NextLink from "next/link";
import { Box, Button } from "@chakra-ui/react";

//This page is server side rendered

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <Layout>
      <NextLink href="/create-post" passHref>
        <Button
          bg="red.500"
          color="white"
          borderRadius="md"
          fontWeight="medium"
          _hover={{ bg: "red.600" }}
        >
          Create Post
        </Button>
      </NextLink>
      <br></br>
      <Box mt={10}>
        {!data ? (
          <div>loading...</div>
        ) : (
          data.posts.map((p) => <div key={p.id}>{p.title}</div>)
        )}
      </Box>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);

//SSR: Server Side Rendering
//When not server side rendering, the page is rendered on the client side i.e. fetching the items on the browser

//If you slow this down by using a slow 3G network, you will see the page load without the data first, then the data will load in

//In server side rendering, the data is rendered on the server and then sent to the client

//Bad for SEO : as if you look at the page source you will see the data is not there

//So if we want data to be shown up on google we should use server side rendering like this page , but for something like login page its not required
