import * as React from "react";
import NavBar from "./Navbar";
import Wrapper from "./Wrapper";

interface LayoutProps {
  variant?: "small" | "regular";
  children?: React.ReactNode;
}

const Layout: React.FunctionComponent<LayoutProps> = ({
  children,
  variant,
}) => {
  return (
    <>
      <NavBar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </>
  );
};

export default Layout;
