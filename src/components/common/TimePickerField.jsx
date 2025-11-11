import React from "react";

const TimePickerField = ({ selectedTime, onChange, className }) => {
  return (
    <div className={`${className ? className : "max-w-52"}`}>
      <input
        type="time"
        id="appt"
        name="appt"
        value={selectedTime}
        onChange={onChange}
        className="w-full rounded-md border border-gray-300 px-2 py-1 focus:border-secondary-color focus:outline-none focus:ring-0"
      />
    </div>
  );
};

export default TimePickerField;
