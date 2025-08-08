import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { formatDateForDisplay, formatDateForInput, parseISO } from "@/utils/date";

type EditDatePopoverProps = {
    date: string;
    isEndDate?: boolean;
    onSelectDate: (date: string) => void;
}

export const EditDatePopover = ({ date, isEndDate, onSelectDate }: EditDatePopoverProps) => {
    return <Popover>
        <PopoverTrigger asChild>
            <Button
                variant="outline"
                className="w-full h-8 text-xs justify-start text-left font-normal bg-transparent"
            >
                <CalendarIcon className="mr-2 h-3 w-3" />
                {date ? formatDateForDisplay(date) : "Pick date"}
            </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
            <Calendar
                mode="single"
                selected={date ? parseISO(date) : undefined}
                month={date ? parseISO(date) : undefined} // Set month to selected date
                onSelect={(date) => {
                    if (date) {
                        const newEndDate = formatDateForInput(date.toISOString())
                        onSelectDate(newEndDate)
                    }
                }}
                disabled={(currentDate) => {
                    // Disable dates before current start date
                    if (!!date) {
                        const parsedDate = parseISO(date)
                        return isEndDate ? currentDate < parsedDate : currentDate > parsedDate;
                    }

                    return false
                }}
            />
        </PopoverContent>
    </Popover>
}