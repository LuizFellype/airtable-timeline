"use client"

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { assignLanes } from '../src/assignLanes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { calculateDuration, formatDateForDisplay, isValidDateString, parseISO, validateDateRange } from '@/utils/date';
import { TimelineItem } from '@/utils/types';

import { EditDatePopover } from './EditDatePopover';
import { useVirtualTimeline, LANE_HEIGHT, HEADER_HEIGHT } from '@/hooks/use-virtual-timeline';

interface TimelineProps {
  items: TimelineItem[];
  onItemUpdate?: (item: TimelineItem) => void;
}

const Timeline: React.FC<TimelineProps> = ({ items, onItemUpdate }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragType, setDragType] = useState<'move' | 'resize-start' | 'resize-end' | null>(null);
  // Replace the existing editing state
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [editingStartDate, setEditingStartDate] = useState("")
  const [editingEndDate, setEditingEndDate] = useState("")

  const timelineRef = useRef<HTMLDivElement>(null);

  // Calculate timeline bounds
  const { minDate, maxDate, totalDays } = useMemo(() => {
    if (items.length === 0) return { minDate: new Date(), maxDate: new Date(), totalDays: 0 };

    const dates = items.flatMap(item => [new Date(item.startDate), new Date(item.endDate)]);
    const min = new Date(Math.min(...dates.map(d => d.getTime())));
    const max = new Date(Math.max(...dates.map(d => d.getTime())));

    // Add some padding
    min.setDate(min.getDate() - 7);
    max.setDate(max.getDate() + 7);

    const diffTime = max.getTime() - min.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return { minDate: min, maxDate: max, totalDays: diffDays };
  }, [items]);

  // Assign lanes to items
  const itemsWithLanes = useMemo(() => assignLanes(items), [items]);
  const maxLane = Math.max(...itemsWithLanes.map(item => item.lane || 0), 0);

  // Convert date to pixel position
  const dateToPixel = useCallback((date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const diffTime = d.getTime() - minDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return (diffDays / totalDays) * 800 * zoomLevel;
  }, [minDate, totalDays, zoomLevel]);

  // Convert pixel position to date
  const pixelToDate = useCallback((pixel: number) => {
    const ratio = pixel / (800 * zoomLevel);
    const diffTime = ratio * totalDays * 24 * 60 * 60 * 1000;
    return new Date(minDate.getTime() + diffTime);
  }, [minDate, totalDays, zoomLevel]);

  const { handleScroll, scrollContainerRef, totalWidth, totalHeight, visibleTimeMarkers, visibleRanges, visibleItems } = useVirtualTimeline({
    zoomLevel, itemsWithLanes, maxLane, totalDays, minDate, maxDate,
    dateToPixel, pixelToDate,
  })

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent, itemId: number, type: 'move' | 'resize-start' | 'resize-end') => {
    e.preventDefault();
    setDraggedItem(itemId);
    setDragType(type);
  };

  // Handle drag
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedItem || !dragType || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newDate = pixelToDate(x);

    const item = items.find(i => i.id === draggedItem);
    if (!item) return;

    let updatedItem = { ...item };

    if (dragType === 'move') {
      const duration = new Date(item.endDate).getTime() - new Date(item.startDate).getTime();
      updatedItem.startDate = newDate.toISOString().split('T')[0];
      updatedItem.endDate = new Date(newDate.getTime() + duration).toISOString().split('T')[0];
    } else if (dragType === 'resize-start') {
      updatedItem.startDate = newDate.toISOString().split('T')[0];
      // Ensure start date doesn't go past end date
      if (new Date(updatedItem.startDate) >= new Date(updatedItem.endDate)) {
        updatedItem.startDate = new Date(new Date(updatedItem.endDate).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }
    } else if (dragType === 'resize-end') {
      updatedItem.endDate = newDate.toISOString().split('T')[0];
      // Ensure end date doesn't go before start date
      if (new Date(updatedItem.endDate) <= new Date(updatedItem.startDate)) {
        updatedItem.endDate = new Date(new Date(updatedItem.startDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }
    }

    onItemUpdate?.(updatedItem);
  }, [draggedItem, dragType, items, pixelToDate, onItemUpdate]);

  // Handle drag end
  const handleMouseUp = useCallback(() => {
    setDraggedItem(null);
    setDragType(null);
  }, []);

  // Add event listeners
  React.useEffect(() => {
    if (draggedItem) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedItem, handleMouseMove, handleMouseUp]);

  // Replace the existing editing functions with these improved ones:
  const startEditing = (item: TimelineItem) => {
    setEditingItem(item.id)
    setEditingName(item.name)
    setEditingStartDate(item.startDate) // Correctly set initial start date
    setEditingEndDate(item.endDate) // Correctly set initial end date
    setSelectedItem(null); // Clear selection when editing starts
  };

  const saveEdit = () => {
    if (editingItem && editingName.trim()) {
      const item = items.find(i => i.id === editingItem);
      if (item) {
        const validatedDates = validateDateRange(editingStartDate, editingEndDate)

        const updatedItem = {
          ...item,
          name: editingName.trim(),
          startDate: validatedDates.startDate,
          endDate: validatedDates.endDate,
        }

        onItemUpdate?.(updatedItem)
        // onItemUpdate?.({ ...item, name: editingName.trim() });
      }
    }
    setEditingItem(null);
    setEditingName('');
    setEditingStartDate("")
    setEditingEndDate("")
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditingName('');
    setEditingStartDate("")
    setEditingEndDate("")
  };

  const handleItemClick = (e: React.MouseEvent, itemId: number) => {
    e.stopPropagation();
    if (editingItem === null) { // Only allow selection if not editing
      setSelectedItem(selectedItem === itemId ? null : itemId);
    }
  };

  // Add this function to handle clicking outside items
  const handleTimelineClick = () => {
    if (editingItem === null) {
      setSelectedItem(null);
    }
  };


  const isSaveDisabled = useMemo(() => {
    return (
      !editingName.trim() ||
      !editingStartDate ||
      !editingEndDate ||
      (isValidDateString(editingStartDate) &&
        isValidDateString(editingEndDate) &&
        parseISO(editingStartDate) > parseISO(editingEndDate))
    )
  }, [editingName, editingStartDate, editingEndDate])


  return (
    <div className="w-full p-4">
      {/* Controls */}
      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setZoomLevel(prev => Math.min(prev * 1.5, 5))}
        >
          <ZoomIn className="w-4 h-4 mr-1" />
          Zoom In
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setZoomLevel(prev => Math.max(prev / 1.5, 0.2))}
        >
          <ZoomOut className="w-4 h-4 mr-1" />
          Zoom Out
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setZoomLevel(1)}
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
        <span className="text-sm text-muted-foreground self-center ml-2">
          Zoom: {Math.round(zoomLevel * 100)}%
        </span>
        <span className="text-sm text-muted-foreground self-center ml-4">
          Rendering {visibleItems.length} of {itemsWithLanes.length} items
        </span>
      </div>

      {/* Virtual Scrolling Timeline Container */}
      <div className="border rounded-lg bg-background">
        <div ref={scrollContainerRef} className="overflow-auto" style={{ height: "600px" }} onScroll={handleScroll}>
          <div
            style={{
              width: `${totalWidth}px`,
              height: `${totalHeight}px`,
              position: "relative",
            }}
          >
            {/* Fixed header */}
            <div
              className="sticky top-0 z-30 bg-muted/30 border-b"
              style={{
                height: `${HEADER_HEIGHT}px`,
                width: `${totalWidth}px`,
              }}
            >
              {visibleTimeMarkers.map((marker, index) => (
                <div
                  key={index}
                  className="absolute top-0 bottom-0 border-l border-muted-foreground/20"
                  style={{ left: `${marker.pixel}px` }}
                >
                  <div className="absolute top-1 left-1 text-xs text-muted-foreground whitespace-nowrap">
                    {marker.date.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </div>
                </div>
              ))}
            </div>

            {/* Virtual timeline content */}
            <div
              ref={timelineRef}
              className="relative"
              style={{
                width: `${totalWidth}px`,
                height: `${totalHeight - HEADER_HEIGHT}px`,
                top: `${HEADER_HEIGHT}px`,
              }}
              onClick={handleTimelineClick}
            >
              {/* Render only visible items */}
              {visibleItems.map((item) => {
                const startX = dateToPixel(item.startDate)
                const endX = dateToPixel(item.endDate)
                const width = endX - startX
                const y = (item.lane || 0) * LANE_HEIGHT
                const isSelected = selectedItem === item.id
                const isEditing = editingItem === item.id

                return (
                  <div key={item.id} className="absolute">
                    {/* Main item container */}
                    <div
                      className="absolute group"
                      style={{
                        left: `${startX}px`,
                        top: `${y}px`,
                        width: `${width}px`,
                        height: "40px",
                      }}
                    >
                      {/* Resize handle - start */}
                      <div
                        className="absolute left-0 top-0 w-2 h-full cursor-ew-resize bg-transparent hover:bg-blue-500/20 z-10"
                        onMouseDown={(e) => handleMouseDown(e, item.id, "resize-start")}
                      />

                      {/* Main item */}
                      <div
                        className={`h-full rounded px-2 py-1 text-white text-sm flex items-center justify-between shadow-sm border transition-all ${isSelected ? "border-blue-500 border-2 shadow-lg" : "border-black/10"
                          } ${!isEditing ? "cursor-move" : ""}`}
                        style={{ backgroundColor: item.color }}
                        onMouseDown={(e) => (!isEditing ? handleMouseDown(e, item.id, "move") : undefined)}
                        onClick={(e) => handleItemClick(e, item.id)}
                      >
                        <span className="truncate cursor-pointer" title={item.name}>
                          {item.name}
                        </span>

                        <div className="text-xs opacity-75 ml-2 whitespace-nowrap">
                          {calculateDuration(item.startDate, item.endDate)}d
                        </div>
                      </div>

                      {/* Resize handle - end */}
                      <div
                        className="absolute right-0 top-0 w-2 h-full cursor-ew-resize bg-transparent hover:bg-blue-500/20 z-10"
                        onMouseDown={(e) => handleMouseDown(e, item.id, "resize-end")}
                      />
                    </div>

                    {/* Edit controls - positioned below the item when selected */}
                    {isSelected && !isEditing && (
                      <div
                        className="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-40"
                        style={{
                          left: `${startX}px`,
                          top: `${y + 45}px`,
                          minWidth: "250px",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditing(item)}
                              className="h-7 px-2 text-xs"
                            >
                              Edit
                            </Button>
                            <span className="text-sm text-gray-600 truncate flex-1">{item.name}</span>
                          </div>

                          <div className="text-xs text-gray-500 space-y-1">
                            <div>Start: {formatDateForDisplay(item.startDate)}</div>
                            <div>End: {formatDateForDisplay(item.endDate)}</div>
                            <div>Duration: {calculateDuration(item.startDate, item.endDate)} days</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Edit mode - positioned below the item when editing */}
                    {isEditing && (
                      <div
                        className="absolute bg-white border border-blue-500 rounded-lg shadow-lg p-3 z-40"
                        style={{
                          left: `${startX}px`,
                          top: `${y + 45}px`,
                          minWidth: "380px",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1">Item Name</label>
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  !isSaveDisabled && saveEdit();
                                }
                                if (e.key === 'Escape') {
                                  e.preventDefault();
                                  cancelEdit();
                                }
                              }}
                              className="h-8 text-sm"
                              placeholder="Enter Item name..."
                              autoFocus
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-gray-700 block mb-1">Start Date</label>
                              <EditDatePopover date={editingStartDate} onSelectDate={setEditingStartDate} />
                            </div>

                            <div>
                              <label className="text-xs font-medium text-gray-700 block mb-1">End Date</label>
                              <EditDatePopover date={editingEndDate} onSelectDate={setEditingEndDate} isEndDate />
                            </div>
                          </div>

                          {editingStartDate && editingEndDate && (
                            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                              Duration: {calculateDuration(editingStartDate, editingEndDate)} days
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={saveEdit}
                              disabled={isSaveDisabled}
                              className="h-7 px-3 text-xs"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEdit}
                              className="h-7 px-3 text-xs bg-transparent"
                            >
                              Cancel
                            </Button>
                          </div>

                          <div className="text-xs text-gray-500">Press Enter to save, Escape to cancel</div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Render only visible lane separators */}
              {Array.from({ length: visibleRanges.endLane - visibleRanges.startLane + 1 }, (_, i) => {
                const laneIndex = visibleRanges.startLane + i
                return (
                  <div
                    key={laneIndex}
                    className="absolute left-0 border-b border-muted-foreground/10"
                    style={{
                      top: `${(laneIndex + 1) * LANE_HEIGHT}px`,
                      width: `${totalWidth}px`,
                    }}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}



      {/* Instructions */}
      <div className="mt-4 text-sm text-muted-foreground">
        <p><strong>Instructions:</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Click on items to select them and see edit options</li>
          <li>Click "Edit" button to rename items with a proper input field</li>
          <li>Drag items to move them along the timeline</li>
          <li>Drag the left or right edges to resize items</li>
          <li>Use zoom controls to get a better view</li>
          <li>Items are automatically arranged in compact lanes</li>
          <li>Press Enter to save or Escape to cancel when editing</li>
        </ul>
      </div>


    </div>
  );
};

export default Timeline;
