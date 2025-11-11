import React, { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const Input = ({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  inputClassName,
  error,
  onClick,
  labelOnTop,
  withoutLabel,
  textarea,
  rows = 4,
  columns,
  disabled,
  text,
  isRequired,
  classes,
  invisible,
  readOnly,
  withError,
  min,
  max,
  ref,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const inputType = type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative ltr:text-left rtl:text-right">
      <div className="mb-2">
        {!withoutLabel && (
          <label htmlFor={name} className={`label ${invisible ? "hidden" : ""}`}>
            {label}
            {isRequired && <span className="text-red-500">*</span>}
            {error && <span className="text-xs text-red-500">{error}</span>}
          </label>
        )}
      </div>
      <div>
        {textarea ? (
          <textarea
            rows={rows}
            cols={columns}
            name={name}
            value={value}
            readOnly={readOnly}
            onChange={onChange}
            placeholder={placeholder}
            className={`text-md w-full rounded-10 border p-3 text-secondary-color placeholder:text-primary-light-color focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color ${
              error ? "border-red-500" : "border-gray-300"
            }`}
          />
        ) : (
          <>
            <input
              name={name}
              type={inputType}
              value={value}
              onChange={onChange}
              onClick={onClick}
              ref={ref && ref}
              readOnly={readOnly}
              className={`text-md h-11 w-full ${inputClassName} rounded-10 border-[1.5px] font-poppins text-primary-color placeholder:text-primary-light-color focus:border-secondary-color focus:outline-none focus:ring-1 focus:ring-secondary-color ${
                error || withError ? "border-red-500" : "border-gray-300"
              } `}
              placeholder={placeholder}
              min={inputType === "datetime-local" || inputType === "date" ? min : min ? 0 : 1}
              max={max && max}
              disabled={disabled && disabled}
            />
            {type === "password" && (
              <span onClick={togglePasswordVisibility} className="absolute right-0 top-[55px] -translate-y-1/2 cursor-pointer px-4">
                {showPassword ? <EyeIcon className="w-5 h-5 text-primary-color" /> : <EyeSlashIcon className="w-5 h-5 text-primary-color" />}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Input;
