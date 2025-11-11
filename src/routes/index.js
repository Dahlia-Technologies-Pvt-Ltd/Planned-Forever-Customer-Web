import {
  CARS,
  RSVP,
  MENU,
  USERS,
  LOGIN,
  GIFTS,
  VENUES,
  EVENTS,
  HOTELS,
  PROFILE,
  SAMAGRI,
  VENDORS,
  INVITEES,
  CONTACTS,
  ARRIVALS,
  SEND_SMS,
  CALENDAR,
  DASHBOARD,
  HOTELROOM,
  DEPARTURES,
  CHECKLISTS,
  CEREMONIES,
  ADD_CONTACT,
  CARALLOCATION,
  RECEIVED_GIFTS,
  CONTACT_DETAIL,
  IMPORT_CONTACT,
  RESET_PASSWORD,
  GIFT_ALLOCATION,
  CARD_ALLOCATION,
  FORGOT_PASSWORD,
  INVITATION_CARDS,
  SCHEDULE_SEND_SMS,
  USER_TYPE,
  ADD_USER_TYPE,
  QUICK_CONTACT,
  EXPORT_DATA,
  GREETINGS,
  TASKS,
  SEND_EMAIL,
  MENU_PRINT,
  CAR_PRINT,
  HOTEL_PRINT,
  VENDOR_PRINT,
  SAMAGRI_PRINT,
  GIFT_PRINT,
  CONTACT_PRINT,
  INVITATION_CARD_PRINT,
  EVENT_PRINT,
  VENUE_PRINT,
  GIFT_ALLOCATION_PRINT,
  RSVP_PRINT,
  BUDGET,
  REPORTS,
  INVITEES_PRINT,
  CEREMONIES_PRINT,
  ARRIVALS_PRINT,
  DEPARTURES_PRINT,
  RECEIVED_GIFT_PRINT,
  HOTEL_ROOM_PRINT,
  CAR_ALLOCATION_PRINT,
  SERVICE_REQUESTS,
  TASK_PRINT,
  CATEGORY,
  SUB_CATEGORY,
  FURTHER_CLASSIFICATION,
  VENDOR_TAGS,
  RECOMMENDED_VENDOR,
  TICKET_CATEGORY,
  TICKET_SUB_CATEGORY,
  TICKET_FURTHER_CLASSIFICATION,
  TICKET_CUSTOM_FIELD,
  TICKET_CUSTOM_FIELD_DETAIL,
  TICKET_CUSTOM_FIELD_LIBRARY,
  CARD_SCHEDULE,
  EVENT_SCREEN,
  RECOMMENDED_VENUES,
  TRENDING_CEREMONIES,
  RECOMMENDED_CEREMONIES,
  NEARBY_ATTRACTIONS,
  LIVE_EVENT,
  RECOMMENDED_SAMAGRI,
  TRENDING_MENU,
  PANCHANG_CALENDAR,
  RECOMMENDED_VENDORS,
  DOUBLE_TICK,
  DOUBLE_TICK_LIST,
  INVITATION_CARD_VIEW,
  GUEST_FLIGHTS,
  GUEST_TRAINS,
  GUEST_FLIGHTS_PRINT,
  GUEST_TRAINS_PRINT,
  HOTEL_ROOM_SETUP,
  QR_OVERVIEW,
  QR_OVERVIEW_PRINT,
  CARD_ALLOCATION_PRINT,
} from "./Names";

