import { useState, useCallback } from 'react';

export function useRazorpay() {
  const [isLoaded, setIsLoaded] = useState(false);

  const loadRazorpay = useCallback(() => {
    return new Promise((resolve) => {
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        setIsLoaded(true);
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }, []);

  return { loadRazorpay, isLoaded };
}
