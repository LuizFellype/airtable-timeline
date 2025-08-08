/**
 * Assigns items to lanes in a compact way, ensuring items that don't overlap
 * can share the same lane. Items are sorted by start date first.
 * 
 * @param {Array} items - Array of timeline items with startDate, endDate, and other properties
 * @returns {Array} Array of items with assigned lane numbers
 */
export function assignLanes(items) {
  // Handle null, undefined, or empty arrays
  if (!items || !Array.isArray(items) || items.length === 0) {
    return [];
  }

  // Filter out invalid items and validate dates
  const validItems = items.filter(item => {
    if (!item || typeof item !== 'object') return false;
    if (!item.startDate || !item.endDate) return false;
    
    const startDate = new Date(item.startDate);
    const endDate = new Date(item.endDate);
    
    // Check for invalid dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;
    
    // Check that end date is not before start date
    if (endDate < startDate) return false;
    
    return true;
  });

  // If no valid items, return empty array
  if (validItems.length === 0) {
    return [];
  }

  // Sort items by start date, then by end date for consistent ordering
  const sortedItems = [...validItems].sort((a, b) => {
    const startCompare = new Date(a.startDate) - new Date(b.startDate);
    if (startCompare !== 0) return startCompare;
    return new Date(a.endDate) - new Date(b.endDate);
  });

  const lanes = [];
  const itemsWithLanes = [];

  for (const item of sortedItems) {
    const itemStart = new Date(item.startDate);
    const itemEnd = new Date(item.endDate);
    
    // Find the first available lane
    let assignedLane = -1;
    
    for (let laneIndex = 0; laneIndex < lanes.length; laneIndex++) {
      const lane = lanes[laneIndex];
      
      // Check if this item can fit in this lane
      // It can fit if it starts after the last item in the lane ends
      const lastItemInLane = lane[lane.length - 1];
      const lastItemEnd = new Date(lastItemInLane.endDate);
      
      // Add a small buffer (1 day) to prevent items from being too close
      const buffer = 24 * 60 * 60 * 1000; // 1 day in milliseconds
      
      if (itemStart.getTime() >= lastItemEnd.getTime() + buffer) {
        assignedLane = laneIndex;
        break;
      }
    }
    
    // If no existing lane works, create a new one
    if (assignedLane === -1) {
      assignedLane = lanes.length;
      lanes.push([]);
    }
    
    // Add item to the assigned lane
    const itemWithLane = { ...item, lane: assignedLane };
    lanes[assignedLane].push(itemWithLane);
    itemsWithLanes.push(itemWithLane);
  }

  return itemsWithLanes;
}
