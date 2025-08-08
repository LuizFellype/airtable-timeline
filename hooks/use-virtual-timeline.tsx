import { parseISO } from "@/utils/date"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

// Virtual scrolling configuration
export const LANE_HEIGHT = 60
export const HEADER_HEIGHT = 60
const BUFFER_SIZE = 5
const ITEM_BUFFER_DAYS = 30

interface VirtualTimelineProps {
    zoomLevel: number;
    itemsWithLanes: any[];
    maxLane: number;
    totalDays: number;
    minDate: Date;
    maxDate: Date;
    dateToPixel: (date: Date) => number;
    pixelToDate: (pixel: number) => Date;
    initialScrollTop?: number;
    initialScrollLeft?: number;
    initialContainerHeight?: number;
    initialContainerWidth?: number;
}

export const useVirtualTimeline = ({
    zoomLevel, itemsWithLanes, maxLane, totalDays, minDate, maxDate,
    dateToPixel, pixelToDate,
    initialScrollTop, initialScrollLeft, initialContainerHeight, initialContainerWidth,
}: VirtualTimelineProps) => {
    const [scrollTop, setScrollTop] = useState(initialScrollTop || 0)
    const [scrollLeft, setScrollLeft] = useState(initialScrollLeft || 0)
    const [containerHeight, setContainerHeight] = useState(initialContainerHeight || 600)
    const [containerWidth, setContainerWidth] = useState(initialContainerWidth || 800)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const totalWidth = 800 * zoomLevel
    const totalHeight = (maxLane + 1) * LANE_HEIGHT + HEADER_HEIGHT


    // Calculate visible ranges for virtual scrolling
    const visibleRanges = useMemo(() => {
        const startLane = Math.max(0, Math.floor((scrollTop - HEADER_HEIGHT) / LANE_HEIGHT) - BUFFER_SIZE)
        const endLane = Math.min(
            maxLane,
            Math.ceil((scrollTop + containerHeight - HEADER_HEIGHT) / LANE_HEIGHT) + BUFFER_SIZE,
        )

        const startPixel = Math.max(0, scrollLeft - (ITEM_BUFFER_DAYS * totalWidth) / totalDays)
        const endPixel = Math.min(totalWidth, scrollLeft + containerWidth + (ITEM_BUFFER_DAYS * totalWidth) / totalDays)

        const startDate = pixelToDate(startPixel)
        const endDate = pixelToDate(endPixel)

        return {
            startLane,
            endLane,
            startDate,
            endDate,
            startPixel,
            endPixel,
        }
    }, [scrollTop, scrollLeft, containerHeight, containerWidth, maxLane, totalWidth, totalDays, pixelToDate])

    // Filter items to only those in visible range
    const visibleItems = useMemo(() => {
        return itemsWithLanes.filter((item) => {
            const itemLane = item.lane || 0
            const itemStartDate = parseISO(item.startDate) // Use parseISO
            const itemEndDate = parseISO(item.endDate) // Use parseISO

            if (itemLane < visibleRanges.startLane || itemLane > visibleRanges.endLane) {
                return false
            }

            if (itemEndDate < visibleRanges.startDate || itemStartDate > visibleRanges.endDate) {
                return false
            }

            return true
        })
    }, [itemsWithLanes, visibleRanges])

    // Handle scroll events
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement
        setScrollTop(target.scrollTop)
        setScrollLeft(target.scrollLeft)
    }, [])

    // Handle container resize
    useEffect(() => {
        const handleResize = () => {
            if (scrollContainerRef.current) {
                const rect = scrollContainerRef.current.getBoundingClientRect()
                setContainerHeight(rect.height)
                setContainerWidth(rect.width)
            }
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    // Generate visible time markers
    const visibleTimeMarkers = useMemo(() => {
        const markers = []
        const current = new Date(minDate)
        current.setDate(1)

        while (current <= maxDate) {
            const markerPixel = dateToPixel(current)
            if (markerPixel >= visibleRanges.startPixel - 100 && markerPixel <= visibleRanges.endPixel + 100) {
                markers.push({ date: new Date(current), pixel: markerPixel })
            }
            current.setMonth(current.getMonth() + 1)
        }

        return markers
    }, [minDate, maxDate, dateToPixel, visibleRanges])


    
    return {
        visibleItems,
        visibleRanges,
        handleScroll,
        scrollContainerRef,
        totalWidth,
        totalHeight,
        visibleTimeMarkers,
    }
}