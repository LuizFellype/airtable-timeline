# Interactive Timeline Component

A React-based timeline component that visualizes items in horizontal lanes with compact, space-efficient layout. Items that don't overlap in time can share the same lane, making optimal use of vertical space.

## How to run
- pnpm install
- pnpm run dev

To run tests:
- pnpm run test

## Features

### Core Functionality
- **Compact Lane Assignment**: Items are automatically arranged in lanes, with non-overlapping items sharing lanes to minimize vertical space
- **Horizontal Timeline Layout**: Clean, intuitive left-to-right timeline visualization
- **Date Range Support**: Handles YYYY-MM-DD date strings with automatic timeline bounds calculation

### Interactive Features
- **Zoom Controls**: Zoom in/out to get different levels of detail (20% to 500% zoom)
- **Drag and Drop**: Move items along the timeline by dragging
- **Resize Items**: Drag the left or right edges of items to change start/end dates
- **Inline Editing**: Double-click item names to edit them directly
- **Real-time Updates**: All changes are immediately reflected in the timeline

### Visual Design
- **Color-coded Items**: Each item has a distinct color for easy identification
- **Time Markers**: Monthly markers with clear date labels
- **Duration Display**: Shows item duration in days
- **Responsive Layout**: Horizontal scrolling for large timelines
- **Hover Effects**: Visual feedback for interactive elements

## What I Like About This Implementation

1. **Clean Separation of Concerns**: The lane assignment logic is separated into its own module, making it testable and reusable.

2. **Intuitive User Experience**: The drag-and-drop interface feels natural, with visual cues for different interaction types (move vs resize).

3. **Efficient Space Usage**: The compact lane algorithm ensures minimal vertical space while maintaining readability.

4. **Real-time Feedback (optmistic UX)**: All interactions provide immediate visual feedback, making the component feel responsive.

5. **Flexible Data Structure**: Simple item format that's easy to integrate with existing data sources.

## What I Would Change If I Did It Again

- **Modularize the code**: Separate logic from UI and architect better some resuable components.

1. **Virtual Scrolling**: For very large datasets, finish implementing virtual scrolling to render only items within viewport.

2. **Better Mobile Support**: Add touch gesture support and mobile-optimized interactions.

3. **Accessibility Improvements**: Add keyboard navigation, ARIA labels, and screen reader support.

4. **Undo/Redo System**: Implement command pattern for undoing changes.

5. **Conflict Resolution**: Better handling of overlapping items and validation of date changes.

6. **Improve UI**: all functionalities works but the UI could be more pleasing to improve UX.

## Design Decisions

### Lane Assignment Algorithm
I chose a greedy algorithm that processes items chronologically and assigns each to the first available lane. This provides good space efficiency while being simple to understand and debug.

### Interaction Model
- **Drag to Move**: Most intuitive for repositioning items
- **Edge Resize**: Common pattern from calendar applications
- **Double-click Edit**: Standard pattern for inline editing

### Visual Design Inspiration
- **Google Calendar**: Timeline view and drag interactions
- **Gantt Charts**: Horizontal bar representation and lane concept
- **GitHub Insights**: Clean, minimal timeline aesthetic

### Technology Choices
- **React Hooks**: Modern React patterns for state management
- **CSS-in-JS via Tailwind**: Consistent styling with utility classes
- **Date Calculations**: Native Date objects for simplicity (would use date-fns for production)

## Testing Strategy

If I had more time, I would implement:

### Unit Tests
- Lane assignment algorithm with various edge cases
- Date calculation utilities
- Item validation functions

### Integration Tests
- Drag and drop interactions
- Zoom functionality
- Inline editing workflows

### Visual Regression Tests
- Timeline rendering with different data sets
- Responsive behavior at different screen sizes
- Zoom level visual consistency

### Accessibility Tests
- Keyboard navigation
- Screen reader compatibility
- Color contrast validation

### Performance Tests
- Large dataset rendering (1000+ items)
- Memory usage during interactions
- Smooth animation performance

## Usage

\`\`\`tsx
import Timeline from './components/Timeline';
import { timelineItems } from './src/timelineItems';

function App() {
  const [items, setItems] = useState(timelineItems);

  const handleItemUpdate = (updatedItem) => {
    setItems(prev => prev.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
  };

  return (
    <Timeline 
      items={items} 
      onItemUpdate={handleItemUpdate}
    />
  );
}
\`\`\`

## Data Format

Items should follow this structure:

\`\`\`javascript
{
  id: number,           // Unique identifier
  name: string,         // Display name
  startDate: string,    // YYYY-MM-DD format
  endDate: string,      // YYYY-MM-DD format
  color: string         // Hex color code
}
\`\`\`

## Browser Support

- Modern browsers with ES6+ support
- Chrome 60+, Firefox 60+, Safari 12+, Edge 79+
