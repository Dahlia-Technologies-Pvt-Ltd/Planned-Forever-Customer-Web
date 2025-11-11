// src/LanguageSelector.js
import React from "react";
import Select from "react-select";
import { useTranslation } from "react-i18next";

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const languages = [
    { value: "en", label: "English" },
    { value: "sp", label: "Spanish" },
    { value: "ar", label: "Arabic" },
    { value: "hi", label: "Hindi" },
  ];

  const handleLanguageChange = (selectedOption) => {
    i18n.changeLanguage(selectedOption.value);
  };

  return (
    <div>
      <Select
        options={languages}
        onChange={handleLanguageChange}
        className="w-52 text-sm"
        placeholder="Select language"
        defaultValue={languages.find((lang) => lang.value === i18n.language)}
      />
    </div>
  );
};

export default LanguageSelector;
