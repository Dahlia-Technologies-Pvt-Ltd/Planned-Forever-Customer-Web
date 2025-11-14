import React, { useState, useMemo, useEffect } from "react";

/* Third-Party Libraries */
import Select from "react-select";

/* Assets */
import { GLOBAL_GOOGLE_LANGUAGES_ARRAY } from "../../constants/CommonConstants";

const GoogleTranslateGlobalSelectorV1 = () => {
  const [currentLang, setCurrentLang] = useState("en");
  const [googleSelect, setGoogleSelect] = useState(null);

  // Memoized languages list (prevents re-creation every render)
  const languages = useMemo(() => GLOBAL_GOOGLE_LANGUAGES_ARRAY, []);

  // Get matched current language object for react-select
  const currentLangOption = useMemo(() => languages.find((lang) => lang.value === currentLang), [currentLang, languages]);

  // Retry mechanism to detect Google Translate dropdown
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20;

    const interval = setInterval(() => {
      const select = document.querySelector(".goog-te-combo");

      if (select) {
        setGoogleSelect(select);
        clearInterval(interval);
      }

      attempts++;
      if (attempts >= maxAttempts) clearInterval(interval);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const HANDLE_LANGUAGE_CHANGE = (choosedLang) => {
    if (!choosedLang) return;

    setCurrentLang(choosedLang.value);

    // Apply change to Google Translate dropdown
    if (googleSelect) {
      googleSelect.value = choosedLang.value;
      googleSelect.dispatchEvent(new Event("change"));
    }
  };

  return (
    <div>
      <Select
        options={languages}
        value={currentLangOption}
        onChange={HANDLE_LANGUAGE_CHANGE}
        placeholder="Select language"
        className="w-52 text-sm"
        classNamePrefix="global-lang-select"
      />
    </div>
  );
};

export default GoogleTranslateGlobalSelectorV1;
