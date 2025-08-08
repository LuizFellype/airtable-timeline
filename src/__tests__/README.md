# assignLanes Function Tests

This test suite provides comprehensive coverage for the `assignLanes` function, including all edge cases and error conditions.

## Test Categories

### 1. Basic Functionality Tests
- **Empty/null inputs**: Handles null, undefined, and empty arrays
- **Single item**: Correctly assigns single item to lane 0
- **Property preservation**: Maintains all original item properties

### 2. Lane Assignment Logic Tests
- **Non-overlapping items**: Items with gaps share the same lane
- **Overlapping items**: Items that overlap get assigned to different lanes
- **Touching items**: Items that touch (end = start) are handled with buffer
- **Buffer requirement**: 1-day buffer between items is enforced
- **Multi-item optimization**: Complex scenarios with multiple items and lane reuse

### 3. Sorting Behavior Tests
- **Start date sorting**: Items are processed in chronological order
- **End date tiebreaker**: When start dates are equal, shorter items come first
- **Stable sorting**: Identical items maintain their original order

### 4. Edge Cases and Error Handling Tests
- **Invalid input types**: Non-array inputs return empty array
- **Null/undefined items**: Invalid items are filtered out
- **Missing dates**: Items without startDate or endDate are filtered out
- **Invalid dates**: Items with unparseable dates are filtered out
- **Backwards dates**: Items where endDate < startDate are filtered out
- **Same-day items**: Items that start and end on the same day

### 5. Complex Scenarios Tests
- **Many overlapping items**: Performance with multiple overlapping items
- **Interleaved items**: Non-overlapping items that can all share one lane
- **Mixed scenarios**: Combination of overlapping and non-overlapping items
- **Cross-year items**: Items spanning different years
- **Performance test**: 1000+ items processed efficiently

### 6. Date Format Handling Tests
- **Various formats**: Different valid date string formats
- **Leap years**: Proper handling of February 29th
- **Edge dates**: Year boundaries and month boundaries

## Coverage Goals

The test suite aims for:
- **100% line coverage**: Every line of code is executed
- **100% branch coverage**: Every conditional path is tested
- **100% function coverage**: All functions are called
- **Edge case coverage**: All error conditions and edge cases are tested

## Running Tests

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only assignLanes tests
npm test -- assignLanes
\`\`\`

## Test Data Patterns

The tests use several patterns for creating test data:

1. **Basic items**: Standard items with all required properties
2. **Invalid items**: Items missing required properties or with invalid data
3. **Edge case items**: Items that test boundary conditions
4. **Performance items**: Large datasets for performance testing

## Key Test Scenarios

### Lane Assignment Verification
\`\`\`javascript
// Items A and C should share lane 0, B should be in lane 1
A: [Jan 1-5]     C: [Jan 10-15]
B:   [Jan 3-8]
\`\`\`

### Buffer Testing
\`\`\`javascript
// These items should be in different lanes due to 1-day buffer
Item 1: [Jan 1-5]
Item 2: [Jan 5-10]  // Touches, needs buffer

// These items can share a lane
Item 1: [Jan 1-5]
Item 2: [Jan 7-10]  // 1+ day gap
\`\`\`

### Error Handling
- Null/undefined inputs
- Invalid date strings
- Missing properties
- Backwards date ranges
- Non-object items

The test suite ensures the `assignLanes` function is robust, performant, and handles all possible input scenarios gracefully.
