import React, { useState } from "react";
import Header from "../components/Header";
import { Link, Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useThemeContext } from "../context/GlobalContext";
import ProfileSelect from "../components/ProfileSelect";
import { useMediaQuery } from "react-responsive";
import { Images } from "../assets/Assets";
import {
  ARRIVALS,
  CARD_ALLOCATION,
  CEREMONIES,
  CONTACTS,
  DASHBOARD,
  DEPARTURES,
  EVENTS,
  GIFTS,
  GIFT_ALLOCATION,
  INVITATION_CARDS,
  INVITEES,
  RECEIVED_GIFTS,
  RSVP,
  SAMAGRI,
  VENDORS,
  VENUES,
} from "../routes/Names";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/20/solid";
import { BellIcon } from "@heroicons/react/24/outline";

const Dashboard = () => {
  const { toggleSidebarWithTitle, isSidebarOpenWithTitle, toggleSidebar } = useThemeContext();

  const isTablet = useMediaQuery({ maxWidth: 1024 });

  const location = useLocation();

  const sidebarMenuItems = [
    {
      label: "Dashboard",
      iconActive: <img src={Images.USERGREEN} alt="Users Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.USERS} alt="Users Icon" className="h-5 w-5" />,
      path: DASHBOARD,
      active: location.pathname.startsWith(DASHBOARD),
    },

    {
      label: "Venues",
      iconActive: <img src={Images.SERVICESGREEN} alt="Services Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.SERVICES} alt="Services Icon" className="h-5 w-5" />,
      path: VENUES,
      active: location.pathname.startsWith(VENUES),
    },
    {
      label: "Events",
      iconActive: <img src={Images.REPORTGREEN} alt="Reports Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.REPORTS} alt="Reports Icon" className="h-5 w-5" />,
      path: EVENTS,
      active: location.pathname.startsWith(EVENTS),
    },

    {
      label: "Ceremonies",
      iconActive: <img src={Images.NOTIFICATIONGREEN} alt="Reports Icon" className="h-5 w-5" />,
      iconInactive: <BellIcon className="h-5 w-5" />,
      path: CEREMONIES,
      active: location.pathname.startsWith(CEREMONIES),
    },

    {
      label: "Invitees",
      iconActive: <img src={Images.USERGREEN} alt="Users Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.USERS} alt="Users Icon" className="h-5 w-5" />,
      path: INVITEES,
      active: location.pathname.startsWith(INVITEES),
    },

    {
      label: "Contacts",
      iconActive: <img src={Images.SERVICESGREEN} alt="Services Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.SERVICES} alt="Services Icon" className="h-5 w-5" />,
      path: CONTACTS,
      active: location.pathname.startsWith(CONTACTS),
    },
    {
      label: "RSVP",
      iconActive: <img src={Images.REPORTGREEN} alt="Reports Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.REPORTS} alt="Reports Icon" className="h-5 w-5" />,
      path: RSVP,
      active: location.pathname.startsWith(RSVP),
    },

    {
      label: "Gifts",
      iconActive: <img src={Images.NOTIFICATIONGREEN} alt="Reports Icon" className="h-5 w-5" />,
      iconInactive: <BellIcon className="h-5 w-5" />,
      path: GIFTS,
      active: location.pathname.startsWith(GIFTS),
    },
    {
      label: "Gift Allocation",
      iconActive: <img src={Images.USERGREEN} alt="Users Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.USERS} alt="Users Icon" className="h-5 w-5" />,
      path: GIFT_ALLOCATION,
      active: location.pathname.startsWith(GIFT_ALLOCATION),
    },

    {
      label: "Received Gifts",
      iconActive: <img src={Images.SERVICESGREEN} alt="Services Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.SERVICES} alt="Services Icon" className="h-5 w-5" />,
      path: RECEIVED_GIFTS,
      active: location.pathname.startsWith(RECEIVED_GIFTS),
    },
    {
      label: "Invitation Cards",
      iconActive: <img src={Images.REPORTGREEN} alt="Reports Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.REPORTS} alt="Reports Icon" className="h-5 w-5" />,
      path: INVITATION_CARDS,
      active: location.pathname.startsWith(INVITATION_CARDS),
    },

    // {
    //   label: "Card Allocation",
    //   iconActive: <img src={Images.NOTIFICATIONGREEN} alt="Reports Icon" className="w-5 h-5" />,
    //   iconInactive: <BellIcon className="w-5 h-5" />,
    //   path: CARD_ALLOCATION,
    //   active: location.pathname.startsWith(CARD_ALLOCATION),
    // },
    {
      label: "Samagri",
      iconActive: <img src={Images.USERGREEN} alt="Users Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.USERS} alt="Users Icon" className="h-5 w-5" />,
      path: SAMAGRI,
      active: location.pathname.startsWith(SAMAGRI),
    },

    {
      label: "Vendors",
      iconActive: <img src={Images.SERVICESGREEN} alt="Services Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.SERVICES} alt="Services Icon" className="h-5 w-5" />,
      path: VENDORS,
      active: location.pathname.startsWith(VENDORS),
    },
    {
      label: "Arrivals",
      iconActive: <img src={Images.REPORTGREEN} alt="Reports Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.REPORTS} alt="Reports Icon" className="h-5 w-5" />,
      path: ARRIVALS,
      active: location.pathname.startsWith(ARRIVALS),
    },

    {
      label: "Departures",
      iconActive: <img src={Images.NOTIFICATIONGREEN} alt="Reports Icon" className="h-5 w-5" />,
      iconInactive: <BellIcon className="h-5 w-5" />,
      path: DEPARTURES,
      active: location.pathname.startsWith(DEPARTURES),
    },
  ];

  console.log({ location });

  // const [sidebarWithTitle, setSidebarWithTitle] = useState(true);

  // const [removeFromScreen, setRemovefromScreen] = useState(false);

  // const toggleSidebarWithTitle = () => {
  //   setSidebarWithTitle(!sidebarWithTitle);
  // };

  // const toggleRemove = () => {
  //   setRemovefromScreen(!removeFromScreen);
  //   setSidebarWithTitle(true);
  // };

  return (
    <>
      {/* Sidebar */}
      {/* <div
        className={`transform border-r border-gray-200 transition-all duration-300 ${removeFromScreen ? "absolute -left-68 top-0 w-0" : sidebarWithTitle ? "w-64" : "w-20"}`}
      >
        {!isTablet && (
          <div
            onClick={toggleSidebarWithTitle}
            className="absolute z-40 flex items-center justify-center w-8 h-8 border border-gray-200 rounded-full cursor-pointer -right-4 top-5 bg-primary"
          >
            {sidebarWithTitle ? <ArrowLeftIcon className="w-4 h-4" /> : <ArrowRightIcon className="w-4 h-4" />}
          </div>
        )}
        {sidebarWithTitle && (
          <div className="px-12 mt-5">
            <img src={Images.LOGO1} className="w-full h-full" alt="Logo" />
          </div>
        )}

        <nav className="flex h-[90vh] w-full flex-col overflow-y-auto py-4 pr-4">
          <ul className="flex-grow space-y-3">
            {sidebarMenuItems.map((menuItem, index) => (
              <li key={index}>
                <Link
                  className={`flex items-center gap-x-3.5 px-5 py-2.5 text-sm font-medium xl:rounded-br-10 xl:rounded-tr-10 3xl:px-8 ${
                    menuItem.active ? "bg-primary text-white" : "text-info-color"
                  }`}
                  to={menuItem.path}
                >
                  <span className="shrink-0"> {menuItem.active ? menuItem.iconActive : menuItem.iconInactive}</span>
                  {sidebarWithTitle ? menuItem.label : ""}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div> */}

      <Header />

      {location.pathname === "/event-screen" ? (
        <></>
      ) : (
        <>
          <Sidebar />
        </>
      )}

      {/* <div className="w-full"> */}
      {/* Header */}
      {/* <div className="relative flex h-[10vh] items-center justify-between shadow-card">
          <div className="flex">
            {isTablet && (
              <button className="ml-5" onClick={toggleRemove}>
                Click me
              </button>
            )}

            <h1 className="ml-8 text-xl font-semibold">Planned Forever</h1>
          </div>
          <div className="">
            <ProfileSelect />
          </div>
        </div> */}

      {/* Outlet */}
      <div
        className={`${location.pathname === "/event-screen" ? "flex min-h-[90vh] w-full items-center justify-center" : `${isSidebarOpenWithTitle ? "xl:ltr:pl-68 xl:rtl:pr-68" : "xl:ltr:pl-28 xl:rtl:pr-28"} h-full overflow-y-auto  p-8`}`}
      >
        <Outlet />
      </div>
      {/* </div> */}
    </>
  );
};

export default Dashboard;
