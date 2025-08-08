import { assignLanes } from '../assignLanes.js';

describe('assignLanes', () => {
  // Helper function to create test items
  const createItem = (id, name, startDate, endDate, additionalProps = {}) => ({
    id,
    name,
    startDate,
    endDate,
    color: '#000000',
    ...additionalProps
  });

  describe('Basic functionality', () => {
    test('should return empty array for empty/null/undefined input', () => {
      expect(assignLanes(null)).toEqual([]);
      expect(assignLanes(undefined)).toEqual([]);
      expect(assignLanes([])).toEqual([]);
    });

    test('should assign single item to lane 0', () => {
      const items = [createItem(1, 'Item 1', '2025-01-01', '2025-01-05')];
      const result = assignLanes(items);
      
      expect(result).toHaveLength(1);
      expect(result[0].lane).toBe(0);
      expect(result[0].id).toBe(1);
    });

    test('should preserve all original item properties', () => {
      const items = [createItem(1, 'Item 1', '2025-01-01', '2025-01-05', { 
        customProp: 'test',
        color: '#ff0000'
      })];
      const result = assignLanes(items);
      
      expect(result[0]).toMatchObject({
        id: 1,
        name: 'Item 1',
        startDate: '2025-01-01',
        endDate: '2025-01-05',
        customProp: 'test',
        color: '#ff0000',
        lane: 0
      });
    });
  });

  describe('Lane assignment logic', () => {
    test('should assign non-overlapping items to same lane', () => {
      const items = [
        createItem(1, 'Item 1', '2025-01-01', '2025-01-05'),
        createItem(2, 'Item 2', '2025-01-07', '2025-01-10') // 1 day gap
      ];
      const result = assignLanes(items);
      
      expect(result).toHaveLength(2);
      expect(result[0].lane).toBe(0);
      expect(result[1].lane).toBe(0); // Should be in same lane due to gap
    });

    test('should assign overlapping items to different lanes', () => {
      const items = [
        createItem(1, 'Item 1', '2025-01-01', '2025-01-05'),
        createItem(2, 'Item 2', '2025-01-03', '2025-01-08') // Overlaps
      ];
      const result = assignLanes(items);
      
      expect(result).toHaveLength(2);
      expect(result[0].lane).toBe(0);
      expect(result[1].lane).toBe(1); // Should be in different lane
    });

    test('should handle items that touch (end date = start date)', () => {
      const items = [
        createItem(1, 'Item 1', '2025-01-01', '2025-01-05'),
        createItem(2, 'Item 2', '2025-01-05', '2025-01-10') // Touches
      ];
      const result = assignLanes(items);
      
      expect(result).toHaveLength(2);
      expect(result[0].lane).toBe(0);
      expect(result[1].lane).toBe(1); // Should be in different lane due to buffer
    });

    test('should handle buffer requirement correctly', () => {
      const items = [
        createItem(1, 'Item 1', '2025-01-01', '2025-01-05'),
        createItem(2, 'Item 2', '2025-01-06', '2025-01-10') // Exactly 1 day gap
      ];
      const result = assignLanes(items);
      
      expect(result).toHaveLength(2);
      expect(result[0].lane).toBe(0);
      expect(result[1].lane).toBe(0); // Should be in same lane (meets buffer requirement)
    });

    test('should assign multiple items to optimal lanes', () => {
      const items = [
        createItem(1, 'Item 1', '2025-01-01', '2025-01-05'),
        createItem(2, 'Item 2', '2025-01-03', '2025-01-08'), // Overlaps with 1
        createItem(3, 'Item 3', '2025-01-10', '2025-01-15'), // Can go in lane 0
        createItem(4, 'Item 4', '2025-01-12', '2025-01-18')  // Can go in lane 1
      ];
      const result = assignLanes(items);
      
      expect(result).toHaveLength(4);
      expect(result.find(item => item.id === 1).lane).toBe(0);
      expect(result.find(item => item.id === 2).lane).toBe(1);
      expect(result.find(item => item.id === 3).lane).toBe(0); // Reuses lane 0
      expect(result.find(item => item.id === 4).lane).toBe(1); // Reuses lane 1
    });
  });

  describe('Sorting behavior', () => {
    test('should sort items by start date', () => {
      const items = [
        createItem(3, 'Item 3', '2025-01-15', '2025-01-20'),
        createItem(1, 'Item 1', '2025-01-01', '2025-01-05'),
        createItem(2, 'Item 2', '2025-01-10', '2025-01-12')
      ];
      const result = assignLanes(items);
      
      // Should be sorted by start date in result
      expect(result[0].id).toBe(1); // 2025-01-01
      expect(result[1].id).toBe(2); // 2025-01-10
      expect(result[2].id).toBe(3); // 2025-01-15
    });

    test('should sort by end date when start dates are equal', () => {
      const items = [
        createItem(2, 'Item 2', '2025-01-01', '2025-01-10'), // Longer
        createItem(1, 'Item 1', '2025-01-01', '2025-01-05')  // Shorter
      ];
      const result = assignLanes(items);
      
      // Shorter item should come first
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    test('should maintain stable sort for identical dates', () => {
      const items = [
        createItem(1, 'Item 1', '2025-01-01', '2025-01-05'),
        createItem(2, 'Item 2', '2025-01-01', '2025-01-05'),
        createItem(3, 'Item 3', '2025-01-01', '2025-01-05')
      ];
      const result = assignLanes(items);
      
      // Should maintain original order for identical dates
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
      expect(result[2].id).toBe(3);
    });
  });

  describe('Edge cases and error handling', () => {
    test('should handle invalid input types', () => {
      expect(assignLanes('not an array')).toEqual([]);
      expect(assignLanes(123)).toEqual([]);
      expect(assignLanes({})).toEqual([]);
      expect(assignLanes(true)).toEqual([]);
    });

    test('should filter out null/undefined items', () => {
      const items = [
        createItem(1, 'Item 1', '2025-01-01', '2025-01-05'),
        null,
        undefined,
        createItem(2, 'Item 2', '2025-01-10', '2025-01-15')
      ];
      const result = assignLanes(items);
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    test('should filter out items with missing dates', () => {
      const items = [
        createItem(1, 'Item 1', '2025-01-01', '2025-01-05'),
        { id: 2, name: 'Item 2' }, // Missing dates
        { id: 3, name: 'Item 3', startDate: '2025-01-01' }, // Missing end date
        { id: 4, name: 'Item 4', endDate: '2025-01-05' }, // Missing start date
        createItem(5, 'Item 5', '2025-01-10', '2025-01-15')
      ];
      const result = assignLanes(items);
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(5);
    });

    test('should filter out items with invalid dates', () => {
      const items = [
        createItem(1, 'Item 1', '2025-01-01', '2025-01-05'),
        createItem(2, 'Item 2', 'invalid-date', '2025-01-10'),
        createItem(3, 'Item 3', '2025-01-01', 'invalid-date'),
        createItem(4, 'Item 4', '2025-13-45', '2025-01-10'), // Invalid month/day
        createItem(5, 'Item 5', '2025-01-10', '2025-01-15')
      ];
      const result = assignLanes(items);
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(5);
    });

    test('should filter out items where end date is before start date', () => {
      const items = [
        createItem(1, 'Item 1', '2025-01-01', '2025-01-05'),
        createItem(2, 'Item 2', '2025-01-10', '2025-01-05'), // End before start
        createItem(3, 'Item 3', '2025-01-15', '2025-01-20')
      ];
      const result = assignLanes(items);
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(3);
    });

    test('should handle same-day items', () => {
      const items = [
        createItem(1, 'Item 1', '2025-01-01', '2025-01-01'),
        createItem(2, 'Item 2', '2025-01-01', '2025-01-01')
      ];
      const result = assignLanes(items);
      
      expect(result).toHaveLength(2);
      expect(result[0].lane).toBe(0);
      expect(result[1].lane).toBe(1); // Should be in different lane due to buffer
    });

    test('should handle items with non-standard object properties', () => {
      const items = [
        { ...createItem(1, 'Item 1', '2025-01-01', '2025-01-05'), extraProp: 'test' },
        { ...createItem(2, 'Item 2', '2025-01-10', '2025-01-15'), anotherProp: { nested: true } }
      ];
      const result = assignLanes(items);
      
      expect(result).toHaveLength(2);
      expect(result[0].extraProp).toBe('test');
      expect(result[1].anotherProp).toEqual({ nested: true });
    });
  });

  describe('Complex scenarios', () => {
    test('should handle many overlapping items', () => {
      const items = Array.from({ length: 10 }, (_, i) => 
        createItem(i + 1, `Item ${i + 1}`, '2025-01-01', '2025-01-10')
      );
      const result = assignLanes(items);
      
      expect(result).toHaveLength(10);
      // All items should be in different lanes since they all overlap
      const lanes = result.map(item => item.lane);
      const uniqueLanes = [...new Set(lanes)];
      expect(uniqueLanes).toHaveLength(10);
    });

    test('should handle interleaved non-overlapping items', () => {
      const items = [
        createItem(1, 'Item 1', '2025-01-01', '2025-01-03'),
        createItem(2, 'Item 2', '2025-01-05', '2025-01-07'),
        createItem(3, 'Item 3', '2025-01-09', '2025-01-11'),
        createItem(4, 'Item 4', '2025-01-13', '2025-01-15')
      ];
      const result = assignLanes(items);
      
      expect(result).toHaveLength(4);
      // All items should be in the same lane since none overlap
      result.forEach(item => {
        expect(item.lane).toBe(0);
      });
    });

    test('should handle mixed overlapping and non-overlapping items', () => {
      const items = [
        createItem(1, 'A', '2025-01-01', '2025-01-05'),
        createItem(2, 'B', '2025-01-03', '2025-01-08'), // Overlaps with A
        createItem(3, 'C', '2025-01-10', '2025-01-15'), // Can reuse lane 0
        createItem(4, 'D', '2025-01-12', '2025-01-18'), // Can reuse lane 1
        createItem(5, 'E', '2025-01-20', '2025-01-25'), // Can reuse lane 0
        createItem(6, 'F', '2025-01-22', '2025-01-28')  // Can reuse lane 1
      ];
      const result = assignLanes(items);
      
      expect(result).toHaveLength(6);
      
      const itemA = result.find(item => item.name === 'A');
      const itemB = result.find(item => item.name === 'B');
      const itemC = result.find(item => item.name === 'C');
      const itemD = result.find(item => item.name === 'D');
      const itemE = result.find(item => item.name === 'E');
      const itemF = result.find(item => item.name === 'F');
      
      expect(itemA.lane).toBe(0);
      expect(itemB.lane).toBe(1);
      expect(itemC.lane).toBe(0); // Reuses lane 0
      expect(itemD.lane).toBe(1); // Reuses lane 1
      expect(itemE.lane).toBe(0); // Reuses lane 0
      expect(itemF.lane).toBe(1); // Reuses lane 1
    });

    test('should handle items spanning different years', () => {
      const items = [
        createItem(1, 'Item 1', '2024-12-15', '2025-01-15'),
        createItem(2, 'Item 2', '2025-01-01', '2025-02-01'),
        createItem(3, 'Item 3', '2025-03-01', '2025-04-01')
      ];
      const result = assignLanes(items);
      
      expect(result).toHaveLength(3);
      expect(result[0].lane).toBe(0); // 2024-12-15
      expect(result[1].lane).toBe(1); // Overlaps with first
      expect(result[2].lane).toBe(0); // Can reuse lane 0
    });

    test('should handle very large number of items efficiently', () => {
      const items = Array.from({ length: 1000 }, (_, i) => {
        const startDate = new Date(2025, 0, 1 + Math.floor(i / 10));
        const endDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days later
        return createItem(
          i + 1, 
          `Item ${i + 1}`, 
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );
      });
      
      const startTime = performance.now();
      const result = assignLanes(items);
      const endTime = performance.now();
      
      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
      
      // Verify lane assignment is correct
      result.forEach(item => {
        expect(typeof item.lane).toBe('number');
        expect(item.lane).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Date format handling', () => {
    test('should handle different valid date formats', () => {
      const items = [
        createItem(1, 'Item 1', '2025-01-01', '2025-01-05'),
        createItem(2, 'Item 2', '2025-1-1', '2025-1-5'), // Single digit month/day
        createItem(3, 'Item 3', '2025-12-31', '2025-12-31') // Same day
      ];
      const result = assignLanes(items);
      
      expect(result).toHaveLength(3);
      result.forEach(item => {
        expect(typeof item.lane).toBe('number');
        expect(item.lane).toBeGreaterThanOrEqual(0);
      });
    });

    test('should handle leap year dates', () => {
      const items = [
        createItem(1, 'Item 1', '2024-02-28', '2024-02-29'), // Leap year
        createItem(2, 'Item 2', '2024-03-01', '2024-03-05')
      ];
      const result = assignLanes(items);
      
      expect(result).toHaveLength(2);
      expect(result[0].lane).toBe(0);
      expect(result[1].lane).toBe(0); // Should be able to share lane
    });
  });
});