import Rsvp from "../pages/RSVP";
import Cars from "../pages/Cars";
import Menu from "../pages/Menu";
import Login from "../pages/Login";
import Users from "../pages/Users";
import Gifts from "../pages/Gifts";
import Venues from "../pages/Venues";
import Hotels from "../pages/Hotels";
import Events from "../pages/Events";
import Samagri from "../pages/Samagri";
import SendSms from "../pages/SendSms";
import Vendors from "../pages/Vendors";
import Profile from "../pages/Profile";
import Calendar from "../pages/Calendar";
import Invitees from "../pages/Invitees";
import Contacts from "../pages/Contacts";
import Arrivals from "../pages/Arrivals";
import Dashboard from "../pages/Dashboard";
import HotelRoom from "../pages/HotelRooms";
import Departures from "../pages/Departures";
import Ceremonies from "../pages/Ceremonies";
import CheckLists from "../pages/Checklists";
import UsersType from "../pages/UsersType";
import AddContact from "../pages/Contacts/AddContact";
import QuickContact from "../pages/QuickContact";
import ReceivedGifts from "../pages/ReceivedGifts";
import ResetPassword from "../pages/ResetPassword";
import CarAllocation from "../pages/CarAllocation";
import CardAllocation from "../pages/CardAllocation";
import ForgotPassword from "../pages/ForgotPassword";
import GiftAllocation from "../pages/GiftsAllocation";
import InvitationCards from "../pages/InvitationCards";
import ScheduleSendSms from "../pages/ScheduleSendSms";
import ImportContact from "../pages/Contacts/ImportContact";
import ContactDetail from "../pages/Contacts/ContactDetail";
import AddUserType from "../pages/UsersType/AddUserType";
import ExportData from "../pages/ExportData";
import Greetings from "../pages/Greetings";
import Tasks from "../pages/Task";
import SendEmail from "../pages/SendEmail";
import MenuPrint from "../pages/Menu/Print";
import CarPrint from "../pages/Cars/Print";
import HotelPrint from "../pages/Hotels/Print";
import VendorsPrint from "../pages/Vendors/Print";
import SamagriPrint from "../pages/Samagri/Print";
import GiftPrint from "../pages/Gifts/Print";
import ContactPrint from "../pages/Contacts/Print";
import InvitationCardPrint from "../pages/InvitationCards/Print";
import EventPrint from "../pages/Events/Print";
import VenuesPrint from "../pages/Venues/Print";
import GiftAllocationPrint from "../pages/GiftsAllocation/Print";
import RsvpPrint from "../pages/RSVP/Print";
import Budget from "../pages/Budget";
import Reports from "../pages/Reports";
import InviteesPrint from "../pages/Invitees/Print";
import CeremoniesPrint from "../pages/Ceremonies/Print";
import ArrivalPrint from "../pages/Arrivals/Print";
import DeparturePrint from "../pages/Departures/Print";
import ReceviedGiftPrint from "../pages/ReceivedGifts/Print";
import HotelRoomsPrint from "../pages/HotelRooms/Print";
import CarAllocationPrint from "../pages/CarAllocation/Print";
import CardAllocationPrint from "../pages/CardAllocation/Print";
import ServiceRequest from "../pages/ServiceRequest";
import TaskPrint from "../pages/Task/Print";
import Tags from "../pages/RecommendedVendors/VendorTags";
import Category from "../pages/RecommendedVendors/Category";
import SubCategory from "../pages/RecommendedVendors/SubCategory";
import FurtherClassification from "../pages/RecommendedVendors/FurtherClassification";

import TicketCategory from "../pages/TicketManager/Category";
import TicketSubCategory from "../pages/TicketManager/SubCategory";
import TicketFurtherClassification from "../pages/TicketManager/FurtherClassification";
import RecommendedVendor from "../pages/RecommendedVendors/Vendors";
import CustomField from "../pages/TicketManager/CustomField";
import CustomFieldDetail from "../pages/TicketManager/CustomFieldDetail";
import CustomFieldLibrary from "../pages/TicketManager/CustomFieldLibrary";
import CardSchedule from "../pages/CardSchedule";
import EventScreen from "../pages/EventScreen";
import RecommendedVenues from "../pages/Venues/RecommendedVenues";
import RecommendedCeremonies from "../pages/Ceremonies/RecommendedCeremonies";
import TrendingCeremonies from "../pages/Ceremonies/TrendingCeremonies";
import NearbyAttractions from "../pages/NearbyAttractions";
import LiveEvent from "../pages/LiveEvent";
import RecommendedSamagri from "../pages/Samagri/RecommendedSamagri";
import TrendingMenu from "../pages/Menu/TrendingMenu";
import PanchangCalendar from "../pages/PanchangCalendar";
import RecommendedVendors from "../pages/Vendors/RecommendedVendors";
import DoubleTick from "../pages/DoubleTick";
import Templates from "../pages/DoubleTick/Templates";
import InvitationCardView from "../pages/InvitationCardView";
import GuestFlights from "../pages/GuestFlights";
import GuestTrains from "../pages/GuestTrains";
import GuestFlightsPrint from "../pages/GuestFlights/Print";
import GuestTrainsPrint from "../pages/GuestTrains/Print";
import HotelRoomSetup from "../pages/HotelRoomSetup";
import QrOverview from "../pages/QrOverview";
import QrCodesOverviewPrint from "../pages/QrOverview/print";
export const publicRoutes = [
  {
    id: 1,
    path: LOGIN,
    screen: Login,
  },
  {
    id: 2,
    path: FORGOT_PASSWORD,
    screen: ForgotPassword,
  },
  {
    id: 3,
    path: RESET_PASSWORD,
    screen: ResetPassword,
  },
];

