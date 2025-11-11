import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Images } from "../assets/Assets";
import { useMediaQuery } from "react-responsive";
import { useThemeContext } from "../context/GlobalContext";

import {
  CARS,
  RSVP,
  MENU,
  GIFTS,
  USERS,
  EVENTS,
  VENUES,
  HOTELS,
  SAMAGRI,
  VENDORS,
  PROFILE,
  ARRIVALS,
  INVITEES,
  SEND_SMS,
  CALENDAR,
  CONTACTS,
  DASHBOARD,
  HOTELROOM,
  USER_TYPE,
  CEREMONIES,
  CHECKLISTS,
  DEPARTURES,
  CARALLOCATION,
  ADD_USER_TYPE,
  RECEIVED_GIFTS,
  GIFT_ALLOCATION,
  INVITATION_CARDS,
  SCHEDULE_SEND_SMS,
  QUICK_CONTACT,
  EXPORT_DATA,
  GREETINGS,
  TASKS,
  CARD_ALLOCATION,
  SEND_EMAIL,
  BUDGET,
  REPORTS,
  SERVICE_REQUESTS,
  CATEGORY,
  SUB_CATEGORY,
  FURTHER_CLASSIFICATION,
  VENDOR_TAGS,
  RECOMMENDED_VENDOR,
  TICKET_CUSTOM_FIELD,
  TICKET_CUSTOM_FIELD_DETAIL,
  TICKET_CUSTOM_FIELD_LIBRARY,
  TICKET_CATEGORY,
  TICKET_SUB_CATEGORY,
  TICKET_FURTHER_CLASSIFICATION,
  CARD_SCHEDULE,
  NEARBY_ATTRACTIONS,
  LIVE_EVENT,
  RECOMMENDED_VENUE,
  TRENDING_CEREMONIES,
  RECOMMENDED_CEREMONIES,
  RECOMMENDED_SAMAGRI,
  TRENDING_MENU,
  PANCHANG_CALENDAR,
  RECOMMENDED_VENDORS,
  DOUBLE_TICK,
  DOUBLE_TICK_LIST,
  GUEST_FLIGHTS,
  GUEST_TRAINS,
  HOTEL_ROOM_SETUP,
  QR_OVERVIEW,
} from "../routes/Names";

