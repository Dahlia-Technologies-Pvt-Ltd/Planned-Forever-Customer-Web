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
          <div className={`mb-2 space-x-4 ${labelClasses}`}>
            <input
              type={type ? type : "radio"}
              id={option.id}
              name={name}
              value={option.value}
              checked={checked ? checked === option.value : selectedOption === option.value}
              onChange={handleInputChange}
              disabled={disabled && disabled}
            />
            <label className="label" htmlFor={option.id}>
              {option.label}
            </label>
            <br />
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default RadioInput;
