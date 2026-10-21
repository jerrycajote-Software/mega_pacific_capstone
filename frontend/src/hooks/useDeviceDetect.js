import { useState, useEffect } from 'react';
import { isMobileBrowser } from '../utils/deviceDetect';

export const useIsMobileBrowser = () => {
  const [isMobile, setIsMobile] = useState(() => isMobileBrowser());

  useEffect(() => {
    const handleCheck = () => {
      setIsMobile(isMobileBrowser());
    };

    window.addEventListener('resize', handleCheck);
    window.addEventListener('orientationchange', handleCheck);

    return () => {
      window.removeEventListener('resize', handleCheck);
      window.removeEventListener('orientationchange', handleCheck);
    };
  }, []);

  return isMobile;
};

export default useIsMobileBrowser;