export const protectedRoutes = [
  {
    id: 1,
    path: DASHBOARD,
    screen: Dashboard,
    label: "Dashboard",
    permissions: ["dashboard-view"],
  },

  {
    id: 2,
    path: RECOMMENDED_VENDORS,
    screen: RecommendedVendors,
    label: "Recommended Vendors",
  },

  {
    id: 3,
    path: EVENT_SCREEN,
    screen: EventScreen,
    label: "Event",
  },

  {
    id: 4,
    path: VENUES,
    screen: Venues,
    label: "Venues",
    permissions: ["venues-delete", "venues-view", "venues-edit", "venues-create"],
  },

  {
    id: 5,
    path: CEREMONIES,
    screen: Ceremonies,
    label: "Ceremonies",
    permissions: ["ceremonies-delete", "ceremonies-view", "ceremonies-edit", "ceremonies-create"],
  },

  {
    id: 6,
    path: INVITEES,
    screen: Invitees,
    label: "Invitees",
    permissions: ["invitees-view"],
  },

  {
    id: 7,
    path: CONTACTS,
    screen: Contacts,
    label: "Contacts",
    permissions: ["contacts-create", "contacts-view", "contacts-edit", "contacts-delete"],
  },

  {
    id: 8,
    path: RSVP,
    screen: Rsvp,
    label: "RSVP",
    permissions: ["rsvp-view"],
  },

  {
    id: 9,
    path: GIFTS,
    screen: Gifts,
    label: "Gifts",
    permissions: ["gifts-delete", "gifts-view", "gifts-edit", "gifts-create"],
  },

  {
    id: 10,
    path: GIFT_ALLOCATION,
    screen: GiftAllocation,
    label: "Gift Allocation",
    permissions: ["gift-allocation-view"],
  },

  {
    id: 11,
    path: RECEIVED_GIFTS,
    screen: ReceivedGifts,
    label: "Received Gifts",
    permissions: ["received-gifts-delete", "received-gifts-view", "received-gifts-edit", "received-gifts-create"],
  },

  {
    id: 12,
    path: INVITATION_CARDS,
    screen: InvitationCards,
    label: "Invitation Cards",
    permissions: ["invitation-cards-create", "invitation-cards-view", "invitation-cards-edit", "invitation-cards-delete"],
  },

  {
    id: 13,
    path: CARD_ALLOCATION,
    screen: CardAllocation,
    label: "Card Allocation",
    permissions: ["card-allocation-view"],
  },

  {
    id: 14,
    path: SAMAGRI,
    screen: Samagri,
    label: "Samagri",
    permissions: ["samagri-delete", "samagri-view", "samagri-edit", "samagri-create"],
  },

  {
    id: 15,
    path: VENDORS,
    screen: Vendors,
    label: "Vendors",
    permissions: ["vendors-create", "vendors-view", "vendors-edit", "vendors-delete"],
  },

  {
    id: 16,
    path: ARRIVALS,
    screen: Arrivals,
    label: "Arrivals",
    permissions: ["arrivals-create", "arrivals-view", "arrivals-edit", "arrivals-delete"],
  },

  {
    id: 17,
    path: DEPARTURES,
    screen: Departures,
    label: "Departures",
    permissions: ["departures-delete", "departures-view", "departures-edit", "departures-create"],
  },

  {
    id: 18,
    path: HOTELS,
    screen: Hotels,
    label: "Hotels",
    permissions: ["hotels-create", "hotels-view", "hotels-edit", "hotels-delete"],
  },

  {
    id: 19,
    path: HOTELROOM,
    screen: HotelRoom,
    label: "Hotel Room",
    permissions: ["hotel-room-delete", "hotel-room-view", "hotel-room-edit", "hotel-room-create"],
  },

  {
    id: 20,
    path: CARS,
    screen: Cars,
    label: "Cars",
    permissions: ["cars-create", "cars-view", "cars-edit", "cars-delete"],
  },

  {
    id: 21,
    path: CARALLOCATION,
    screen: CarAllocation,
    label: "Car Allocation",
    permissions: ["car-allocation-delete", "car-allocation-view", "car-allocation-edit", "car-allocation-create"],
  },

  {
    id: 22,
    path: SEND_SMS,
    screen: SendSms,
    label: "Send SMS",
    permissions: ["send-sms-view"],
  },

  {
    id: 23,
    path: CHECKLISTS,
    screen: CheckLists,
    label: "CheckLists",
  },

  {
    id: 24,
    path: USERS,
    screen: Users,
    label: "Users",
    permissions: ["users-create", "users-view", "users-edit", "users-delete"],
  },

  {
    id: 25,
    path: USER_TYPE,
    screen: UsersType,
    label: "User Type",
  },

  {
    id: 26,
    path: SCHEDULE_SEND_SMS,
    screen: ScheduleSendSms,
    label: "Schedlue/Send SMS",
    permissions: ["schedule/send-sms-view", "schedule/send-sms-create", "schedule/send-sms-edit", "schedule/send-sms-delete"],
  },

  {
    id: 27,
    path: GREETINGS,
    screen: Greetings,
    label: "Greetings",
    permissions: ["greetings-view"],
  },

  {
    id: 28,
    path: SEND_EMAIL,
    screen: SendEmail,
    label: "Send Email",
    permissions: ["send-email-view"],
  },

  {
    id: 29,
    path: CALENDAR,
    screen: Calendar,
    label: "Calendar",
    permissions: ["calendar-view"],
  },

  {
    id: 30,
    path: TASKS,
    screen: Tasks,
    label: "Tasks",
    permissions: ["tasks-delete", "tasks-view", "tasks-edit", "tasks-create"],
  },

  {
    id: 31,
    path: MENU,
    screen: Menu,
    label: "Menu",
    permissions: ["menu-create", "menu-view", "menu-edit", "menu-delete"],
  },

  {
    id: 32,
    path: PROFILE,
    screen: Profile,
    label: "My Profile",
    permissions: ["my-profile-view"],
  },

  {
    id: 33,
    path: QUICK_CONTACT,
    screen: QuickContact,
    label: "Quick Contact",
    permissions: ["quick-contact-delete", "quick-contact-view", "quick-contact-edit", "quick-contact-create"],
  },

  {
    id: 34,
    path: EXPORT_DATA,
    screen: ExportData,
    label: "Export Data",
    permissions: ["export-data-view"],
  },

  {
    id: 35,
    path: IMPORT_CONTACT,
    screen: ImportContact,
  },

  {
    id: 36,
    path: ADD_CONTACT,
    screen: AddContact,
  },
  {
    id: 37,
    path: CONTACT_DETAIL,
    screen: ContactDetail,
  },

  {
    id: 38,
    path: ADD_USER_TYPE,
    screen: AddUserType,
  },

  {
    id: 39,
    path: MENU_PRINT,
    screen: MenuPrint,
  },

  {
    id: 40,
    path: CAR_PRINT,
    screen: CarPrint,
  },

  {
    id: 41,
    path: HOTEL_PRINT,
    screen: HotelPrint,
  },

  {
    id: 42,
    path: VENDOR_PRINT,
    screen: VendorsPrint,
  },

  {
    id: 43,
    path: SAMAGRI_PRINT,
    screen: SamagriPrint,
  },

  {
    id: 44,
    path: GIFT_PRINT,
    screen: GiftPrint,
  },

  {
    id: 45,
    path: CONTACT_PRINT,
    screen: ContactPrint,
  },

  {
    id: 46,
    path: INVITATION_CARD_PRINT,
    screen: InvitationCardPrint,
  },

  {
    id: 47,
    path: EVENT_PRINT,
    screen: EventPrint,
  },

  {
    id: 48,
    path: VENUE_PRINT,
    screen: VenuesPrint,
  },
  {
    id: 49,
    path: GIFT_ALLOCATION_PRINT,
    screen: GiftAllocationPrint,
  },
  {
    id: 50,
    path: RSVP_PRINT,
    screen: RsvpPrint,
  },
  {
    id: 51,
    path: BUDGET,
    screen: Budget,
    label: "Budget",
    permissions: ["budget-view"],
  },
  {
    id: 52,
    path: REPORTS,
    screen: Reports,
    label: "Reports",
    permissions: ["reports-view"],
  },
  {
    id: 53,
    path: INVITEES_PRINT,
    screen: InviteesPrint,
  },
  {
    id: 54,
    path: CEREMONIES_PRINT,
    screen: CeremoniesPrint,
  },
  {
    id: 55,
    path: ARRIVALS_PRINT,
    screen: ArrivalPrint,
  },
  {
    id: 56,
    path: DEPARTURES_PRINT,
    screen: DeparturePrint,
  },
  {
    id: 57,
    path: RECEIVED_GIFT_PRINT,
    screen: ReceviedGiftPrint,
  },
  {
    id: 58,
    path: HOTEL_ROOM_PRINT,
    screen: HotelRoomsPrint,
  },
  {
    id: 59,
    path: CAR_ALLOCATION_PRINT,
    screen: CarAllocationPrint,
  },
  {
    id: 60,
    path: CARD_ALLOCATION_PRINT,
    screen: CardAllocationPrint,
  },
  {
    id: 61,
    path: SERVICE_REQUESTS,
    screen: ServiceRequest,
    label: "Service Requests",
    permissions: ["service-requests-view"],
  },
  {
    id: 62,
    path: TASK_PRINT,
    screen: TaskPrint,
  },

  // {
  //   id: 60,
  //   path: CATEGORY,
  //   screen: Category,
  // },

  // {
  //   id: 61,
  //   path: SUB_CATEGORY,
  //   screen: SubCategory,
  // },

  // {
  //   id: 62,
  //   path: FURTHER_CLASSIFICATION,
  //   screen: FurtherClassification,
  // },

  // {
  //   id: 63,
  //   path: VENDOR_TAGS,
  //   screen: Tags,
  // },

  {
    id: 63,
    path: TICKET_CATEGORY,
    screen: TicketCategory,
  },

  {
    id: 64,
    path: TICKET_SUB_CATEGORY,
    screen: TicketSubCategory,
  },

  {
    id: 65,
    path: TICKET_FURTHER_CLASSIFICATION,
    screen: TicketFurtherClassification,
  },

  {
    id: 66,
    path: TICKET_CUSTOM_FIELD,
    screen: CustomField,
  },

  {
    id: 67,
    path: TICKET_CUSTOM_FIELD_DETAIL,
    screen: CustomFieldDetail,
  },

  {
    id: 68,
    path: TICKET_CUSTOM_FIELD_LIBRARY,
    screen: CustomFieldLibrary,
  },
  {
    id: 69,
    path: RECOMMENDED_VENDOR,
    screen: RecommendedVendor,
  },
  {
    id: 70,
    path: CARD_SCHEDULE,
    screen: CardSchedule,
  },
  {
    id: 71,
    path: RECOMMENDED_VENUES,
    screen: RecommendedVenues,
  },
  {
    id: 72,
    path: RECOMMENDED_CEREMONIES,
    screen: RecommendedCeremonies,
  },
  {
    id: 73,
    path: TRENDING_CEREMONIES,
    screen: TrendingCeremonies,
  },
  {
    id: 74,
    path: NEARBY_ATTRACTIONS,
    screen: NearbyAttractions,
    permissions: ["nearby-attractions-create", "nearby-attractions-view", "nearby-attractions-delete", "nearby-attractions-edit"],
  },
  {
    id: 75,
    path: LIVE_EVENT,
    screen: LiveEvent,
    permissions: ["live-event-view"],
  },
  {
    id: 76,
    path: RECOMMENDED_SAMAGRI,
    screen: RecommendedSamagri,
  },
  {
    id: 77,
    path: TRENDING_MENU,
    screen: TrendingMenu,
  },
  {
    id: 78,
    path: PANCHANG_CALENDAR,
    screen: PanchangCalendar,
    permissions: ["panchang-caldendar-view"],
  },
  {
    id: 79,
    path: DOUBLE_TICK_LIST,
    screen: Templates,
  },
  {
    id: 80,
    path: DOUBLE_TICK,
    screen: DoubleTick,
  },
  {
    id: 81,
    path: GUEST_FLIGHTS,
    screen: GuestFlights,
  },
  {
    id: 82,
    path: GUEST_TRAINS,
    screen: GuestTrains,
  },
  {
    id: 83,
    path: GUEST_FLIGHTS_PRINT,
    screen: GuestFlightsPrint,
  },
  {
    id: 84,
    path: GUEST_TRAINS_PRINT,
    screen: GuestTrainsPrint,
  },
  {
    id: 85,
    path: HOTEL_ROOM_SETUP,
    screen: HotelRoomSetup,
  },
  {
    id: 86,
    path: QR_OVERVIEW,
    screen: QrOverview,
  },
  {
    id: 87,
    path: QR_OVERVIEW_PRINT,
    screen: QrCodesOverviewPrint,
  },
];
