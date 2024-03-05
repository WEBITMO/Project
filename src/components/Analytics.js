import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Analytics = () => {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    window.gtag('config', 'G-PXYMLQK9RJ', {
      'page_path': currentPath
    });
  }, [location]);

  return null;
};

export default Analytics;
