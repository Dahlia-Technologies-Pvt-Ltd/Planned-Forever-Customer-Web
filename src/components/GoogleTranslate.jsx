import languages from "../utilities/languages.json";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Select from "react-select";

const GoogleTranslate = () => {
  const [currentLanguage, setCurrentLanguage] = useState("en");

  // Helper function to set the googtrans cookie
  const setTranslateCookie = (lang) => {
    Cookies.set("googtrans", `/en/${lang}`, {
      path: "/",
      expires: 1,
      sameSite: "Lax",
      secure: window.location.protocol === "https:",
    });
  };

  const handleLanguageSelect = (selectedOption) => {
    const lang = selectedOption.value;
    setCurrentLanguage(lang);
    setTranslateCookie(lang);

    // Update the Google Translate iframe dynamically
    const selectDropdown = document.querySelector(".goog-te-combo");
    if (selectDropdown) {
      selectDropdown.value = lang;
      selectDropdown.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  useEffect(() => {
    // Retrieve the stored language from cookies
    const savedLanguage = Cookies.get("googtrans");
    const languageCode = savedLanguage?.split("/")[2] || "en";

    setCurrentLanguage(languageCode);

    // Initialize Google Translate
    const initializeGoogleTranslate = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: languages.map((lang) => lang?.code).join(","),
          autoDisplay: false,
        },
        "google_translate_element",
      );
    };

    if (!window.google || !window.google.translate) {
      window.googleTranslateElementInit = initializeGoogleTranslate;

      const script = document.createElement("script");
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    } else {
      initializeGoogleTranslate();
    }

    // Function to hide "Rate this translation" popup and any unwanted tooltips
    const hideTranslatePopup = () => {
      const popup = document.querySelector(".goog-te-tooltip");
      const translateBanner = document.querySelector(".goog-te-banner-frame");
      const ratePopup = document.querySelector(".goog-te-rate-this-translation");

      if (popup) popup.style.display = "none";
      if (translateBanner) translateBanner.style.display = "none";
      if (ratePopup) ratePopup.style.display = "none";
    };

    // Continuously check for and hide popups
    const intervalId = setInterval(hideTranslatePopup, 100);

    // Clean up interval when component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const options = languages.map((lang) => ({
    value: lang.code,
    label: (
      <div className="flex items-center gap-2">
        <img src={lang.svg} alt={`${lang.name} flag`} className="h-4 w-6 object-cover" />
        <span>{lang.name}</span>
      </div>
    ),
  }));

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "white",
      borderColor: "#d1d5db",
      boxShadow: "none",
      fontSize: "14px",
      "&:hover": { borderColor: "#9ca3af" },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 10,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#e5e7eb" : "white",
      color: state.isSelected ? "#111827" : "#374151",
      fontSize: "14px",
      "&:hover": { backgroundColor: "#f3f4f6" },
    }),
  };

  return (
    <div>
      <Select
        options={options}
        onChange={handleLanguageSelect}
        className="w-44"
        styles={customStyles}
        value={options.find((option) => option.value === currentLanguage)}
      />
      <div id="google_translate_element" className="hidden"></div>
    </div>
  );
};

export default GoogleTranslate;
