import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateAndTime = ({ dateAndTime, setDateAndTime, isRequired, label, withoutLabel, dateOnly, error, setError, minDate }) => {
  const CustomInput = ({ value, onClick }) => (
    <input
      type="text"
      value={value}
      onClick={onClick}
      placeholder={dateOnly ? "Select Date" : "Select Date & Time"}
      className={`h-11 w-full border border-gray-300 font-poppins text-primary-color placeholder:text-primary-light-color focus:border-2 focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color ${
        error ? "border-red-500" : "border-gray-300"
      }`}
    />
  );

  return (
    <>
      <div className="relative text-left">
        <div className="mb-2">
          {!withoutLabel && (
            <label className={`label`}>
              {label}
              {isRequired && <span className="text-red-500">*</span>}
              {error && <span className="text-xs text-red-500">{error}</span>}
            </label>
          )}
        </div>
        <div>
          {dateOnly ? (
            <DatePicker
              selected={dateAndTime}
              onChange={(date) => {
                setDateAndTime(date);
                setError("");
              }}
              dateFormat="MM/dd/yyyy"
              minDate={minDate} // Set minimum date
              customInput={<CustomInput />}
            />
          ) : (
            <>
              <DatePicker
                selected={dateAndTime}
                onChange={(date) => {
                  setDateAndTime(date);
                  setError("");
                }}
                timeInputLabel="Time:"
                dateFormat="MM/dd/yyyy h:mm aa"
                showTimeInput
                minDate={minDate} // Set minimum date
                customInput={<CustomInput />}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DateAndTime;
