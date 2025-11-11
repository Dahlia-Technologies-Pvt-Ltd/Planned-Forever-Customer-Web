import React from "react";
import { TagsInput } from "react-tag-input-component";

const InputTags = ({ label, name, isRequired, error, setSelected, selected , placeHolder , note }) => {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="label">
        {label}
        {isRequired && <span className="text-red-500">*</span>}
        <span className="text-xs text-info-color"> {note}</span>
        {error && <span className="text-xs text-red-500"> {error}</span>}
      </label>
      <TagsInput
        classNames={{
          input: error && "!border !border-solid !border-red-400 focus:ring-0",
        }}
        value={selected}
        onChange={setSelected}
        name={name}
        placeHolder={placeHolder ? placeHolder :"Enter Tags"}
      />
    </div>
  );
};

export default InputTags;
