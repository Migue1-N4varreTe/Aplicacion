import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === 'undefined') {
      return;
    }

    const checkIsMobile = () => {
      return window.innerWidth < MOBILE_BREAKPOINT;
    };

    // Set initial value
    setIsMobile(checkIsMobile());

    // Create media query for better performance
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    // Modern browsers
    if (mql.addEventListener) {
      const handleChange = (e: MediaQueryListEvent) => {
        setIsMobile(e.matches);
      };
      
      mql.addEventListener("change", handleChange);
      return () => mql.removeEventListener("change", handleChange);
    } 
    // Fallback for older browsers
    else if (mql.addListener) {
      const handleChange = () => {
        setIsMobile(checkIsMobile());
      };
      
      mql.addListener(handleChange);
      return () => {
        if (mql.removeListener) {
          mql.removeListener(handleChange);
        }
      };
    }
    
    // Fallback with resize listener
    const handleResize = () => {
      setIsMobile(checkIsMobile());
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return !!isMobile;
}

// Additional hook for device detection
export function useDeviceType() {
  const [deviceType, setDeviceType] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const updateDeviceType = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent;
      
      // Check for mobile devices via user agent
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      
      if (width < 768 || (isMobileUA && width < 1024)) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    updateDeviceType();
    
    const handleResize = () => {
      updateDeviceType();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return deviceType;
}

// Hook for checking if touch device
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const checkTouch = () => {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      );
    };

    setIsTouch(checkTouch());
  }, []);

  return isTouch;
}
