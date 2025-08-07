// Mobile debugging utilities

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  isMobile: boolean;
  isTouch: boolean;
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  pixelRatio: number;
  orientation: string;
  connection?: any;
}

export function getDeviceInfo(): DeviceInfo {
  const nav = navigator as any;
  
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    screenWidth: screen.width,
    screenHeight: screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1,
    orientation: screen.orientation?.type || 'unknown',
    connection: nav.connection || nav.mozConnection || nav.webkitConnection,
  };
}

export function logDeviceInfo() {
  const info = getDeviceInfo();
  console.group('📱 Device Information');
  console.log('User Agent:', info.userAgent);
  console.log('Platform:', info.platform);
  console.log('Is Mobile:', info.isMobile);
  console.log('Is Touch Device:', info.isTouch);
  console.log('Screen:', `${info.screenWidth}x${info.screenHeight}`);
  console.log('Viewport:', `${info.viewportWidth}x${info.viewportHeight}`);
  console.log('Pixel Ratio:', info.pixelRatio);
  console.log('Orientation:', info.orientation);
  if (info.connection) {
    console.log('Connection:', info.connection.effectiveType || 'unknown');
  }
  console.groupEnd();
}

export function detectMobileIssues(): string[] {
  const issues: string[] = [];
  const info = getDeviceInfo();

  // Check for common mobile issues
  if (info.viewportWidth < 320) {
    issues.push('Viewport width is very small (< 320px)');
  }

  if (info.pixelRatio > 3) {
    issues.push('Very high pixel ratio may cause performance issues');
  }

  if (typeof window.orientation !== 'undefined' && !screen.orientation) {
    issues.push('Orientation API not fully supported');
  }

  // Check for service worker support
  if (!('serviceWorker' in navigator)) {
    issues.push('Service Worker not supported');
  }

  // Check for localStorage
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
  } catch (e) {
    issues.push('localStorage not available (private browsing?)');
  }

  // Check for fetch API
  if (!window.fetch) {
    issues.push('Fetch API not supported');
  }

  // Check for modern JS features
  if (!window.Promise) {
    issues.push('Promises not supported');
  }

  // Check memory constraints (if available)
  if ('memory' in performance && (performance as any).memory) {
    const memory = (performance as any).memory;
    if (memory.totalJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
      issues.push('High memory usage detected');
    }
  }

  return issues;
}

export function setupMobileErrorReporting() {
  // Enhanced error reporting for mobile
  const originalConsoleError = console.error;
  console.error = function(...args) {
    // Call original console.error
    originalConsoleError.apply(console, args);
    
    // Additional mobile-specific logging
    if (getDeviceInfo().isMobile) {
      try {
        const errorData = {
          timestamp: new Date().toISOString(),
          deviceInfo: getDeviceInfo(),
          error: args[0]?.toString() || 'Unknown error',
          stack: args[0]?.stack || 'No stack trace',
          url: window.location.href,
        };
        
        // Store in localStorage for debugging
        const existingErrors = JSON.parse(localStorage.getItem('mobile_errors') || '[]');
        existingErrors.push(errorData);
        
        // Keep only last 10 errors
        if (existingErrors.length > 10) {
          existingErrors.splice(0, existingErrors.length - 10);
        }
        
        localStorage.setItem('mobile_errors', JSON.stringify(existingErrors));
      } catch (e) {
        // Ignore errors in error reporting
      }
    }
  };
}

export function getMobileErrors(): any[] {
  try {
    return JSON.parse(localStorage.getItem('mobile_errors') || '[]');
  } catch (e) {
    return [];
  }
}

export function clearMobileErrors() {
  try {
    localStorage.removeItem('mobile_errors');
  } catch (e) {
    // Ignore
  }
}

export function runMobileDiagnostics() {
  console.group('🔍 Mobile Diagnostics');
  
  logDeviceInfo();
  
  const issues = detectMobileIssues();
  if (issues.length > 0) {
    console.group('⚠️ Potential Issues');
    issues.forEach(issue => console.warn(issue));
    console.groupEnd();
  } else {
    console.log('✅ No obvious issues detected');
  }
  
  const errors = getMobileErrors();
  if (errors.length > 0) {
    console.group('🐛 Recent Errors');
    errors.forEach(error => {
      console.error(`${error.timestamp}: ${error.error}`);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
  
  return {
    deviceInfo: getDeviceInfo(),
    issues,
    recentErrors: errors,
  };
}

// Initialize mobile debugging in development
if (process.env.NODE_ENV === 'development') {
  setupMobileErrorReporting();
  
  // Auto-run diagnostics on mobile devices
  if (getDeviceInfo().isMobile) {
    setTimeout(() => {
      runMobileDiagnostics();
    }, 1000);
  }
}

// Expose debugging functions globally in development
if (process.env.NODE_ENV === 'development') {
  (window as any).mobileDebug = {
    getDeviceInfo,
    logDeviceInfo,
    detectMobileIssues,
    runMobileDiagnostics,
    getMobileErrors,
    clearMobileErrors,
  };
}
