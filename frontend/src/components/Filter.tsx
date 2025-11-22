import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./styles.css";

//
// FilterProps
// ------------
// Defines the properties that the ClassFilter component expects.
//
type FilterProps = {
  // Callback function triggered whenever the filter values change
  // Provides an object with:
  // - date: selected date in 'yyyy-MM-dd' format, or null if none
  // - timeRange: "morning" | "afternoon" | "night" | null
  onFilterChange: (filters: {
    date: string | null;
    timeRange: string | null;
  }) => void;
};

//
// ClassFilter Component
// ---------------------
// A filter UI allowing users to select a date and/or time range for classes.
// Includes "Search" and "Clear" buttons to apply or reset filters.
//
export default function ClassFilter({ onFilterChange }: FilterProps) {
  // Local state to track selected date
  const [date, setDate] = useState<Date | null>(null);

  // Local state to track selected time range
  const [timeRange, setTimeRange] = useState<string | null>(null);

  //
  // handleSearch
  // --------------
  // Called when user clicks "Search"
  // Converts selected date to 'yyyy-MM-dd' format
  // Calls parent callback with current filter values
  //
  function handleSearch() {
    onFilterChange({
      date: date ? date.toISOString().split("T")[0] : null,
      timeRange,
    });
  }

  //
  // handleClear
  // -------------
  // Resets both date and time range filters
  // Notifies parent to clear filters
  //
  function handleClear() {
    setDate(null);
    setTimeRange(null);
    onFilterChange({ date: null, timeRange: null });
  }

  return (
    // Container for filter bar
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Filter bar with white background, rounded edges, shadow, and horizontal layout */}
      <div className="bg-white shadow rounded-full px-4 h-14 flex items-center gap-4">
        {/* Left section: date picker + time selector */}
        <div className="flex-1 min-w-0 flex items-center gap-4">
          {/* Date picker */}
          <div className="flex items-center gap-3 border-r pr-4">
            <div className="w-9 h-9 flex items-center justify-center rounded-md">
              {/* Calendar icon */}
              <svg
                className="w-5 h-5 text-gray-500"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M8 7V3M16 7V3M3 11h18M5 21h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="min-w-0">
              {/* React DatePicker component */}
              <DatePicker
                selected={date}
                onChange={(d: Date | null) => setDate(d)}
                minDate={new Date()}
                placeholderText="Any date"
                isClearable
                dateFormat="MMM d, yyyy"
                className="w-44 bg-transparent focus:outline-none text-sm leading-tight"
                popperClassName="react-datepicker-popper"
              />
            </div>
          </div>

          {/* Time range selector */}
          <div className="flex items-center gap-2">
            <div className="w-6 text-center">
              <svg
                className="w-5 h-5 text-gray-500"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M12 8v4l3 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Dropdown for selecting time of day */}
            <div>
              <select
                aria-label="Time of day"
                value={timeRange ?? ""}
                onChange={(e) => setTimeRange(e.target.value || null)}
                className="bg-transparent focus:outline-none text-sm"
              >
                <option value="" className="text-gray-100">
                  Any time
                </option>
                <option value="morning">Morning (6–12)</option>
                <option value="afternoon">Afternoon (12–18)</option>
                <option value="night">Night (18–22)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right section: Clear and Search buttons */}
        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            onClick={handleClear}
            className="bg-transparent text-xs px-3 py-2 rounded-md hover:bg-gray-100"
            aria-label="Clear filters"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleSearch}
            className="search-btn text-white px-4 py-2 rounded text-sm shadow"
            aria-label="Search"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
