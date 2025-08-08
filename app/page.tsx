"use client"

import { useState } from 'react';
import Timeline from '../components/Timeline';
import { timelineItems as initialItems } from '../src/timelineItems';
import { Button } from '@/components/ui/button';
import LargeDatasetTest from '@/components/LargeDataTimeline';

export default function Home() {
  const [items, setItems] = useState(initialItems);
  const [showLargeDataset, setShowLargeDataset] = useState(false);

  const handleItemUpdate = (updatedItem: any) => {
    setItems(prev => prev.map(item =>
      item.id === updatedItem.id ? updatedItem : item
    ));
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Interactive Timeline Component</h1>
          <p className="text-muted-foreground">
            A compact, interactive timeline with drag-and-drop editing, zoom controls, and edit functionlites.
          </p>
        </div>

        <div className="flex gap-2 mb-4">
          <Button
            variant={!showLargeDataset ? "default" : "outline"}
            onClick={() => setShowLargeDataset(false)}
          >
            Sample Data (10 items)
          </Button>
          <Button
            variant={showLargeDataset ? "default" : "outline"}
            onClick={() => setShowLargeDataset(true)}
          >
            Large Dataset Test
          </Button>
        </div>

        {showLargeDataset ? <LargeDatasetTest /> : <Timeline
          items={items}
          onItemUpdate={handleItemUpdate}
        />}


        <div className="mt-8 p-4 bg-muted/30 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Current Items Data</h2>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(items, null, 2)}
          </pre>
        </div>
      </div>
    </main >
  );
}
