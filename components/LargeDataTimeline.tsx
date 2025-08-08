"use client"

import { useState, useMemo } from 'react';
import Timeline from './Timeline';
import { Button } from '@/components/ui/button';

// Generate large dataset for testing virtual scrolling
const generateLargeDataset = (count: number) => {
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444',
    '#06b6d4', '#ec4899', '#84cc16', '#6366f1', '#f97316'
  ];

  const items = [];
  const startDate = new Date('2024-01-01');

  for (let i = 0; i < count; i++) {
    // Create items with varying durations and start dates
    const itemStartDate = new Date(startDate);
    itemStartDate.setDate(startDate.getDate() + Math.floor(i / 10) * 7 + (i % 10) * 2);
    
    const duration = Math.floor(Math.random() * 14) + 1; // 1-14 days
    const itemEndDate = new Date(itemStartDate);
    itemEndDate.setDate(itemStartDate.getDate() + duration);

    items.push({
      id: i + 1,
      name: `Task ${i + 1} - ${['Planning', 'Development', 'Testing', 'Review', 'Deployment'][i % 5]}`,
      startDate: itemStartDate.toISOString().split('T')[0],
      endDate: itemEndDate.toISOString().split('T')[0],
      color: colors[i % colors.length]
    });
  }

  return items;
};

export default function LargeDatasetTest() {
  const [itemCount, setItemCount] = useState(100);
  const [items, setItems] = useState(() => generateLargeDataset(100));

  const handleItemUpdate = (updatedItem: any) => {
    setItems(prev => prev.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
  };

  const regenerateData = (count: number) => {
    setItemCount(count);
    setItems(generateLargeDataset(count));
  };

  const stats = useMemo(() => {
    const lanes = new Set(items.map(item => {
      // Quick lane calculation for stats
      const sorted = [...items].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      const lanes: any[][] = [];
      
      for (const item of sorted) {
        const itemStart = new Date(item.startDate);
        let assignedLane = -1;
        
        for (let laneIndex = 0; laneIndex < lanes.length; laneIndex++) {
          const lane = lanes[laneIndex];
          const lastItem = lane[lane.length - 1];
          const lastItemEnd = new Date(lastItem.endDate);
          
          if (itemStart.getTime() >= lastItemEnd.getTime() + 24 * 60 * 60 * 1000) {
            assignedLane = laneIndex;
            break;
          }
        }
        
        if (assignedLane === -1) {
          assignedLane = lanes.length;
          lanes.push([]);
        }
        
        lanes[assignedLane].push({ ...item, lane: assignedLane });
      }
      
      return lanes.length;
    }));

    return {
      totalItems: items.length,
      totalLanes: Math.max(...Array.from(lanes), 0),
      dateRange: items.length > 0 ? {
        start: Math.min(...items.map(i => new Date(i.startDate).getTime())),
        end: Math.max(...items.map(i => new Date(i.endDate).getTime()))
      } : null
    };
  }, [items]);

  return (
    <div className="w-full p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Virtual Scrolling Timeline Test</h1>
        <p className="text-muted-foreground mb-4">
          Test the timeline component with large datasets. Virtual scrolling ensures smooth performance
          by only rendering visible items.
        </p>

        {/* Dataset Controls */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <Button
            variant={itemCount === 100 ? "default" : "outline"}
            size="sm"
            onClick={() => regenerateData(100)}
          >
            100 Items
          </Button>
          <Button
            variant={itemCount === 500 ? "default" : "outline"}
            size="sm"
            onClick={() => regenerateData(500)}
          >
            500 Items
          </Button>
          <Button
            variant={itemCount === 1000 ? "default" : "outline"}
            size="sm"
            onClick={() => regenerateData(1000)}
          >
            1,000 Items
          </Button>
          <Button
            variant={itemCount === 5000 ? "default" : "outline"}
            size="sm"
            onClick={() => regenerateData(5000)}
          >
            5,000 Items
          </Button>
          <Button
            variant={itemCount === 10000 ? "default" : "outline"}
            size="sm"
            onClick={() => regenerateData(10000)}
          >
            10,000 Items
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">Total Items</div>
            <div className="text-2xl font-bold">{stats.totalItems.toLocaleString()}</div>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">Total Lanes</div>
            <div className="text-2xl font-bold">{stats.totalLanes}</div>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">Date Range</div>
            <div className="text-sm font-medium">
              {stats.dateRange ? 
                `${Math.ceil((stats.dateRange.end - stats.dateRange.start) / (1000 * 60 * 60 * 24))} days` :
                'No data'
              }
            </div>
          </div>
        </div>
      </div>

      <Timeline 
        items={items} 
        onItemUpdate={handleItemUpdate}
      />

      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Virtual Scrolling Benefits</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <strong>Performance:</strong> Only renders visible items, maintaining 60fps even with 10,000+ items</li>
          <li>• <strong>Memory Efficient:</strong> DOM nodes are created/destroyed as needed</li>
          <li>• <strong>Smooth Scrolling:</strong> Native browser scrolling with virtual content</li>
          <li>• <strong>Buffer Rendering:</strong> Pre-renders items slightly outside view for seamless scrolling</li>
          <li>• <strong>Responsive:</strong> Automatically adjusts to container size changes</li>
        </ul>
      </div>
    </div>
  );
}
