import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const SearchInput = ({ label, name, type, value, placeholder, onChange }) => {
  return (
    <div className="flex items-center justify-end gap-x-4">
      <label htmlFor={name} className="label">
        {label}
      </label>

      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type ? type : "text"}
        className={`text-md h-10 w-96 rounded-10 border-[1.5px] border-gray-300 px-5 font-poppins text-primary-color placeholder:text-primary-light-color focus:border-secondary-color focus:outline-none focus:ring-1
           focus:ring-secondary-color`}
      />

      <button className="px-3 py-2 bg-blue-400 rounded-lg">
        <MagnifyingGlassIcon className="w-6 h-6 text-white" />
      </button>
    </div>
  );
};

export default SearchInput;
