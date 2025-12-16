import moment from "moment";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiServices from "../api/services";
import SuccessModal from "../components/common/SuccessModal";
import { LOGIN } from "../routes/Names";

export const GlobalContext = createContext();

export const useThemeContext = () => {
  return useContext(GlobalContext);
};

const eventSelect = localStorage.getItem("event");

const eventDetail = JSON.parse(localStorage.getItem("eventDetail"));

export const ThemeContextProvider = ({ children }) => {
  // Navigation
  const navigate = useNavigate();

  // Use States
  const [allCars, setAllCars] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allGifts, setAllGifts] = useState([]);
  const [allVenues, setAllVenues] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [allEventsNotFormatted, setAllEventsNotFormatted] = useState([]);
  const [allHotels, setAllHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allContact, setAllContact] = useState([]);
  const [allContactByGroup, setAllContactByGroup] = useState([]);
  const [allEventsList, setAllEventsList] = useState([]);
  const [allCategoryList, setAllCategoryList] = useState([]);
  const [allType2CategoryList, setAllType2CategoryList] = useState([]);
  const [allSubCategoryList, setAllSubCategoryList] = useState([]);
  const [userTypeOption, setUserTypeOption] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [allFamily, setAllFamily] = useState([]);
  const [allCeremonies, setAllCeremonies] = useState([]);
  const [allInvitationCards, setAllInvitationCards] = useState([]);
  const [btnLoading, setBtnLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [allContactGroup, setAllContactGroup] = useState([]);
  const [openSessionModal, setOpenSessionModal] = useState(false);
  const [isSidebarOpenWithTitle, setIsSidebarOpenWithTitle] = useState(true);
  const [successModal, setSuccessModal] = useState({ open: false, message: "", title: "" });
  const [userData, setUserData] = useState(() => JSON.parse(localStorage.getItem("userData")) || {});
  const [selectedEventRights, setSelectedEventRights] = useState(() => JSON.parse(localStorage.getItem("eventDetail")) || {});
  const [withOutformattedContact, setWithOutformattedContact] = useState([]);
  const [fields, setFields] = useState([]);
  const [toggleClick, setToggleClick] = useState(true);
  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Toggle Sidebar with Title
  const toggleSidebarWithTitle = () => {
    setIsSidebarOpenWithTitle(!isSidebarOpenWithTitle);
    setToggleClick(!toggleClick);
  };

  // Open Success Modal
  const openSuccessModal = ({ ...props }) => {
    setSuccessModal({ ...successModal, ...props, open: true });
  };

  // Close Success Modal
  const closeSuccessModel = () => {
    setSuccessModal({ ...successModal, open: false });
  };

  // Update User
  const updateUser = (newUserData) => {
    localStorage?.setItem("userData", JSON?.stringify(newUserData));
    setUserData(newUserData);
  };

  // Get Venue List
  const getVenueList = async () => {
    try {
      const response = await ApiServices.venues.getVenues();

      if (response.data.code === 200) {
        const formattedVenues = response.data.data.data.map((venue) => ({
          value: venue.id,
          label: venue.name,
        }));

        setAllVenues(formattedVenues);
      } else {
      }
    } catch (err) {}
  };

  // Get Event List
  const getEventList = async () => {
    setLoading(true);
    try {
      const response = await ApiServices.events.getEvents();

      if (response.data.code === 200) {
        setLoading(false);
        setAllEventsNotFormatted(response.data.data.data);
        setAllEventsList(response.data.data.data);
        const formattedVenues = response.data.data.data.map((venue) => ({
          value: venue.id,
          label: venue.name,
          venue_id: venue.venue_id,
        }));

        setAllEvents(formattedVenues);
      } else {
      }
    } catch (err) {
      setLoading(false);
    }
  };

  // Get Ceremonies List
  const getCeremonies = async () => {
    try {
      let payload = {
        event_id: eventSelect,
      };
      const res = await ApiServices.ceremonies.getCeremonies(payload);
      const { data, message } = res;
      if (data.code === 200) {
        const formattedCeremonies = data?.data?.map((ceremony) => ({
          value: ceremony.id,
          label: ceremony.name,
        }));
        setAllCeremonies(formattedCeremonies);
      }
    } catch (err) {}
  };

  // Get Invitation Cards List
  const getInvitationCards = async () => {
    try {
      let payload = {
        event_id: eventSelect,
      };
      const res = await ApiServices.invitation_card.getInvitationCards(payload);
      const { data, message } = res;
      if (data.code === 200) {
        const formattedInvitationCards = data?.data?.data?.map((card) => ({
          value: card.id,
          label: card.name,
        }));
        setAllInvitationCards(formattedInvitationCards);
      }
    } catch (err) {}
  };

  // get all cars
  const getCarListing = async () => {
    try {
      let payload = {
        event_id: eventSelect,
      };

      const res = await ApiServices.car.GetAllCar(payload);
      const { data, message } = res;

      if (data.code === 200) {
        const formattedCar = data?.data?.map((car) => ({
          value: car.id,
          label: car.make_and_model,
        }));
        setAllCars(formattedCar);
      }
    } catch (err) {}
  };

  // Get Gifts
  const getGifts = async () => {
    try {
      let payload = {
        event_id: eventSelect,
      };

      const res = await ApiServices.gifts.getGifts(payload);
      const { data, message } = res;
      if (data.code === 200) {
        const formattedGifts = data?.data?.data?.map((gift) => ({
          value: gift.id,
          label: gift.name,
        }));
        setAllGifts(formattedGifts);
      }
    } catch (err) {}
  };

  // Get Contact by group
  const getContactsByGroup = async (givenUserId) => {
    try {
      let payload = {
        event_id: eventSelect,
        user_id: givenUserId,
      };
      const response = await ApiServices.invites.getContactsByGroup(payload);

      if (response.data.code === 200) {
        setAllContactGroup(response.data.data);
      } else {
        setLoading(false);
      }
    } catch (err) {}
  };

  const getContactsGroup = async () => {
    try {
      let payload = {
        event_id: eventSelect,
      };
      const response = await ApiServices.greetings.getContactGroup(payload);

      if (response.data.code === 200) {
        setAllContactByGroup(response.data.data.data);
      } else {
        setLoading(false);
      }
    } catch (err) {}
  };

  // Get Hotels
  const getHotels = async () => {
    try {
      let payload = {
        event_id: eventSelect,
      };

      const res = await ApiServices.hotels.getHotels(payload);
      const { data, message } = res;

      if (data.code === 200) {
        const formattedHotels = data?.data?.data?.map((hotel) => ({
          value: hotel.id,
          label: hotel.name,
        }));
        setAllHotels(formattedHotels);
      }
    } catch (err) {}
  };

  // Get Contacts
  const getContacts = () => {
    let payload = {
      event_id: eventSelect,
      isRSVP: 1,
    };
    ApiServices.contact
      .GetAllContact(payload)
      .then((res) => {
        const { data, message } = res;
        console.log("data", data);
        if (data?.code === 200) {
          const formattedContacts = data?.data?.map((contact) => ({
            value: contact?.uuid,
            label: contact?.salutation + " " +contact?.first_name + " " + contact?.last_name,
          }));

          setAllContact(formattedContacts);
          setWithOutformattedContact(data?.data);
        }
      })
      .catch((err) => {});
  };

  // Get users for dropdowon
  const getUsers = async () => {
    try {
      let payload = {
        event_id: eventSelect,
      };

      const res = await ApiServices.users.GetAllUsers(payload);
      const { data, message } = res;

      if (data?.code === 200) {
        const formattedUsers = data?.data?.data?.map((user) => ({
          value: user?.uuid,
          label: user?.first_name + " " + user?.last_name,
        }));
        setAllUsers(formattedUsers);
      }
    } catch (err) {}
  };

  // user type
  const getUserType = async () => {
    try {
      let payload = {
        event_id: eventSelect,
      };

      const res = await ApiServices.userType.GetAllUserType(payload);
      const { data, message } = res;

      if (data.code === 200) {
        const formattedUser = data?.data?.map((user) => ({
          value: user?.name,
          label: user?.display_name,
        }));

        setUserTypeOption(formattedUser);
      }
    } catch (err) {}
  };

  // Get Category List
  const getCategoryList = async () => {
    try {
      const payload = {
        type: 1,
        event_id: eventSelect,
      };
      const response = await ApiServices.category.getCategory(payload);
      if (response.data.code === 200) {
        const formattedCategory = response.data.data.data.map((category) => ({
          value: category.id,
          label: category.name,
        }));

        setAllCategoryList(formattedCategory);
      } else {
      }
    } catch (err) {}
  };

  const getType2CategoryList = async () => {
    try {
      const payload = {
        type: 2,
        // event_id: eventSelect,
      };
      const response = await ApiServices.category.getCategory(payload);
      if (response.data.code === 200) {
        const formattedCategory = response.data.data.data.map((category) => ({
          value: category.id,
          label: category.name,
        }));

        setAllType2CategoryList(formattedCategory);
      } else {
      }
    } catch (err) {}
  };

  // Get Groups
  const getGroupNames = async () => {
    const payload = {
      event_id: eventSelect,
    };
    try {
      const response = await ApiServices.contact.getGroup(payload);

      if (response.data.code === 200) {
        const formattedGroups = response.data.data.data.map((group) => ({
          value: group.id,
          label: group.name,
        }));
        setAllGroups(formattedGroups);
      } else {
      }
    } catch (err) {}
  };

  const getFamilyNames = async () => {
    const payload = {
      event_id: eventSelect,
    };
    try {
      const response = await ApiServices.contact.getFamily(payload);

      if (response.data.code === 200) {
        const formattedGroups = response.data.data.data.map((group) => ({
          value: group.id,
          label: group.name,
        }));
        setAllFamily(formattedGroups);
      } else {
      }
    } catch (err) {}
  };

  const getCustomFieldLibrary = async () => {
    let payload = {
      event_id: eventSelect,
    };
    const res = await ApiServices.Custom_Field_Library.getCustomFieldLibrary(payload)
      .then((res) => {
        const { data, message } = res;

        if (data?.code === 200) {
          setLoading(false);
          const formattedVenues = res.data.data.data.map((venue) => ({
            value: venue.id,
            label: venue.name,
          }));

          setFields(formattedVenues);
        } else {
        }
      })
      .catch((err) => {});
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("sessionTime");
    localStorage.removeItem("event");

    setTimeout(() => {
      navigate(LOGIN);
    }, 100);
  };

  // useEffect(() => {
  //   getVenueList();
  //   getEventList();
  //   getCeremonies();
  //   getContactsByGroup();
  //   getHotels();
  //   getCarListing();
  //   getGifts();
  //   getContacts();
  //   getUserType();
  //   getUsers();
  //   getContactsGroup();
  //   getInvitationCards();
  //   getCategoryList();
  //   getType2CategoryList();
  //   getGroupNames();
  // }, []);

  // use Effects
  useEffect(() => {
    const sessionTime = localStorage.getItem("sessionTime");

    if (sessionTime) {
      const currentTime = moment();
      const expirationTime = moment(parseInt(sessionTime));

      if (currentTime.isAfter(expirationTime)) {
        setOpenSessionModal(true);
      }
    }
  }, []);

  // Context Value
  const contextValue = {
    eventDetail,
    eventSelect,
    loading,
    logout,
    errorMessage,
    setAllCars,
    allCars,
    successModal,
    setLoading,
    btnLoading,
    allContact,
    allUsers,
    setAllContact,
    setBtnLoading,
    setErrorMessage,
    setSuccessModal,
    toggleSidebar,
    isSidebarOpen,
    allEventsList,
    allContactGroup,
    allType2CategoryList,
    openSuccessModal,
    allInvitationCards,
    setToggleClick,
    allVenues,
    allEvents,
    allGifts,
    allGroups,
    allCategoryList,
    allSubCategoryList,
    allCeremonies,
    openSessionModal,
    setIsSidebarOpen,
    closeSuccessModel,
    isSidebarOpenWithTitle,
    setIsSidebarOpenWithTitle,
    toggleSidebarWithTitle,
    setOpenSessionModal,
    allHotels,
    userTypeOption,
    setUserData,
    userData,
    updateUser,
    allContactByGroup,
    getVenueList,
    getEventList,
    getCeremonies,
    getContactsByGroup,
    getHotels,
    getCarListing,
    toggleClick,
    getGifts,
    getContacts,
    getUserType,
    getUsers,
    getContactsGroup,
    getGroupNames,
    getCategoryList,
    getType2CategoryList,
    getInvitationCards,
    fields,
    getCustomFieldLibrary,
    allEventsNotFormatted,
    getFamilyNames,
    allFamily,
    setSelectedEventRights,
    selectedEventRights,
    withOutformattedContact,
  };

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
      <SuccessModal />
    </GlobalContext.Provider>
  );
};
