import { useMemo } from 'react';

/**
 * Custom hook that rotates items daily based on the current date
 * @param {Array} items - Array of items to rotate
 * @param {number} count - Number of items to return
 * @returns {Array} Rotated selection of items
 */
const useDailyRotation = (items, count) => {
  return useMemo(() => {
    if (!items || items.length === 0) return [];
    if (count >= items.length) return items;

    // Get the current date and use it as a seed for rotation
    const today = new Date();
    const dayOfYear = Math.floor(
      (today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
    );

    // Use day of year as offset to rotate items daily
    const startIndex = dayOfYear % items.length;
    
    // Get rotated items
    const rotated = [];
    for (let i = 0; i < count; i++) {
      const index = (startIndex + i) % items.length;
      rotated.push(items[index]);
    }

    return rotated;
  }, [items, count]);
};

export default useDailyRotation;

