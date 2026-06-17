import React, { useState } from "react";

const RadioInput = ({ name, options, onChange, Classes, type, labelClasses, checked, disabled }) => {
  const [selectedOption, setSelectedOption] = useState("");

  const handleInputChange = (event) => {
    const value = event.target.value;
    setSelectedOption(value);
    onChange(value);
  };

  return (
    <div className={`mb-2  ${Classes}`}>
      {options.map((option) => (
        <React.Fragment key={option.value}>
          <div className={`mb-2 flex items-center gap-3 ${labelClasses}`}>
            <input
              type={type ? type : "radio"}
              id={option.id}
              name={name}
              value={option.value}
              checked={checked ? checked === option.value : selectedOption === option.value}
              onChange={handleInputChange}
              disabled={disabled && disabled}
              className="!h-4 !w-4 shrink-0 cursor-pointer accent-secondary-color"
            />
            <label className="label !mb-0 cursor-pointer text-sm" htmlFor={option.id}>
              {option.label}
            </label>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default RadioInput;
