// useCountUp.js
import React, { useState, useEffect, useRef } from 'react';

/**
 * Custom React Hook for a count-up animation.
 * @param {number} end - The final number to reach (e.g., 300, 450, 20000)
 * @param {number} duration - The duration of the animation in milliseconds
 * @param {number} start - The starting number (default is 0)
 */
const useCountUp = (end, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start);
  const startTimeRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    // Clean up function to cancel any pending animation frame
    const cleanup = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    const step = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1); // 0 to 1

      // Easing function (easeOutQuad) for smoother look
      const easedProgress = progress * progress * (3 - 2 * progress); // Optional: add this for a smoother slow-down at the end

      // Calculate the current value
      const currentValue = start + (end - start) * easedProgress;

      setCount(Math.floor(currentValue));

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        // Ensure the final value is exactly the 'end' value
        setCount(end);
      }
    };

    // Start the animation
    animationFrameRef.current = requestAnimationFrame(step);

    // Return the cleanup function
    return cleanup;
  }, [end, duration, start]);

  return count;
};

export default useCountUp;