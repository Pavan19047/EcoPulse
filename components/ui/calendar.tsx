import * as React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export interface CalendarProps {
  selected?: Date | null;
  onSelect?: (date: Date | null) => void;
  ariaLabel?: string;
}

export function Calendar({ selected, onSelect, ariaLabel }: CalendarProps) {
  return (
    <div className="w-full">
      <DayPicker
        mode="single"
        required={true}
        selected={selected ?? undefined}
        onSelect={onSelect}
        aria-label={ariaLabel}
        className="rounded border bg-white shadow p-2"
      />
    </div>
  );
}