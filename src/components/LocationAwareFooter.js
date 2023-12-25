import {useLocation} from "react-router-dom";
import Footer from "./Footer";
import React from "react";

const LocationAwareFooter = () => {
  const location = useLocation();

  if (location.pathname === '/chat' || location.pathname === '/image' || location.pathname === '/audio') {

    return null;
  }

  return <Footer />;
};

export default LocationAwareFooter;
