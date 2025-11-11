import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

const DateRangePicker = ({ selectedRange, onChange, className }) => {
  return (
    <div className={`relative ${className || "w-54"}`}>
      <div className="relative flex items-center ">
        <DatePicker
          selected={selectedRange[0]}
          onChange={(dates) => onChange(dates)}
          startDate={selectedRange[0]}
          endDate={selectedRange[1]}
          selectsRange
          placeholderText="Select Date Range"
          className="w-full bg-transparent outline-none h-11 text-primary-color border border-primary-light-color rounded-lg "
        />
      </div>
    </div>
  );
};

export default DateRangePicker;
