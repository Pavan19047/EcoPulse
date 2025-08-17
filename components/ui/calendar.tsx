"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface CalendarProps {
  selected?: Date | null;
  onSelect?: (date: Date | null) => void;
  ariaLabel?: string;
  // Optional bounds for year dropdown; sensible defaults applied
  fromYear?: number;
  toYear?: number;
}

export function Calendar({ selected, onSelect, ariaLabel, fromYear, toYear }: CalendarProps) {
  const currentYear = new Date().getFullYear();
  const startYear = fromYear ?? currentYear - 50;
  const endYear = toYear ?? currentYear + 10;

  // Custom Dropdown renderer to match Radix Select UI used across the app
  const Dropdown = React.useCallback((props: any) => {
    const { options = [], value, onChange, name } = props ?? {};
    const mapped = (options as Array<{ value: number | string; label: string }>).map((o) => ({
      value: String(o.value),
      label: o.label,
    }));
    const strVal = value != null ? String(value) : (mapped[0]?.value ?? "");
    return (
      <Select value={strVal} onValueChange={(val) => onChange?.({ target: { value: val } })}>
        <SelectTrigger size="sm" className="h-8 min-w-24">
          <SelectValue placeholder={name === "year" ? "Year" : "Month"} />
        </SelectTrigger>
        <SelectContent>
          {mapped.map((opt) => (
            <SelectItem key={`${name}-${opt.value}`} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }, []);
  return (
    <div className="w-full">
      <DayPicker
        mode="single"
        required={true}
        selected={selected ?? undefined}
        onSelect={onSelect}
        aria-label={ariaLabel}
        captionLayout="dropdown"
        fromYear={startYear}
        toYear={endYear}
  components={{ Dropdown: Dropdown as any }}
        className="rounded border bg-white shadow p-2"
      />
    </div>
  );
}