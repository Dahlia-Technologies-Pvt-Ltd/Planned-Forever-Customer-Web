import React, { useEffect, useState } from "react";
import ProfileSelect from "./ProfileSelect";
import { Bars3Icon } from "@heroicons/react/24/solid";
import { useThemeContext } from "../context/GlobalContext";
import { useLocation } from "react-router-dom";
import { Images } from "../assets/Assets";
import { useMediaQuery } from "react-responsive";
import GoogleTranslateGlobalSelectorV1 from "./GlobalTranslatorComponents/GoogleTranslateGlobalSelectorV1";
import LanguageSelector from "./LanguageSelector";
import { useTranslation } from "react-i18next";

const Header = () => {
  // Translation
  const { t } = useTranslation("common");

  // Context
  const { toggleSidebarWithTitle, isSidebarOpenWithTitle, toggleSidebar } = useThemeContext();

  const isTablet = useMediaQuery({ maxWidth: 1024 });

  // Get location from React Router
  const location = useLocation();

  // Get the last segment of the path
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const page = pathSegments[pathSegments.length - 1];

  // Use translations for page titles
  const formatPageTitle = (page) => {
    return t(`pageTitles.${page}`, { defaultValue: "Planned Forever" });
  };

  const pageTitle = page ? formatPageTitle(page) : t("pageTitles.planned-forever", { defaultValue: "Planned Forever" });

  return (
    <header
      className={`${
        location.pathname === "/event-screen"
          ? "mt-5"
          : "sticky top-0 z-10 flex h-20 items-center space-x-3 bg-white pl-6 text-secondary-color shadow-card"
      }`}
    >
      <div className="flex items-center gap-x-6">
        {location.pathname === "/event-screen" ? (
          <></>
        ) : (
          <>
            <button type="button" className="block" onClick={isTablet ? toggleSidebar : toggleSidebarWithTitle}>
              <Bars3Icon className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {location.pathname === "/event-screen" ? (
        <></>
      ) : (
        <>
          <div>
            <img src={Images.LOGO_ICON} className="h-16" alt="Logo" />
          </div>
          <h1 className="ml-8 shrink-0 flex-grow text-xl font-semibold xl:ml-0">{pageTitle}</h1>
        </>
      )}

      {/* Language Selector */}
      <div className="flex items-center gap-x-6">
        {/* Hidden Google dropdown (required for translation logic) */}
        <GoogleTranslateGlobalSelectorV1 />

        {/* <LanguageSelector /> */}

        <ProfileSelect />
      </div>
    </header>
  );
};

export default Header;