import {
  ArrowDownCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  CalendarIcon,
  CheckBadgeIcon,
  CheckIcon,
  ChevronDownIcon,
  ClipboardDocumentListIcon,
  CurrencyRupeeIcon,
  DevicePhoneMobileIcon,
  GiftIcon,
  PrinterIcon,
  QrCodeIcon,
  UserCircleIcon,
  UserGroupIcon,
  UserIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

const Sidebar = () => {
  // Translation
  const { t } = useTranslation("common");

  // use context
  const { isSidebarOpen, toggleSidebar, toggleSidebarWithTitle, isSidebarOpenWithTitle, userData, setIsSidebarOpenWithTitle, toggleClick } =
    useThemeContext();

  const navigate = useNavigate();
  const location = useLocation();

  // Media Queries
  const isTablet = useMediaQuery({ maxWidth: 1024 });

  // sidebar items
  const sidebarMenuItems = [
    {
      label: t("pageTitles.dashboard"),
      iconActive: <img src={Images.USERGREEN} alt="Users Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.USERS} alt="Users Icon" className="h-5 w-5" />,
      path: DASHBOARD,
      active: location.pathname.startsWith(DASHBOARD),
      permissions: ["dashboard-view"],
    },
    {
      label: t("pageTitles.venues"),
      iconActive: <img src={Images.VENUEGREEN} alt="Venues Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.VENUE} alt="Venues Icon" className="h-5 w-5" />,
      path: VENUES,
      active: location.pathname.startsWith(VENUES) || location.pathname.startsWith(RECOMMENDED_VENUE),
      permissions: ["venues-delete", "venues-view", "venues-edit", "venues-create"],
    },
    {
      label: t("pageTitles.ceremonies"),
      iconActive: <img src={Images.CEREMONIESGREEN} alt="Ceremonies Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.CEREMONIES} alt="Ceremonies Icon" className="h-5 w-5" />,
      path: CEREMONIES,
      active:
        location.pathname.startsWith(CEREMONIES) ||
        location.pathname.startsWith(RECOMMENDED_CEREMONIES) ||
        location.pathname.startsWith(TRENDING_CEREMONIES),
      permissions: ["ceremonies-delete", "ceremonies-view", "ceremonies-edit", "ceremonies-create"],
    },
    {
      label: t("pageTitles.menu"),
      iconActive: <img src={Images.MENUGREEN} alt="Menu Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.MENU} alt="Menu Icon" className="h-5 w-5" />,
      path: MENU,
      active: location.pathname.startsWith(MENU) || location.pathname.startsWith(TRENDING_MENU),
      permissions: ["menu-create", "menu-view", "menu-edit", "menu-delete"],
    },
    {
      label: t("pageTitles.contacts"),
      iconActive: <img src={Images.CONTACTGREEN} alt="Contacts Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.CONTACT} alt="Contacts Icon" className="h-5 w-5" />,
      path: CONTACTS,
      active: location.pathname.startsWith(CONTACTS),
      permissions: ["contacts-delete", "contacts-view", "contacts-edit", "contacts-create"],
    },
    {
      label: t("pageTitles.qrCodesOverview"),
      iconActive: <QrCodeIcon className="h-6 w-6 text-secondary" />,
      iconInactive: <QrCodeIcon className="h-6 w-6" />,
      path: QR_OVERVIEW,
      active: location.pathname.startsWith(QR_OVERVIEW),
      permissions: ["qr-code-overview-delete", "qr-code-overview-view", "qr-code-overview-edit", "qr-code-overview-create"],
    },
    {
      label: t("pageTitles.doubleTick"),
      iconActive: <img src={Images.DOUBLE_ACTIVE} alt="double Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.DOUBLE_INACTIVE} alt="double Icon" className="h-5 w-5" />,
      path: DOUBLE_TICK,
      active: location.pathname.startsWith(DOUBLE_TICK),
      permissions: ["contacts-delete", "contacts-view", "contacts-edit", "contacts-create"],
    },
    {
      label: t("pageTitles.invitees"),
      iconActive: <img src={Images.INVITEEGREEN} alt="Invitees Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.INVITEE} alt="Invitees Icon" className="h-5 w-5" />,
      path: INVITEES,
      active: location.pathname.startsWith(INVITEES),
      permissions: ["invitees-view"],
    },
    {
      label: t("pageTitles.rsvp"),
      iconActive: <img src={Images.REPORTGREEN} alt="RSVP Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.REPORTS} alt="RSVP Icon" className="h-5 w-5" />,
      path: RSVP,
      active: location.pathname.startsWith(RSVP),
      permissions: ["rsvp-view"],
    },
    {
      label: t("pageTitles.gifts"),
      iconActive: <GiftIcon className="h-5 w-5 text-secondary" />,
      iconInactive: <GiftIcon className="h-5 w-5" />,
      path: GIFTS,
      active: location.pathname.startsWith(GIFTS),
      permissions: ["gifts-delete", "gifts-view", "gifts-edit", "gifts-create"],
    },
    {
      label: t("pageTitles.gift-allocation"),
      iconActive: <img src={Images.GIFTALLOCATIONGREEN} alt="Gift Allocation Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.GIFTALLOCATION} alt="Gift Allocation Icon" className="h-5 w-5" />,
      path: GIFT_ALLOCATION,
      active: location.pathname.startsWith(GIFT_ALLOCATION),
      permissions: ["gift-allocation-view"],
    },
    {
      label: t("pageTitles.received-gifts"),
      iconActive: <img src={Images.RECEIVEDGIFTGREEN} alt="Received Gifts Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.RECEIVEDGIFT} alt="Received Gifts Icon" className="h-5 w-5" />,
      path: RECEIVED_GIFTS,
      active: location.pathname.startsWith(RECEIVED_GIFTS),
      permissions: ["received-gifts-delete", "received-gifts-view", "received-gifts-edit", "received-gifts-create"],
    },
    {
      label: t("pageTitles.invitation-cards"),
      iconActive: <img src={Images.INVITATIONCARDGREEN} alt="Invitation Cards Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.INVITATIONCARD} alt="Invitation Cards Icon" className="h-5 w-5" />,
      path: INVITATION_CARDS,
      active: location.pathname.startsWith(INVITATION_CARDS),
      permissions: ["invitation-cards-create", "invitation-cards-view", "invitation-cards-edit", "invitation-cards-delete"],
    },
    {
      label: t("pageTitles.card-allocation"),
      iconActive: <img src={Images.CARD_ALLOCATION_GREEN} alt="Card Allocation Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.CARD_ALLOCATION} alt="Card Allocation Icon" className="h-5 w-5" />,
      path: CARD_ALLOCATION,
      active: location.pathname.startsWith(CARD_ALLOCATION),
      permissions: ["card-allocation-view"],
    },
    {
      label: t("pageTitles.card-schedule"),
      iconActive: <img src={Images.SMSGREEN} alt="Card Schedule Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.SMS} alt="Card Schedule Icon" className="h-5 w-5" />,
      path: CARD_SCHEDULE,
      active: location.pathname.startsWith(CARD_SCHEDULE),
    },
    {
      label: t("pageTitles.samagri"),
      iconActive: <img src={Images.SAMAGRIGREEN} alt="Samagri Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.SAMAGRI} alt="Samagri Icon" className="h-5 w-5" />,
      path: SAMAGRI,
      active: location.pathname.startsWith(SAMAGRI) || location.pathname.startsWith(RECOMMENDED_SAMAGRI),
      permissions: ["samagri-delete", "samagri-view", "samagri-edit", "samagri-create"],
    },
    {
      label: t("pageTitles.vendors"),
      iconActive: <img src={Images.VENDORGREEN} alt="Vendors Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.VENDOR} alt="Vendors Icon" className="h-5 w-5" />,
      path: VENDORS,
      active: location.pathname.startsWith(VENDORS) || location.pathname.startsWith(RECOMMENDED_VENDORS),
      permissions: ["vendors-create", "vendors-view", "vendors-edit", "vendors-delete"],
    },
    {
      label: t("pageTitles.arrivals"),
      iconActive: <img src={Images.ARRIVALGREEN} alt="Arrivals Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.ARRIVALS} alt="Arrivals Icon" className="h-5 w-5" />,
      path: ARRIVALS,
      active: location.pathname.startsWith(ARRIVALS),
      permissions: ["arrivals-create", "arrivals-view", "arrivals-edit", "arrivals-delete"],
    },
    {
      label: t("pageTitles.departures"),
      iconActive: <img src={Images.DEPARTUREGREEN} alt="Departures Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.DEPARTURE} alt="Departures Icon" className="h-5 w-5" />,
      path: DEPARTURES,
      active: location.pathname.startsWith(DEPARTURES),
      permissions: ["departures-delete", "departures-view", "departures-edit", "departures-create"],
    },
    {
      label: t("pageTitles.hotels"),
      iconActive: <img src={Images.HOTELGREEN} alt="Hotel Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.HOTEL} alt="Hotel Icon" className="h-5 w-5" />,
      path: HOTELS,
      active: location.pathname.startsWith(HOTELS),
      permissions: ["hotels-create", "hotels-view", "hotels-edit", "hotels-delete"],
    },
    {
      label: t("pageTitles.hotel-room-setup"),
      iconActive: <img src={Images.HOTELROOMGREEN} alt="Hotel Room Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.HOTELROOM} alt="Hotel Room Icon" className="h-5 w-5" />,
      path: HOTEL_ROOM_SETUP,
      active: location.pathname.startsWith(HOTEL_ROOM_SETUP),
      permissions: ["hotel-rooms-delete", "hotel-rooms-view", "hotel-rooms-edit", "hotel-rooms-create"],
    },
    {
      label: t("pageTitles.allocated-rooms"),
      iconActive: <img src={Images.HOTELROOMGREEN} alt="Hotel Room Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.HOTELROOM} alt="Hotel Room Icon" className="h-5 w-5" />,
      path: HOTELROOM,
      active: location.pathname.startsWith(HOTELROOM),
      permissions: ["allocated-rooms-delete", "allocated-rooms-view", "allocated-rooms-edit", "allocated-rooms-create"],
    },
    {
      label: t("pageTitles.cars"),
      iconActive: <img src={Images.CARGREEN} alt="Cars Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.CAR} alt="Cars Icon" className="h-5 w-5" />,
      path: CARS,
      active: location.pathname.startsWith(CARS),
      permissions: ["cars-create", "cars-view", "cars-edit", "cars-delete"],
    },
    {
      label: t("pageTitles.car-allocation"),
      iconActive: <img src={Images.CARALLOCATIONGREEN} alt="Car Allocation Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.CARALLOCATION} alt="Car Allocation Icon" className="h-5 w-5" />,
      path: CARALLOCATION,
      active: location.pathname.startsWith(CARALLOCATION),
      permissions: ["car-allocation-delete", "car-allocation-view", "car-allocation-edit", "car-allocation-create"],
    },
    {
      label: t("pageTitles.guestFlightsTitle"),
      iconActive: <img src={Images.ARRIVALGREEN} alt="Guest Flights Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.ARRIVALS} alt="Guest Flights Icon" className="h-5 w-5" />,
      path: GUEST_FLIGHTS,
      active: location.pathname.startsWith(GUEST_FLIGHTS),
      permissions: ["guest-flights-delete", "guest-flights-view", "guest-flights-edit", "guest-flights-create"],
    },
    {
      label: t("pageTitles.guestTrainsTitle"),
      iconActive: <img src={Images.TRAIN_ACTIVE} alt="Guest trains Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.TRAIN_INACTIVE} alt="Guest trains Icon" className="h-5 w-5" />,
      path: GUEST_TRAINS,
      active: location.pathname.startsWith(GUEST_TRAINS),
      permissions: ["guest-trains-delete", "guest-trains-view", "guest-trains-edit", "guest-trains-create"],
    },
    // {
    //   label: t("pageTitles.send-sms"),
    //   iconActive: <DevicePhoneMobileIcon className="h-5 w-5" />,
    //   iconInactive: <DevicePhoneMobileIcon className="h-5 w-5" />,
    //   path: SEND_SMS,
    //   active: location.pathname.startsWith(SEND_SMS),
    //   permissions: ["send-sms-view"],
    // },
    // {
    //   label: t("pageTitles.schedule-send-sms"),
    //   iconActive: <img src={Images.SMSGREEN} alt="Schedule/Send SMS Icon" className="h-5 w-5" />,
    //   iconInactive: <img src={Images.SMS} alt="Schedule/Send SMS Icon" className="h-5 w-5" />,
    //   path: SCHEDULE_SEND_SMS,
    //   active: location.pathname.startsWith(SCHEDULE_SEND_SMS),
    //   permissions: ["schedule/send-sms-view", "schedule/send-sms-create", "schedule/send-sms-edit", "schedule/send-sms-delete"],
    // },
    // {
    //   label: t("pageTitles.send-email"),
    //   iconActive: <img src={Images.REPORTGREEN} alt="Send Email Icon" className="w-5 h-5" />,
    //   iconInactive: <img src={Images.REPORTS} alt="Send Email Icon" className="w-5 h-5" />,
    //   path: SEND_EMAIL,
    //   active: location.pathname.startsWith(SEND_EMAIL),
    //   permissions: ["send-email-view"],
    // },
    // {
    //   label: t("pageTitles.greetings"),
    //   iconActive: <img src={Images.GREETINGGREEN} alt="Greetings Icon" className="h-5 w-5" />,
    //   iconInactive: <img src={Images.GREETING} alt="Greetings Icon" className="h-5 w-5" />,
    //   path: GREETINGS,
    //   active: location.pathname.startsWith(GREETINGS),
    //   permissions: ["greetings-view"],
    // },
    {
      label: t("pageTitles.budget"),
      iconActive: <CurrencyRupeeIcon className="h-5 w-5 text-secondary" />,
      iconInactive: <CurrencyRupeeIcon className="h-5 w-5" />,
      path: BUDGET,
      active: location.pathname.startsWith(BUDGET),
      permissions: ["budget-view"],
    },
    {
      label: t("pageTitles.calendar"),
      iconActive: <CalendarIcon className="h-5 w-5" />,
      iconInactive: <CalendarIcon className="h-5 w-5" />,
      path: CALENDAR,
      active: location.pathname.startsWith(CALENDAR),
      permissions: ["calendar-view"],
    },
    {
      label: t("pageTitles.tasks"),
      iconActive: <ClipboardDocumentListIcon className="h-5 w-5 text-secondary" />,
      iconInactive: <ClipboardDocumentListIcon className="h-5 w-5" />,
      path: TASKS,
      active: location.pathname.startsWith(TASKS),
      permissions: ["tasks-delete", "tasks-view", "tasks-edit", "tasks-create"],
    },
    {
      label: t("pageTitles.quick-contact"),
      iconActive: <UserIcon className="h-5 w-5 text-secondary" />,
      iconInactive: <UserIcon className="h-5 w-5" />,
      path: QUICK_CONTACT,
      active: location.pathname.startsWith(QUICK_CONTACT),
      permissions: ["quick-contact-delete", "quick-contact-view", "quick-contact-edit", "quick-contact-create"],
    },
    {
      label: t("pageTitles.user-type"),
      iconActive: <img src={Images.USERTYPEGREEN} alt="User Type Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.USERTYPE} alt="User Type Icon" className="h-5 w-5" />,
      path: USER_TYPE,
      active: location.pathname.startsWith(USER_TYPE) || location.pathname.startsWith(ADD_USER_TYPE),
    },
    {
      label: t("pageTitles.users"),
      iconActive: <UserGroupIcon className="h-5 w-5 text-secondary" />,
      iconInactive: <UserGroupIcon className="h-5 w-5" />,
      path: USERS,
      active: location.pathname.startsWith(USERS),
      permissions: ["users-create", "users-view", "users-edit", "users-delete"],
    },
    {
      label: t("pageTitles.profile"),
      iconActive: <UserCircleIcon className="h-5 w-5 text-secondary" />,
      iconInactive: <UserCircleIcon className="h-5 w-5" />,
      path: PROFILE,
      active: location.pathname.startsWith(PROFILE),
      permissions: ["my-profile-view"],
    },
    {
      label: t("pageTitles.reports"),
      iconActive: <PrinterIcon className="h-5 w-5 text-secondary" />,
      iconInactive: <PrinterIcon className="h-5 w-5" />,
      path: REPORTS,
      active: location.pathname.startsWith(REPORTS),
      permissions: ["reports-view"],
    },
    {
      label: t("pageTitles.export-data"),
      iconActive: <ArrowDownCircleIcon className="h-5 w-5 text-secondary" />,
      iconInactive: <ArrowDownCircleIcon className="h-5 w-5" />,
      path: EXPORT_DATA,
      active: location.pathname.startsWith(EXPORT_DATA),
      permissions: ["export-data-view"],
    },
    {
      label: t("pageTitles.service-requests"),
      iconActive: <WrenchScrewdriverIcon className="h-5 w-5 text-secondary" />,
      iconInactive: <WrenchScrewdriverIcon className="h-5 w-5" />,
      path: SERVICE_REQUESTS,
      active: location.pathname.startsWith(SERVICE_REQUESTS),
      permissions: ["service-requests-view"],
    },
    // {
    //   label: t("pageTitles.nearby-attractions"),
    //   iconActive: <img src={Images.USERTYPEGREEN} alt="User Type Icon" className="h-5 w-5" />,
    //   iconInactive: <img src={Images.USERTYPE} alt="User Type Icon" className="h-5 w-5" />,
    //   path: NEARBY_ATTRACTIONS,
    //   active: location.pathname.startsWith(NEARBY_ATTRACTIONS),
    //   permissions: ["nearby-attractions-create", "nearby-attractions-view", "nearby-attractions-delete", "nearby-attractions-edit"],
    // },
    {
      label: t("pageTitles.live-event"),
      iconActive: <img src={Images.USERTYPEGREEN} alt="User Type Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.USERTYPE} alt="User Type Icon" className="h-5 w-5" />,
      path: LIVE_EVENT,
      active: location.pathname.startsWith(LIVE_EVENT),
      permissions: ["live-event-view"],
    },
    {
      label: t("pageTitles.panchang-calendar"),
      iconActive: <CalendarIcon className="h-5 w-5" />,
      iconInactive: <CalendarIcon className="h-5 w-5" />,
      path: PANCHANG_CALENDAR,
      active: location.pathname.startsWith(PANCHANG_CALENDAR),
      permissions: ["panchang-caldendar-view"],
    },
  ];

  // Filter menu items based on user permissions
  //  const filteredSidebarMenuItems = sidebarMenuItems?.filter((menuItem) => {
  //   if (userData?.role.display_name === "web_admin") {
  //     return true;
  //   } else if (userData?.role?.permissions) {
  //     const permissionNames = userData.role.permissions?.some.map(permission => permission.name);
  //     return permissionNames.includes(menuItem?.label);
  //   }
  //   return false;
  // });

  const filteredSidebarMenuItems = sidebarMenuItems?.filter((menuItem) => {
    if (userData?.role?.display_name === "web_admin") {
      return true;
    } else if (userData?.role?.permissions) {
      const userPermissions = userData.role.permissions?.map((permission) => permission.name); // Get user's permissions array
      console.log("User Permissions:", { userPermissions });
      return menuItem.permissions?.some((permission) => userPermissions.includes(permission)) || false;
    }
    return false;
  });

  // State to track the active menu item based on path
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [activeSubmenuItemIndex, setActiveSubmenuItemIndex] = useState(null);
  const [activeTicketsSubmenuItemIndex, setActiveTicketsSubmenuItemIndex] = useState(null);

  // Sync active tab with the current path when the page loads or path changes

  // Handle menu item click
  const handleMenuItemClick = (index, path) => {
    setActiveItemIndex(index); // Update active item when clicked
    navigate(path); // Navigate to the selected page path
    setActiveSubmenuItemIndex(null); // Reset submenus
    setActiveTicketsSubmenuItemIndex(null); // Reset ticket submenus
  };

  // Handle submenu item click
  const handleSubmenuItemClick = (index, path) => {
    setActiveSubmenuItemIndex(index); // Set active for submenu
    setActiveItemIndex(null); // Reset main sidebar
    setActiveTicketsSubmenuItemIndex(null); // Reset ticket submenus
    navigate(path);
  };

  // Handle ticket submenu item click
  const handleTicketsSubmenuItemClick = (index, path) => {
    setActiveTicketsSubmenuItemIndex(index); // Set active for ticket submenu
    setActiveItemIndex(null); // Reset main sidebar
    setActiveSubmenuItemIndex(null); // Reset submenus
    navigate(path);
  };

  const sidebarSubmenuItems = [
    // {
    //   label: "Category",
    //   iconActive: <ClipboardDocumentListIcon className="w-5 h-5 text-secondary" />,
    //   iconInactive: <ClipboardDocumentListIcon className="w-5 h-5" />,
    //   path: CATEGORY,
    //   active: location.pathname.startsWith(CATEGORY),
    // },

    // {
    //   label: "Sub Category",
    //   iconActive: <ClipboardDocumentListIcon className="w-5 h-5 text-secondary" />,
    //   iconInactive: <ClipboardDocumentListIcon className="w-5 h-5" />,
    //   path: SUB_CATEGORY,
    //   active: location.pathname.startsWith(SUB_CATEGORY),
    // },
    // {
    //   label: "Classification",
    //   iconActive: <CalendarDaysIcon className="w-5 h-5 text-secondary" />,
    //   iconInactive: <CalendarDaysIcon className="w-5 h-5" />,
    //   path: FURTHER_CLASSIFICATION,
    //   active: location.pathname.startsWith(FURTHER_CLASSIFICATION),
    // },

    // {
    //   label: "Vendor Tags",
    //   iconActive: <img src={Images.VENDORGREEN} alt="Vendors Icon" className="w-5 h-5" />,
    //   iconInactive: <img src={Images.VENDOR} alt="Vendors Icon" className="w-5 h-5" />,
    //   path: VENDOR_TAGS,
    //   active: location.pathname.startsWith(VENDOR_TAGS),
    // },
    {
      label: "Vendor List",
      iconActive: <img src={Images.VENDORGREEN} alt="Vendors Icon" className="h-5 w-5" />,
      iconInactive: <img src={Images.VENDOR} alt="Vendors Icon" className="h-5 w-5" />,
      path: RECOMMENDED_VENDOR,
      active: location.pathname.startsWith(RECOMMENDED_VENDOR),
    },
  ];

  // const filteredSidebarSubmenuItems = sidebarSubmenuItems?.filter((menuItem) => {
  //   if (userData?.role === "superAdmin") {
  //     return true;
  //   } else if (userData?.role?.permissions) {
  //     return userData?.role?.permissions?.includes(menuItem?.label);
  //   }
  //   return false;
  // });

  const sidebarTicketsSubmenuItems = [
    {
      label: t("pageTitles.ticket-custom-field"),
      iconActive: <ClipboardDocumentListIcon className="h-5 w-5 text-secondary" />,
      iconInactive: <ClipboardDocumentListIcon className="h-5 w-5" />,
      path: TICKET_CUSTOM_FIELD_DETAIL,
      active: location.pathname.startsWith(TICKET_CUSTOM_FIELD_DETAIL),
    },
    {
      label: t("pageTitles.ticket-custom-field-library"),
      iconActive: <CalendarDaysIcon className="h-5 w-5 text-secondary" />,
      iconInactive: <CalendarDaysIcon className="h-5 w-5" />,
      path: TICKET_CUSTOM_FIELD_LIBRARY,
      active: location.pathname.startsWith(TICKET_CUSTOM_FIELD_LIBRARY),
    },
    {
      label: t("pageTitles.ticket-category"),
      iconActive: <ClipboardDocumentListIcon className="h-5 w-5 text-secondary" />,
      iconInactive: <ClipboardDocumentListIcon className="h-5 w-5" />,
      path: TICKET_CATEGORY,
      active: location.pathname.startsWith(TICKET_CATEGORY),
    },
    {
      label: t("pageTitles.ticket-sub-category"),
      iconActive: <ClipboardDocumentListIcon className="h-5 w-5 text-secondary" />,
      iconInactive: <ClipboardDocumentListIcon className="h-5 w-5" />,
      path: TICKET_SUB_CATEGORY,
      active: location.pathname.startsWith(TICKET_SUB_CATEGORY),
    },
    {
      label: t("pageTitles.ticket-classification"),
      iconActive: <WrenchScrewdriverIcon className="h-5 w-5 text-secondary" />,
      iconInactive: <WrenchScrewdriverIcon className="h-5 w-5" />,
      path: TICKET_FURTHER_CLASSIFICATION,
      active: location.pathname.startsWith(TICKET_FURTHER_CLASSIFICATION),
    },
  ];

  // const filteredSidebarServiceSubmenuItems = sidebarTicketsSubmenuItems?.filter((menuItem) => {
  //   if (userData?.role === "superAdmin") {
  //     return true;
  //   } else if (userData?.role?.permissions) {
  //     return userData?.role?.permissions?.includes(menuItem?.label);
  //   }
  //   return false;
  // });

  useEffect(() => {
    const currentPath = location.pathname;

    // Define a list of valid routes that aren't part of the sidebar menu (if applicable)
    const validNonSidebarPaths = [
      "/dashboard",

      "/venues",
      "/venue-print",
      "/recommended-venues",

      "/ceremonies",
      "/ceremonies-print",
      "/trending-ceremonies",
      "/recommended-ceremonies",

      "/menu",
      "/menu-print",
      "/trending-menu",

      "/contacts",
      "/add-contact",
      "/contact-print",
      "/contact-detail",

      "/invitees",
      "/invitees-print",

      "/rsvp",
      "/rsvp-print",

      "/gifts",
      "/gift-print",

      "/gift-allocation",
      "/gift-allocation-print",

      "/received-gifts",
      "/received-gift-print",

      "/invitation-cards",
      "/invitation-card-print",

      "/card-allocation",
      "/card-allocation-print",

      "/card-schedule",

      "/samagri",
      "/samagri-print",
      "/recommended-samagri",

      "/vendors",
      "/vendor-print",
      "/recommended-vendors",

      "/arrivals",
      "/arrival-print",

      "/departures",
      "/departure-print",

      "/hotels",
      "/hotel-print",

      "/hotel-room",
      "/hotel-room-print",

      "/cars",
      "/car-print",

      "/car-allocation",
      "/car-allocation-print",

      "/send-sms",

      "/schedule-send-sms",

      "/send-email",

      "/greetings",

      "/budget",

      "/calendar",

      "/tasks",
      "/task-print",

      "/quick-contact",

      "/user-type",
      "/add-user-type",

      "/users",

      "/profile",

      "/reports",

      "/export-data",

      "/service-requests",

      "/nearby-attractions",

      "/live-event-streaming",

      "/panchang-calendar",

      "/ticket-field-detail",
      "/ticket-field-library",
      "/ticket-category",
      "/ticket-sub-category",
      "/ticket-further-classification",
      "/templates-list",
      "/guest-flights",
      "/guest-trains",
      "/guest-flights-print",
      "/guest-trains-print",
      "/qr-overview-print"
      // "/forgot-password",
      // "/reset-password/:id",
      // "/events",
      // "/event-print",
      // "/import-contact",
      // "/checklists",
      // "/category",
      // "/sub-category",
      // "/further-classification",
      // "/vendor-list",
      // "/vendor-tags",
      // "/ticket-custom-field",
    ];

    // Add more valid routes as needed

    // Check if the current path exists in the sidebar menu items
    // const foundIndex = filteredSidebarMenuItems.findIndex(menuItem => menuItem.path === currentPath);

    // if (foundIndex !== -1) {
    //   setActiveItemIndex(foundIndex); // Set the active item based on the current path
    // } else if (filteredSidebarMenuItems.length > 0 && !validNonSidebarPaths.includes(currentPath)) {
    //   // Only navigate if it's not a valid non-sidebar path
    //   navigate(filteredSidebarMenuItems[0].path); // Navigate to the first tab
    //   setActiveItemIndex(0); // Activate the first tab
    // }

    const foundSidebarIndex = filteredSidebarMenuItems.findIndex((menuItem) => menuItem.path === currentPath);
    const foundSubmenuIndex = sidebarSubmenuItems.findIndex((menuItem) => menuItem.path === currentPath);
    const foundTicketsSubmenuIndex = sidebarTicketsSubmenuItems.findIndex((menuItem) => menuItem.path === currentPath);

    if (foundSidebarIndex !== -1) {
      setActiveItemIndex(foundSidebarIndex); // Set the active item
      setActiveSubmenuItemIndex(null); // Reset submenu index
      setActiveTicketsSubmenuItemIndex(null); // Reset tickets submenu index
    } else if (foundSubmenuIndex !== -1) {
      setActiveSubmenuItemIndex(foundSubmenuIndex); // Set the submenu item active
      setActiveItemIndex(null); // Reset main sidebar index
      setActiveTicketsSubmenuItemIndex(null); // Reset tickets submenu index
    } else if (foundTicketsSubmenuIndex !== -1) {
      setActiveTicketsSubmenuItemIndex(foundTicketsSubmenuIndex); // Set the tickets submenu item active
      setActiveItemIndex(null); // Reset main sidebar index
      setActiveSubmenuItemIndex(null); // Reset submenu index
    } else if (filteredSidebarMenuItems.length > 0 && !validNonSidebarPaths.includes(currentPath)) {
      // If none of the indexes are found and the path is valid for the sidebar
      navigate(filteredSidebarMenuItems[0].path); // Navigate to the first sidebar item
      setActiveItemIndex(0); // Activate the first sidebar item
      setActiveSubmenuItemIndex(null); // Reset other indexes
      setActiveTicketsSubmenuItemIndex(null); // Reset other indexes
    }
  }, [location.pathname, filteredSidebarMenuItems, sidebarSubmenuItems, sidebarTicketsSubmenuItems, navigate]);

  return (
    <>
      <aside
        className={`fixed ${!isSidebarOpenWithTitle ? "w-[5.5rem]" : "w-64"} -left-full bottom-0 top-20 z-10 transform border-r border-gray-200 bg-white py-4 transition-all duration-300 xl:left-0 xl:h-screen
 xl:rtl:right-0 ${isSidebarOpen ? "left-0" : "-left-full"}`}
        onMouseEnter={() => setIsSidebarOpenWithTitle(true)}
        onMouseLeave={() => {
          if (!toggleClick) {
            setIsSidebarOpenWithTitle(false);
          }
        }}
      >
        <nav className=" flex h-[74vh] w-full flex-col overflow-y-auto pb-8 pt-4 xl:h-[87vh] ltr:pr-4 rtl:pl-4">
          <ul className="flex-grow space-y-3">
            {filteredSidebarMenuItems.map((menuItem, index) => (
              <li key={index} onClick={isTablet ? toggleSidebar : null}>
                <Link
                  className={`flex items-center gap-x-3.5 px-5 py-2.5 text-sm font-medium hover:rounded-10 hover:bg-gray-100 xl:ltr:rounded-br-10 xl:ltr:rounded-tr-10 xl:rtl:rounded-bl-10 xl:rtl:rounded-tl-10 ${
                    index === activeItemIndex ? "!bg-primary text-white" : "text-info-color"
                  }`}
                  to={menuItem.path}
                  onClick={(e) => {
                    e.preventDefault(); // Prevent default link behavior
                    handleMenuItemClick(index, menuItem.path); // Handle click to set active and navigate
                  }}
                >
                  <span className="shrink-0">{index === activeItemIndex ? menuItem.iconActive : menuItem.iconInactive}</span>
                  {isSidebarOpenWithTitle ? menuItem.label : ""}
                </Link>
              </li>
            ))}

            {/* Submenu Dropdown */}

            {/* {(userData?.role.display_name === "web_admin" || (userData?.role?.permissions && userData?.role?.permissions?.includes("Ticket Manager"))) && (
              <li>
                <details class="group [&_summary::-webkit-details-marker]:hidden">
                  <summary class="flex justify-between items-center px-5 py-2.5 text-sm font-medium rounded-lg cursor-pointer text-info-color hover:bg-gray-100 hover:text-gray-700 xl:rounded-br-10 xl:rounded-tr-10">
                    <div className="flex gap-x-3.5">
                      <span className="shrink-0">
                        <CheckBadgeIcon className="w-5 h-5" />
                      </span>
                      <span class="text-sm font-medium"> {isSidebarOpenWithTitle ? "Recommended" : ""} </span>
                    </div>

                    <span class="-ml-2 transition duration-300 shrink-0 group-open:-rotate-180">
                      <ChevronDownIcon className="w-4 h-4" />
                    </span>
                  </summary>

                  <ul class={`${isSidebarOpenWithTitle ? "pr-4 pl-6" : "pl-3"} mt-2 space-y-1`}>
                    {sidebarSubmenuItems.map((menuItem, index) => (
                      <li key={index} onClick={isTablet ? toggleSidebar : null}>
                        <Link
                          className={`flex items-center gap-x-3.5 rounded-10 p-2.5 text-sm font-medium transition duration-200 hover:bg-gray-100 ${
                            index === activeSubmenuItemIndex ? "!bg-primary text-white" : "text-info-color"
                          }`}
                          to={menuItem.path}
                          onClick={() => handleSubmenuItemClick(index, menuItem.path)}
                        >
                          <span className="shrink-0"> {menuItem.active ? menuItem.iconActive : menuItem.iconInactive}</span>
                          {isSidebarOpenWithTitle ? menuItem.label : ""}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
           )}  */}

            {(userData?.role.display_name === "web_admin" ||
              (userData?.role?.permissions && userData?.role?.permissions?.includes("Recommended"))) && (
              <li>
                <details class="group [&_summary::-webkit-details-marker]:hidden">
                  <summary class="flex cursor-pointer items-center justify-between rounded-lg px-5 py-2.5 text-sm font-medium text-info-color hover:bg-gray-100 hover:text-gray-700 xl:rounded-br-10 xl:rounded-tr-10">
                    <div className="flex gap-x-3.5">
                      <span className="shrink-0">
                        <WrenchScrewdriverIcon className="h-5 w-5" />
                      </span>
                      <span class="text-sm font-medium"> {isSidebarOpenWithTitle ? t("pageTitles.ticket-manager") : ""} </span>
                    </div>

                    <span class="-ml-2 shrink-0 transition duration-300 group-open:-rotate-180">
                      <ChevronDownIcon className="h-4 w-4" />
                    </span>
                  </summary>

                  <ul class={`${isSidebarOpenWithTitle ? "pl-6 pr-4" : "pl-3"} mt-2 space-y-1`}>
                    {sidebarTicketsSubmenuItems.map((menuItem, index) => (
                      <li key={index} onClick={isTablet ? toggleSidebar : null}>
                        <Link
                          className={`flex items-center gap-x-3.5 rounded-10 p-2.5 text-sm font-medium transition duration-200 hover:bg-gray-100 ${
                            index === activeTicketsSubmenuItemIndex ? "!bg-primary text-white" : "text-info-color"
                          }`}
                          to={menuItem.path}
                          onClick={() => handleTicketsSubmenuItemClick(index, menuItem.path)}
                        >
                          <span className="shrink-0"> {menuItem.active ? menuItem.iconActive : menuItem.iconInactive}</span>
                          {isSidebarOpenWithTitle ? menuItem.label : ""}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            )}
          </ul>
        </nav>
      </aside>

      {isSidebarOpen && <div className="fixed left-0 top-0 z-[5] h-screen w-screen bg-black opacity-50" onClick={toggleSidebar}></div>}
    </>
  );
};
export default Sidebar;
