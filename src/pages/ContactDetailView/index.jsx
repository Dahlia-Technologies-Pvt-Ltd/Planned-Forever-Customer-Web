import moment from "moment";
import { Images } from "../../assets/Assets";
import ApiServices from "../../api/services";
import { useTranslation } from "react-i18next";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import Dropdown from "../../components/common/Dropdown";
import countriesData from "../../utilities/country.json";
import { useLocation, useNavigate } from "react-router-dom";
import ChooseFile from "../../components/common/ChooseFile";
import RadioInput from "../../components/common/RadioInput";
import { useThemeContext } from "../../context/GlobalContext";
import React, { useState, useEffect, useCallback } from "react";
import countriesCodeData from "../../utilities/countryCode.json";
import AddGroupModal from "../../components/common/AddGroupModal";
import AddColorModal from "../../components/common/AddColorModal";
import AddFamilyModal from "../../components/common/AddFamilyModal";
import { toUTCUnixTimestamp } from "../../utilities/HelperFunctions";
import { PlusCircleIcon, TrashIcon } from "@heroicons/react/24/solid";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { ArrowLeftIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

const ContactDetailView = () => {
  const { t } = useTranslation("common");
  const location = useLocation();
  const navigate = useNavigate();

  // Global States
  const { openSuccessModal, setBtnLoading, setErrorMessage, closeSuccessModel } = useThemeContext();

  // Get data from navigation state (from GetContactDetails component)
  const { contactData: initialContactData, searchPhone, token } = location.state || {};

  // Core states
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [contactData, setContactData] = useState(initialContactData || null);
  const [userDetailData, setUserDetailData] = useState(null);
  const [eventData, setEventData] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [message, setMessage] = useState({ text: "", color: "" });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEventContact, setSelectedEventContact] = useState(null);

  // Form states - matching AddContact structure
  const [pin, setPin] = useState("");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");
  const [state, setState] = useState("");
  const [family, setFamily] = useState("");
  const [groups, setGroups] = useState("");
  const [gender, setGender] = useState(null);
  const [country, setCountry] = useState("");
  const [workPin, setWorkPin] = useState("");
  const [address, setAddress] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickName, setNickName] = useState("");
  const [children, setChildren] = useState([]);
  const [workCity, setWorkCity] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [firstName, setFirstName] = useState("");
  const [workState, setWorkState] = useState("");
  const [salutation, setSalutation] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [workCountry, setWorkCountry] = useState("");
  const [workAddress, setWorkAddress] = useState("");
  const [specialNeed, setSpecialNeed] = useState(false);
  const [martialStatus, setMartialStatus] = useState("");
  const [salutationEmail, setSalutationEmail] = useState("");
  const [anniversaryDate, setAnniversaryDate] = useState("");
  const [selectedColorCode, setSelectedColorCode] = useState(null);
  const [weddingHallSeat, setWeddingHallSeat] = useState("");

  // NEW: Missing states from AddContact
  const [file, setFile] = useState([]);
  const [identityFile, setIndentityFile] = useState([]);
  const [fileLoading, setFileLoading] = useState(false);

  // Medicine states - NEW
  const [medicines, setMedicines] = useState([]);
  const [deletedMedicineIds, setDeletedMedicineIds] = useState([]);
  const [medicineValidationErrors, setMedicineValidationErrors] = useState({});

  // Complex states
  const [spouse, setSpouse] = useState({
    salutation: "",
    name: "",
    middleName: "",
    lastName: "",
    gender: "",
    countryCode: "",
    contactNumber: "",
    profileImage: null,
    profileFile: null,
    meal_preference: [[], [], []], // [primary, secondary, alcoholic]
    weddingHallSeat: "",
    medicines: [],
  });

  const [emails, setEmails] = useState([{ id: Date.now(), emailType: "", emailAddress: "" }]);
  const [contacts, setContacts] = useState([{ id: Date.now(), contactType: "", countryCode: "", contactNumber: "" }]);
  const [selectedMealIds, setSelectedMealIds] = useState([]);

  // Profile image states
  const [ProfileImage, setProfileImage] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  // New states for profile image loading
  const [spouseProfileLoading, setSpouseProfileLoading] = useState(false);
  const [spouseProfileError, setSpouseProfileError] = useState("");
  const [childrenProfileLoading, setChildrenProfileLoading] = useState({});
  const [childrenProfileErrors, setChildrenProfileErrors] = useState({});

  // NEW: New child form states
  const [newChild, setNewChild] = useState({
    salutation: "",
    name: "",
    middleName: "",
    lastName: "",
    gender: "null",
    countryCode: "",
    contactNumber: "",
    isAdult: false,
    profileImage: null,
    profileFile: null,
    meal_preference: [[], [], []], // [primary, secondary, alcoholic]
    weddingHallSeat: "",
    medicines: [],
  });
  const [showNewChildForm, setShowNewChildForm] = useState(false);
  const [errors, setErrors] = useState({
    salutation: "",
    name: "",
    lastName: "",
    gender: "",
    countryCode: "",
    contactNumber: "",
  });

  // Options for dropdowns
  const [groupOptions, setGroupOptions] = useState([]);
  const [familyOptions, setFamilyOptions] = useState([]);
  const [colorCodeOptions, setColorCodeOptions] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  // Modal states
  const [openGroupModal, setOpenGroupModal] = useState(false);
  const [openFamilyModal, setOpenFamilyModal] = useState(false);
  const [openColorCodeModal, setOpenColorCodeModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newFamilyName, setNewFamilyName] = useState("");
  const [newColorCodeName, setNewColorCodeName] = useState("");
  const [errorMessageServer, setErrorMessageServer] = useState("");

  // NEW: Delete modal states
  const [openDeleteModal, setOpenDeleteModal] = useState({ open: false, data: null });
  const [openDeleteModalFamily, setOpenDeleteModalFamily] = useState({ open: false, data: null });
  const [openDeleteModalColorCode, setOpenDeleteModalColorCode] = useState({ open: false, data: null });

  // Medicine validation error states for spouse and children
  const [spouseMedicineValidationErrors, setSpouseMedicineValidationErrors] = useState({});
  const [childrenMedicineValidationErrors, setChildrenMedicineValidationErrors] = useState({});
  const [newChildMedicineValidationErrors, setNewChildMedicineValidationErrors] = useState({});

  // Medicine deletion tracking states
  const [deletedSpouseMedicineIds, setDeletedSpouseMedicineIds] = useState([]);
  const [deletedChildrenMedicineIds, setDeletedChildrenMedicineIds] = useState({});
  const [deletedNewChildMedicineIds, setDeletedNewChildMedicineIds] = useState([]);

  // FIXED: Initial setup effect - only sets up initial data
  useEffect(() => {
    if (!contactData) {
      navigate("/get-contact-details", { replace: true });
      return;
    }

    console.log("Contact Data:", contactData);

    // Format events for dropdown
    const formatedEvents =
      contactData?.users?.map((event) => ({
        label: event.event_details?.name,
        value: event.event_details?.id,
      })) || [];

    // Set initial event data
    const defaultEvent = formatedEvents[0] || null;
    const initialEventContact = contactData.users[0]?.user_id || null;

    console.log("Setting initial data:", { defaultEvent, initialEventContact });

    setSelectedEvent(defaultEvent);
    setEventData(formatedEvents);
    setSelectedEventContact(initialEventContact);

    // Don't call loadAllData here - let the dependency effect handle it
  }, [contactData, navigate]);

  // FIXED: Separate effect that only runs when both selectedEventContact and selectedEvent are properly set
  useEffect(() => {
    if (selectedEventContact && selectedEvent) {
      console.log("Both selectedEventContact and selectedEvent are set, loading data...");
      loadAllData();
    }
  }, [selectedEventContact, selectedEvent]);

  // FIXED: Load all required data with proper null checks
  const loadAllData = useCallback(async () => {
    // Add null check to prevent API calls with null values
    if (!selectedEventContact || !selectedEvent) {
      console.log("Missing selectedEventContact or selectedEvent, skipping load:", {
        selectedEventContact,
        selectedEvent,
      });
      return;
    }

    try {
      setLoading(true);
      console.log("Loading all data for:", { selectedEventContact, selectedEvent });

      // Pass selected event to both functions
      await Promise.all([loadUserData(selectedEventContact), loadEventSpecificData(selectedEvent)]);
    } catch (error) {
      console.error("Error loading data:", error);
      setMessage({ text: "Failed to load contact data", color: "red" });
    } finally {
      setLoading(false);
    }
  }, [selectedEvent, selectedEventContact]);

  // Load user data by user_id
  const loadUserData = useCallback(async (userId) => {
    if (!userId) {
      console.log("No userId provided to loadUserData");
      return;
    }

    try {
      console.log("Loading user data for user_id:", userId);

      const response = await ApiServices.profile.getUserDataById(userId);

      if (response?.data?.code === 200) {
        const userData = response.data.data;
        console.log("User Data loaded:", userData);

        setUserDetailData(userData);
        populateFormData(userData);
      } else {
        setMessage({ text: "Failed to load user data", color: "red" });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setMessage({ text: "Failed to load user data", color: "red" });
    }
  }, []);

  // Load event-specific data (groups, families, etc.)
  const loadEventSpecificData = useCallback(async (selectedEvent) => {
    if (!selectedEvent?.value) {
      console.log("No selectedEvent provided to loadEventSpecificData");
      return;
    }

    try {
      console.log("Loading event-specific data for event:", selectedEvent);

      const [groupsRes, familiesRes, colorCodesRes, categoriesRes] = await Promise.all([
        ApiServices.contact.getGroup({ event_id: selectedEvent?.value }),
        ApiServices.contact.getFamily({ event_id: selectedEvent?.value }),
        ApiServices.contact.getColorCodes({}),
        ApiServices.contact.getPreference({ event_id: selectedEvent?.value }),
      ]);

      // Process groups
      if (groupsRes?.data?.code === 200) {
        const groupNames =
          groupsRes.data.data?.map((name) => ({
            value: name.id,
            label: name.name,
          })) || [];
        setGroupOptions(groupNames);
      }

      // Process families
      if (familiesRes?.data?.code === 200) {
        const familyNames =
          familiesRes.data.data?.map((name) => ({
            value: name.id,
            label: name.name,
          })) || [];
        setFamilyOptions(familyNames);
      }

      // Process color codes
      if (colorCodesRes?.data?.status === true) {
        const colorCodes =
          colorCodesRes.data.data?.map((color) => ({
            value: color.id,
            label: color.name,
          })) || [];
        setColorCodeOptions(colorCodes);
      }

      // Process categories
      if (categoriesRes?.data?.code === 200) {
        setAllCategories(categoriesRes.data.data || []);
      }
    } catch (error) {
      console.error("Error loading event-specific data:", error);
    }
  }, []);

  // Populate form data from user data
  const populateFormData = useCallback(
    (userData) => {
      console.log("Populating form with user data:", userData);

      // Helper function to parse contact number
      const parseContactNumber = (contactNumber) => {
        if (!contactNumber) return { number: "", countryCode: "" };

        if (typeof contactNumber === "object") {
          return {
            number: contactNumber.number || "",
            countryCode: contactNumber.countryCode || "",
          };
        }

        if (typeof contactNumber === "string") {
          try {
            const parsed = JSON.parse(contactNumber);
            return {
              number: parsed.number || "",
              countryCode: parsed.countryCode || "",
            };
          } catch (error) {
            return { number: contactNumber, countryCode: "" };
          }
        }

        return { number: "", countryCode: "" };
      };

      // NEW: Handle identity files
      let finalArray = [];
      if (Array.isArray(userData.identity_image)) {
        finalArray = userData.identity_image;
      } else if (typeof userData?.identity_image === "string") {
        try {
          const parsedData = JSON.parse(userData.identity_image);
          finalArray = Array.isArray(parsedData) ? parsedData : [];
        } catch (jsonError) {
          finalArray = userData.identity_image.split(",").filter((item) => item.trim() !== "");
        }
      }
      setIndentityFile(finalArray);
      setFile(finalArray);

      // NEW: Load existing medicines
      if (userData?.medicines && Array.isArray(userData.medicines)) {
        const mappedMedicines = userData.medicines.map((medicine) => ({
          id: medicine.id,
          name: medicine.name || "",
          ailment: medicine.ailment || "",
          special_instructions: medicine.special_instructions || "",
          type: medicine.type || "",
          usage: medicine.usage || "",
        }));
        setMedicines(mappedMedicines);
      } else {
        setMedicines([]);
      }

      // Convert meal_preference from API format to form format
      const convertMealPreferences = (apiPreferences) => {
        if (!apiPreferences || !Array.isArray(apiPreferences)) return [[], [], []];

        const primary = apiPreferences.filter((item) => item.type === "primary").map((item) => ({ value: item.id, label: item.name }));
        const secondary = apiPreferences.filter((item) => item.type === "secondary").map((item) => ({ value: item.id, label: item.name }));
        const alcoholic = apiPreferences.filter((item) => item.type === "alcoholic").map((item) => ({ value: item.id, label: item.name }));

        return [primary, secondary, alcoholic];
      };

      // Update form data with userData
      setPin(userData?.pin || "");
      setCity(userData?.city || "");
      setNote(userData?.description || userData?.note || "");
      setState(userData?.state || "");
      setFamily(userData?.family?.id ? { value: userData.family.id, label: userData.family.name } : "");
      setGroups(userData?.group?.id ? { value: userData.group.id, label: userData.group.name } : "");
      setSelectedColorCode(userData?.color_code?.id ? { value: userData.color_code.id, label: userData.color_code.name } : null);
      setGender(userData?.gender || "");
      setCountry(userData?.country ? { value: userData.country, label: userData.country } : "");
      setAddress(userData?.address || "");
      setLastName(userData?.last_name || "");
      setNickName(userData?.nick_name || "");
      setBirthDate(userData?.DOB ? moment.unix(userData.DOB).format("YYYY-MM-DD") : "");
      setFirstName(userData?.first_name || "");
      setSalutation(userData?.salutation || "");
      setMiddleName(userData?.middle_name || "");
      setCompanyName(userData?.company_name || "");
      setWorkCountry(userData?.work_country ? { value: userData.work_country, label: userData.work_country } : "");
      setWorkAddress(userData?.work_address || "");
      setWorkCity(userData?.work_city || "");
      setWorkState(userData?.work_state || "");
      setWorkPin(userData?.work_pin || "");
      setSpecialNeed(userData?.special_need === "yes");
      setMartialStatus(userData?.marital_status || "");
      setSalutationEmail(userData?.salutation_in_email || "");
      setAnniversaryDate(userData?.anniversery_date ? moment.unix(userData.anniversery_date).format("YYYY-MM-DD") : "");
      setWeddingHallSeat(userData?.wedding_hall_seat || "");
      // Set profile image
      setProfileFile(userData?.profile_image || "");
      setProfileImage(userData?.profile_image || null);

      // Handle spouse data
      const spouseData = userData?.children?.find((item) => item.type === "spouse");
      if (spouseData) {
        const spouseContactInfo = parseContactNumber(spouseData?.contact_number);
        setSpouse({
          id: spouseData.id,
          salutation: spouseData.salutation || "",
          name: spouseData.name || "",
          middleName: spouseData.middle_name || "",
          lastName: spouseData.last_name || "",
          gender: spouseData.gender || "",
          countryCode: spouseContactInfo.countryCode
            ? {
                label: spouseContactInfo.countryCode,
                value: spouseContactInfo.countryCode,
              }
            : "",
          contactNumber: spouseContactInfo.number,
          profileImage: spouseData?.profile_image || null,
          profileFile: spouseData?.profile_image || null,
          meal_preference: convertMealPreferences(spouseData?.meal_preference),
          medicines:
          spouseData?.medicines?.map((medicine) => ({
            id: medicine.id,
            name: medicine.name || "",
            ailment: medicine.ailment || "",
            special_instructions: medicine.special_instructions || "",
            type: medicine.type || "",
            usage: medicine.usage || "",
          })) || [],
          weddingHallSeat: spouseData?.wedding_hall_seat || "",
        });
      }

      // Handle children data
      const childrenData =
        userData?.children
          ?.filter((item) => item.type === "children")
          ?.map((item) => {
            const childContactInfo = parseContactNumber(item?.contact_number);
            return {
              id: item?.id,
              salutation: item?.salutation || "",
              name: item?.name || "",
              middleName: item?.middle_name || "",
              lastName: item?.last_name || "",
              gender: item?.gender || "",
              countryCode: childContactInfo.countryCode
                ? {
                    label: childContactInfo.countryCode,
                    value: childContactInfo.countryCode,
                  }
                : "",
              contactNumber: childContactInfo.number,
              isAdult: item?.isAdult === 1,
              profileImage: item?.profile_image || null,
              profileFile: item?.profile_image || null,
              meal_preference: convertMealPreferences(item?.meal_preference),
              medicines:
              item?.medicines?.map((medicine) => ({
                id: medicine.id,
                name: medicine.name || "",
                ailment: medicine.ailment || "",
                special_instructions: medicine.special_instructions || "",
                type: medicine.type || "",
                usage: medicine.usage || "",
              })) || [],
              weddingHallSeat: item?.wedding_hall_seat || "",
            };
          }) || [];
      setChildren(childrenData);

      // Handle emails
      const emailsData = userData?.emails?.map((item) => ({
        id: item?.id,
        emailType: { label: item?.type, value: item?.type },
        emailAddress: item?.contact_email,
      })) || [{ id: Date.now(), emailType: "", emailAddress: "" }];
      setEmails(emailsData);

      // Handle contact numbers - include the contact data from initial verification
      let contactsData = [];

      // Add contact numbers from user data
      if (userData?.contact_numbers && userData.contact_numbers.length > 0) {
        contactsData = userData.contact_numbers.map((item) => ({
          id: item?.id || Date.now(),
          contactType: { label: item?.type, value: item?.type },
          contactNumber: item?.contact_number || item?.number,
          countryCode: { label: item?.country_code, value: item?.country_code },
        }));
      }

      // If no contact numbers from user data, use the verified contact from initial verification
      if (contactsData.length === 0 && contactData) {
        contactsData = [
          {
            id: Date.now(),
            contactType: { label: contactData.type || "Mobile", value: contactData.type || "Mobile" },
            contactNumber: contactData.contact_number,
            countryCode: { label: contactData.country_code, value: contactData.country_code },
          },
        ];
      }

      // Ensure we have at least one empty contact field
      if (contactsData.length === 0) {
        contactsData = [{ id: Date.now(), contactType: "", countryCode: "", contactNumber: "" }];
      }

      setContacts(contactsData);

      // Handle preferences
      const formattedPreferences = convertMealPreferences(userData?.preferences);
      setSelectedMealIds(formattedPreferences);
    },
    [contactData],
  );

  // NEW: Child form validation functions
  const isChildFormComplete = (childData = newChild) => {
    return (
      childData.salutation.trim() !== "" &&
      childData.name.trim() !== "" &&
      childData.lastName.trim() !== "" &&
      childData.gender !== "null" &&
      childData.gender !== "" &&
      childData.countryCode !== "" &&
      childData.contactNumber.trim() !== ""
    );
  };

  const validateChildFormData = (childData) => {
    return (
      childData.salutation.trim() !== "" &&
      childData.name.trim() !== "" &&
      childData.lastName.trim() !== "" &&
      childData.gender !== "null" &&
      childData.gender !== "" &&
      childData.countryCode !== "" &&
      childData.contactNumber.trim() !== ""
    );
  };

  // NEW: Auto-add child when form is complete
  const handleAutoAddChild = (childData) => {
    if (validateChildFormData(childData)) {
      setChildren((prevChildren) => [...prevChildren, { id: Date.now(), ...childData }]);

      // Reset the form for next child
      setNewChild({
        salutation: "",
        name: "",
        middleName: "",
        lastName: "",
        gender: "null",
        countryCode: "",
        contactNumber: "",
        isAdult: false,
        profileImage: null,
        profileFile: null,
        meal_preference: [[], [], []],
        weddingHallSeat: "",
        medicines: [],
      });

      // Clear any validation errors
      setErrors({
        salutation: "",
        name: "",
        lastName: "",
        gender: "",
        countryCode: "",
        contactNumber: "",
      });

      // Hide the new child form after auto-adding
      setShowNewChildForm(false);
    }
  };

  // NEW: Handle new child form
  const handleAddNewChildForm = () => {
    setShowNewChildForm(true);
    setNewChild({
      salutation: "",
      name: "",
      middleName: "",
      lastName: "",
      gender: "null",
      countryCode: "",
      contactNumber: "",
      isAdult: false,
      profileImage: null,
      profileFile: null,
      meal_preference: [[], [], []],
      weddingHallSeat: "",
      medicines: [],
    });
    setErrors({
      salutation: "",
      name: "",
      lastName: "",
      gender: "",
      countryCode: "",
      contactNumber: "",
    });
  };

  // NEW: Handle input change for new child
  const handleInputChange = (field, value) => {
    const updatedChild = {
      ...newChild,
      [field]: value,
    };

    setNewChild(updatedChild);

    // Clear error when field is filled
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // Auto-add child when all required fields are filled
    setTimeout(() => {
      if (isChildFormComplete(updatedChild)) {
        handleAutoAddChild(updatedChild);
      }
    }, 500);
  };

  // Medicine handlers - NEW
  const handleAddMedicine = () => {
    console.log("Current medicines:", medicines);

    if (medicines.length > 0) {
      const lastMedicine = medicines[medicines.length - 1];
      console.log("Last medicine:", lastMedicine);

      if (!lastMedicine.name || !lastMedicine.ailment) {
        console.log("Validation failed - setting error");

        setMedicineValidationErrors((prev) => ({
          ...prev,
          [lastMedicine.id]: "Please fill in Medicine Name and Problem/Ailment before adding another medicine",
        }));

        return;
      }
    }

    console.log("Validation passed - adding new medicine");

    setMessage({ text: "", color: "" });
    setMedicineValidationErrors({});

    setMedicines((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        ailment: "",
        special_instructions: "",
        type: "",
        usage: "",
      },
    ]);
  };

  const handleRemoveMedicine = (medicineId) => {
    if (typeof medicineId === "string" && medicineId.length > 10) {
      setDeletedMedicineIds((prev) => [...prev, medicineId]);
    }

    setMedicines((prev) => prev.filter((medicine) => medicine.id !== medicineId));
  };

  const handleMedicineChange = (medicineId, field, value) => {
    setMedicines((prev) => prev.map((medicine) => (medicine.id === medicineId ? { ...medicine, [field]: value } : medicine)));

    if (medicineValidationErrors[medicineId]) {
      setMedicineValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[medicineId];
        return newErrors;
      });
    }
  };

  // Medicine handlers for spouse
  const handleAddSpouseMedicine = () => {
    console.log("Current spouse medicines:", spouse.medicines);

    // Check if there are existing medicines and if the last one is incomplete
    if (spouse.medicines.length > 0) {
      const lastMedicine = spouse.medicines[spouse.medicines.length - 1];
      console.log("Last spouse medicine:", lastMedicine);

      // Check if the last medicine is missing required fields
      if (!lastMedicine.name || !lastMedicine.ailment) {
        console.log("Spouse medicine validation failed - setting error");

        // Set validation error for the incomplete medicine
        setSpouseMedicineValidationErrors((prev) => ({
          ...prev,
          [lastMedicine.id]: "Please fill in Medicine Name and Problem/Ailment before adding another medicine",
        }));

        return; // Don't add new medicine
      }
    }

    console.log("Spouse medicine validation passed - adding new medicine");

    // Clear any previous messages and errors
    setMessage({ text: "", color: "" });
    setSpouseMedicineValidationErrors({});

    // Add new medicine if validation passes
    setSpouse((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        {
          id: Date.now(),
          name: "",
          ailment: "",
          special_instructions: "",
          type: "",
          usage: "",
        },
      ],
    }));
  };

  const handleRemoveSpouseMedicine = (medicineId) => {
    // If it's an existing medicine (has a string ID from API), track it as deleted
    if (typeof medicineId === "string" && medicineId.length > 10) {
      setDeletedSpouseMedicineIds((prev) => [...prev, medicineId]);
    }

    // Remove from spouse medicines state
    setSpouse((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((medicine) => medicine.id !== medicineId),
    }));
  };

  const handleSpouseMedicineChange = (medicineId, field, value) => {
    setSpouse((prev) => ({
      ...prev,
      medicines: prev.medicines.map((medicine) => (medicine.id === medicineId ? { ...medicine, [field]: value } : medicine)),
    }));

    // Clear validation error when user starts typing
    if (spouseMedicineValidationErrors[medicineId]) {
      setSpouseMedicineValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[medicineId];
        return newErrors;
      });
    }
  };

  // Medicine handlers for children
  const handleAddChildMedicine = (childId) => {
    const child = children.find((c) => c.id === childId);
    if (!child) return;

    console.log("Current child medicines:", child.medicines || []);

    // Check if there are existing medicines and if the last one is incomplete
    if (child.medicines && child.medicines.length > 0) {
      const lastMedicine = child.medicines[child.medicines.length - 1];
      console.log("Last child medicine:", lastMedicine);

      // Check if the last medicine is missing required fields
      if (!lastMedicine.name || !lastMedicine.ailment) {
        console.log("Child medicine validation failed - setting error");

        // Set validation error for the incomplete medicine
        setChildrenMedicineValidationErrors((prev) => ({
          ...prev,
          [childId]: {
            ...prev[childId],
            [lastMedicine.id]: "Please fill in Medicine Name and Problem/Ailment before adding another medicine",
          },
        }));

        return; // Don't add new medicine
      }
    }

    console.log("Child medicine validation passed - adding new medicine");

    // Clear any previous messages and errors
    setMessage({ text: "", color: "" });
    setChildrenMedicineValidationErrors((prev) => ({
      ...prev,
      [childId]: {},
    }));

    // Add new medicine if validation passes
    setChildren((prevChildren) =>
      prevChildren.map((child) =>
        child.id === childId
          ? {
              ...child,
              medicines: [
                ...(child.medicines || []),
                {
                  id: Date.now(),
                  name: "",
                  ailment: "",
                  special_instructions: "",
                  type: "",
                  usage: "",
                },
              ],
            }
          : child,
      ),
    );
  };

  const handleRemoveChildMedicine = (childId, medicineId) => {
    // If it's an existing medicine (has a string ID from API), track it as deleted
    if (typeof medicineId === "string" && medicineId.length > 10) {
      setDeletedChildrenMedicineIds((prev) => ({
        ...prev,
        [childId]: [...(prev[childId] || []), medicineId],
      }));
    }

    // Remove from child medicines state
    setChildren((prevChildren) =>
      prevChildren.map((child) =>
        child.id === childId
          ? {
              ...child,
              medicines: (child.medicines || []).filter((medicine) => medicine.id !== medicineId),
            }
          : child,
      ),
    );
  };

  const handleChildMedicineChange = (childId, medicineId, field, value) => {
    setChildren((prevChildren) =>
      prevChildren.map((child) =>
        child.id === childId
          ? {
              ...child,
              medicines: (child.medicines || []).map((medicine) => (medicine.id === medicineId ? { ...medicine, [field]: value } : medicine)),
            }
          : child,
      ),
    );

    // Clear validation error when user starts typing
    if (childrenMedicineValidationErrors[childId]?.[medicineId]) {
      setChildrenMedicineValidationErrors((prev) => {
        const newErrors = { ...prev };
        if (newErrors[childId]) {
          delete newErrors[childId][medicineId];
        }
        return newErrors;
      });
    }
  };

  // Medicine handlers for new child
  const handleAddNewChildMedicine = () => {
    console.log("Current new child medicines:", newChild.medicines);

    // Check if there are existing medicines and if the last one is incomplete
    if (newChild.medicines.length > 0) {
      const lastMedicine = newChild.medicines[newChild.medicines.length - 1];
      console.log("Last new child medicine:", lastMedicine);

      // Check if the last medicine is missing required fields
      if (!lastMedicine.name || !lastMedicine.ailment) {
        console.log("New child medicine validation failed - setting error");

        // Set validation error for the incomplete medicine
        setNewChildMedicineValidationErrors((prev) => ({
          ...prev,
          [lastMedicine.id]: "Please fill in Medicine Name and Problem/Ailment before adding another medicine",
        }));

        return; // Don't add new medicine
      }
    }

    console.log("New child medicine validation passed - adding new medicine");

    // Clear any previous messages and errors
    setMessage({ text: "", color: "" });
    setNewChildMedicineValidationErrors({});

    // Add new medicine if validation passes
    setNewChild((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        {
          id: Date.now(),
          name: "",
          ailment: "",
          special_instructions: "",
          type: "",
          usage: "",
        },
      ],
    }));
  };

  const handleRemoveNewChildMedicine = (medicineId) => {
    // If it's an existing medicine (has a string ID from API), track it as deleted
    if (typeof medicineId === "string" && medicineId.length > 10) {
      setDeletedNewChildMedicineIds((prev) => [...prev, medicineId]);
    }

    // Remove from new child medicines state
    setNewChild((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((medicine) => medicine.id !== medicineId),
    }));
  };

  const handleNewChildMedicineChange = (medicineId, field, value) => {
    setNewChild((prev) => ({
      ...prev,
      medicines: prev.medicines.map((medicine) => (medicine.id === medicineId ? { ...medicine, [field]: value } : medicine)),
    }));

    // Clear validation error when user starts typing
    if (newChildMedicineValidationErrors[medicineId]) {
      setNewChildMedicineValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[medicineId];
        return newErrors;
      });
    }
  };

  // Profile image upload
  const handleProfileImage = useCallback((event) => {
    event.stopPropagation();
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setProfileLoading(true);
    setProfileError("");

    ApiServices.contact
      .contactProfileUpload(formData)
      .then((res) => {
        if (res.code === 200) {
          setProfileImage(file);
          setProfileFile(res.data);
          setProfileLoading(false);
          event.target.value = "";
        }
      })
      .catch((err) => {
        setProfileLoading(false);
        setProfileError(err?.response?.data?.message || "Upload failed");
        event.target.value = "";
      });
  }, []);

  // Spouse Profile Image Handler
  const handleSpouseProfileImage = useCallback((event) => {
    event.stopPropagation();
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setSpouseProfileLoading(true);
    setSpouseProfileError("");

    ApiServices.contact
      .contactProfileUpload(formData)
      .then((res) => {
        if (res.code === 200) {
          setSpouse((prev) => ({
            ...prev,
            profileImage: file,
            profileFile: res.data,
          }));
          setSpouseProfileLoading(false);
          event.target.value = "";
        }
      })
      .catch((err) => {
        setSpouseProfileLoading(false);
        setSpouseProfileError(err?.response?.data?.message || "Upload failed");
        event.target.value = "";
      });
  }, []);

  // Child Profile Image Handler - Updated to handle new child form
  const handleChildProfileImage = useCallback((event, childId, isNewChild = false) => {
    event.stopPropagation();
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    if (isNewChild) {
      setChildrenProfileLoading((prev) => ({ ...prev, newChild: true }));
      setChildrenProfileErrors((prev) => ({ ...prev, newChild: "" }));
    } else {
      setChildrenProfileLoading((prev) => ({ ...prev, [childId]: true }));
      setChildrenProfileErrors((prev) => ({ ...prev, [childId]: "" }));
    }

    ApiServices.contact
      .contactProfileUpload(formData)
      .then((res) => {
        if (res.code === 200) {
          if (isNewChild) {
            setNewChild((prev) => ({
              ...prev,
              profileImage: file,
              profileFile: res.data,
            }));
            setChildrenProfileLoading((prev) => ({ ...prev, newChild: false }));
          } else {
            setChildren((prevChildren) =>
              prevChildren.map((child) => (child.id === childId ? { ...child, profileImage: file, profileFile: res.data } : child)),
            );
            setChildrenProfileLoading((prev) => ({ ...prev, [childId]: false }));
          }
          event.target.value = "";
        }
      })
      .catch((err) => {
        const errorMessage = err?.response?.data?.message || "Upload failed";
        if (isNewChild) {
          setChildrenProfileLoading((prev) => ({ ...prev, newChild: false }));
          setChildrenProfileErrors((prev) => ({ ...prev, newChild: errorMessage }));
        } else {
          setChildrenProfileLoading((prev) => ({ ...prev, [childId]: false }));
          setChildrenProfileErrors((prev) => ({ ...prev, [childId]: errorMessage }));
        }
        event.target.value = "";
      });
  }, []);

  // NEW: Identity File Upload Handler
  const handleFileChangeIdentify = (event) => {
    if (!event.target.files || event.target.files.length === 0) return;

    console.log("Identity file upload initiated");
    setFileLoading(true);

    const files = Array.from(event.target.files);

    const uploadFile = (file) => {
      const formData = new FormData();
      formData.append("file", file);

      return ApiServices.contact.contactProfileUpload(formData).then((res) => {
        if (res.code === 200) {
          return res.data;
        }
        throw new Error(res.message || "Upload failed");
      });
    };

    Promise.all(files.map(uploadFile))
      .then((uploadedFiles) => {
        setIndentityFile((prevFiles) => [...prevFiles, ...files]);
        setFile((uploadedFile) => [...uploadedFile, ...uploadedFiles]);
        setFileLoading(false);
        event.target.value = null;
      })
      .catch((err) => {
        console.error("Identity file upload failed:", err);
        setFileLoading(false);
        event.target.value = null;
      });
  };

  // NEW: Handle File Removal
  const handleCrossClick = (indexToRemove) => {
    setIndentityFile((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
    setFile((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  // Remove profile image handlers
  const handleRemoveProfileImage = () => {
    setProfileImage(null);
    setProfileFile(null);
  };

  const handleRemoveSpouseProfileImage = () => {
    setSpouse((prev) => ({
      ...prev,
      profileImage: null,
      profileFile: null,
    }));
  };

  const handleRemoveChildProfileImage = (childId, isNewChild = false) => {
    if (isNewChild) {
      setNewChild((prev) => ({
        ...prev,
        profileImage: null,
        profileFile: null,
      }));
      setChildrenProfileErrors((prev) => ({ ...prev, newChild: "" }));
    } else {
      setChildren((prevChildren) =>
        prevChildren.map((child) => (child.id === childId ? { ...child, profileImage: null, profileFile: null } : child)),
      );
      setChildrenProfileErrors((prev) => ({ ...prev, [childId]: "" }));
    }
  };

  // Contact management
  const handleAddContactField = useCallback(() => {
    setContacts((prev) => [...prev, { id: Date.now(), contactType: "", countryCode: "", contactNumber: "" }]);
  }, []);

  const handleInputChangePhone = useCallback((id, field, value) => {
    setContacts((prev) => prev.map((contact) => (contact.id === id ? { ...contact, [field]: value } : contact)));
  }, []);

  const handleRemoveContact = useCallback((id) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== id));
  }, []);

  // Email management
  const handleAddEmailField = useCallback(() => {
    setEmails((prev) => [...prev, { id: Date.now(), emailType: "", emailAddress: "" }]);
  }, []);

  const handleInputChangeEmail = useCallback((id, field, value) => {
    setEmails((prev) => prev.map((email) => (email.id === id ? { ...email, [field]: value } : email)));
  }, []);

  const handleRemoveEmail = useCallback((id) => {
    setEmails((prev) => prev.filter((email) => email.id !== id));
  }, []);

  // Child management
  const handleChildAdultFieldChange = (childId, field, value) => {
    setChildren((prevChildren) => prevChildren.map((child) => (child.id === childId ? { ...child, [field]: value } : child)));
  };

  const handleRemoveChild = (childId) => {
    setChildren((prevChildren) => prevChildren.filter((child) => child.id !== childId));
    // Clean up loading and error states for removed child
    setChildrenProfileLoading((prev) => {
      const newState = { ...prev };
      delete newState[childId];
      return newState;
    });
    setChildrenProfileErrors((prev) => {
      const newState = { ...prev };
      delete newState[childId];
      return newState;
    });
  };

  // Meal preferences
  const handleMealChange = useCallback((value, index) => {
    setSelectedMealIds((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }, []);

  // NEW: Add handlers for spouse preferences
  const handleSpouseMealChange = (value, index) => {
    const currentMeals = spouse.meal_preference || [[], [], []];
    const updatedSpouseMeals = [...currentMeals];
    updatedSpouseMeals[index] = value;
    setSpouse({ ...spouse, meal_preference: updatedSpouseMeals });
  };

  // NEW: Add handlers for child preferences
  const handleChildMealChange = (childId, value, index) => {
    setChildren((prevChildren) =>
      prevChildren.map((child) => {
        if (child.id === childId) {
          const currentMeals = child.meal_preference || [[], [], []];
          const updatedChildMeals = [...currentMeals];
          updatedChildMeals[index] = value;
          return { ...child, meal_preference: updatedChildMeals };
        }
        return child;
      }),
    );
  };

  // NEW: Add handler for new child preferences
  const handleNewChildMealChange = (value, index) => {
    const currentMeals = newChild.meal_preference || [[], [], []];
    const updatedNewChildMeals = [...currentMeals];
    updatedNewChildMeals[index] = value;
    setNewChild({ ...newChild, meal_preference: updatedNewChildMeals });
  };

  // Get meal options by type
  const filterByType = useCallback(
    (type) => {
      return (
        allCategories
          ?.filter((item) => item.type === type)
          ?.map((item) => ({
            label: item.name,
            value: item.id,
          })) || []
      );
    },
    [allCategories],
  );

  // Form validation
  const validateForm = useCallback(() => {
    if (!salutation || !firstName || !lastName) {
      return false;
    }

    if (contacts.some((contact) => !contact?.contactType?.value || !contact?.countryCode?.value || !contact.contactNumber)) {
      return false;
    }

    return true;
  }, [salutation, firstName, lastName, contacts]);

  // Add functions for dropdown changes
  const handleColorCodeChange = (selectedOption) => {
    if (selectedOption.value === "add_color_code") {
      setOpenColorCodeModal(true);
    } else {
      setSelectedColorCode(selectedOption);
    }
  };

  const handleGroupChange = (selectedOption) => {
    if (selectedOption.value === "add_group") {
      setOpenGroupModal(true);
    } else {
      setGroups(selectedOption);
    }
  };

  const handleFamilyChange = (selectedOption) => {
    if (selectedOption.value === "add_family") {
      setOpenFamilyModal(true);
    } else {
      setFamily(selectedOption);
    }
  };

  // NEW: Add functions for adding new options
  const addNewColorCode = () => {
    const requestData = {
      name: newColorCodeName,
      event_id: selectedEvent?.value,
    };

    ApiServices.contact
      .AddColorCode(requestData)
      .then((res) => {
        const { data, message } = res;
        if (res?.status === true) {
          const newOption = { value: res.data.id, label: newColorCodeName };
          setColorCodeOptions([...colorCodeOptions, newOption]);
          setSelectedColorCode(newOption);
          setOpenColorCodeModal(false);
          setNewColorCodeName("");
        }
      })
      .catch((err) => {
        setErrorMessageServer(err.response?.data?.message);
      });
  };

  const addNewFamily = () => {
    const requestData = {
      name: newFamilyName,
      event_id: selectedEvent?.value,
    };

    ApiServices.contact
      .AddFamily(requestData)
      .then((res) => {
        const { data, message } = res;
        if (res?.code === 200) {
          const newOption = { value: res.data.id, label: newFamilyName };
          setFamilyOptions([...familyOptions, newOption]);
          setFamily(newOption);
          setOpenFamilyModal(false);
          setNewFamilyName("");
        }
      })
      .catch((err) => {
        setErrorMessageServer(err.response?.data?.message);
      });
  };

  const addNewGroup = () => {
    const requestData = {
      name: newGroupName,
      event_id: selectedEvent?.value,
    };

    ApiServices.contact
      .AddGroup(requestData)
      .then((res) => {
        const { data, message } = res;
        if (res?.code === 200) {
          const newOption = { value: res.data.id, label: newGroupName };
          setGroupOptions([...groupOptions, newOption]);
          setGroups(newOption);
          setOpenGroupModal(false);
          setNewGroupName("");
        }
      })
      .catch((err) => {
        setErrorMessageServer(err.response?.data?.message);
      });
  };

  // NEW: Delete functions
  const deleteGroup = () => {
    setBtnLoading(true);
    ApiServices.contact
      .deleteContactGroup(openDeleteModal?.data)
      .then((res) => {
        if (res?.data?.code === 200) {
          setBtnLoading(false);
          setGroups("");
          loadEventSpecificData(selectedEvent);
          setOpenDeleteModal({ open: false, data: null });
          openSuccessModal({
            title: "Success!",
            message: "Contact group has been deleted successfully!",
            onClickDone: closeSuccessModel,
          });
        }
      })
      .catch((err) => {
        setErrorMessage(err?.response?.data?.message);
        setBtnLoading(false);
        setGroups("");
      });
  };

  const deleteFamily = () => {
    setBtnLoading(true);
    ApiServices.contact
      .deleteContactFamily(openDeleteModalFamily?.data)
      .then((res) => {
        if (res?.data?.code === 200) {
          setBtnLoading(false);
          setFamily("");
          loadEventSpecificData(selectedEvent);
          setOpenDeleteModalFamily({ open: false, data: null });
          openSuccessModal({
            title: "Success!",
            message: "Contact family has been deleted successfully!",
            onClickDone: closeSuccessModel,
          });
        }
      })
      .catch((err) => {
        setErrorMessage(err?.response?.data?.message);
        setBtnLoading(false);
        setFamily("");
      });
  };

  const deleteColorCode = () => {
    setBtnLoading(true);
    ApiServices.contact
      .deleteContactColorCode(openDeleteModalColorCode?.data)
      .then((res) => {
        if (res?.data?.status === true) {
          setBtnLoading(false);
          setSelectedColorCode(null);
          loadEventSpecificData(selectedEvent);
          setOpenDeleteModalColorCode({ open: false, data: null });
          openSuccessModal({
            title: "Success!",
            message: "Contact color code has been deleted successfully!",
            onClickDone: closeSuccessModel,
          });
        }
      })
      .catch((err) => {
        setErrorMessage(err?.response?.data?.message);
        setBtnLoading(false);
        setSelectedColorCode(null);
      });
  };

  // FIXED: Event change handler with proper data loading
  const handleEventChange = (selectedOption) => {
    console.log("Event changed to:", selectedOption);

    setSelectedEvent(selectedOption);

    // Find matching user_id for selected event
    const matchingUser = contactData.users?.find((user) => user.event_details?.id === selectedOption.value);

    if (matchingUser) {
      console.log("Found matching user:", matchingUser);
      setSelectedEventContact(matchingUser.user_id);
      // The useEffect will handle calling loadAllData when both values are set
    } else {
      console.log("No matching user found for event:", selectedOption);
      setSelectedEventContact(null);
    }
  };

  // Update contact
  const updateContact = useCallback(async () => {
    setIsSubmitted(true);

    if (!validateForm()) {
      setMessage({ text: "Please fill all required fields", color: "red" });
      return;
    }

    // Process identity images
    const identityImageString = Array.isArray(file) ? file.join(",") : file;

    const requestData = {
      salutation: salutation,
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      nick_name: nickName,
      salutation_in_email: salutationEmail,
      gender: gender,
      DOB: toUTCUnixTimestamp(birthDate),
      group_id: groups?.value,
      family_id: family?.value,
      color_code_id: selectedColorCode?.value,
      no_of_members: 1 + (children?.length || 0) + (spouse?.name ? 1 : 0),
      marital_status: martialStatus,
      anniversery_date: toUTCUnixTimestamp(anniversaryDate),
      address: address,
      city: city,
      state: state,
      pin: pin,
      country: country?.Value,
      company_name: companyName,
      work_city: workCity,
      work_state: workState,
      work_address: workAddress,
      work_pin: workPin,
      work_country: workCountry?.Value,
      preferences: selectedMealIds?.flatMap((category) => category.map((item) => item.value)),
      special_need: specialNeed ? "yes" : "not",
      identity_image: identityImageString,
      profile_image: profileFile,
      description: note,
      event_id: selectedEvent?.value,
      user_id: selectedEventContact,
      wedding_hall_seat: weddingHallSeat,

      // NEW: Add medicines to the payload
      medicines: medicines
        .map((medicine) => ({
          ...(medicine.id && typeof medicine.id === "string" && medicine.id.length > 10 ? { id: medicine.id } : {}),
          name: medicine.name,
          ailment: medicine.ailment,
          special_instructions: medicine.special_instructions,
          type: medicine.type,
          usage: medicine.usage,
        }))
        .filter((medicine) => medicine.name && medicine.ailment),

      contact_children:
        martialStatus.toLowerCase() === "single"
          ? []
          : [
              ...children.map((item) => ({
                id: item?.id,
                name: item?.name,
                middle_name: item?.middleName || "",
                salutation: item?.salutation,
                last_name: item?.lastName,
                gender: item?.gender,
                contact_number: { number: item?.contactNumber, countryCode: item?.countryCode?.value },
                type: "children",
                isAdult: item.isAdult,
                wedding_hall_seat: item?.wedding_hall_seat || "",
                profile_image: item?.profileFile || null,
                meal_preference:
                  item?.meal_preference?.flatMap((category) => (Array.isArray(category) ? category.map((item) => item.value) : [])) || [],
                medicines:
                  item?.medicines?.map((medicine) => ({
                    // Include ID for existing medicines (those with string IDs from the API)
                    ...(medicine.id && typeof medicine.id === "string" && medicine.id.length > 10 ? { id: medicine.id } : {}),
                    name: medicine.name,
                    ailment: medicine.ailment,
                    special_instructions: medicine.special_instructions,
                    type: medicine.type,
                    usage: medicine.usage,
                  })) || [],
              })),
              spouse?.name
                ? {
                    id: spouse?.id,
                    name: spouse?.name,
                    middle_name: spouse?.middleName || "",
                    salutation: spouse?.salutation,
                    last_name: spouse?.lastName,
                    contact_number: { number: spouse?.contactNumber, countryCode: spouse?.countryCode?.value },
                    gender: spouse?.gender,
                    type: "spouse",
                    wedding_hall_seat: spouse?.wedding_hall_seat || "",
                    profile_image: spouse?.profileFile || null,
                    meal_preference:
                      spouse?.meal_preference?.flatMap((category) => (Array.isArray(category) ? category.map((item) => item.value) : [])) || [],
                    medicines:
                    spouse?.medicines?.map((medicine) => ({
                        // Include ID for existing medicines (those with string IDs from the API)
                        ...(medicine.id && typeof medicine.id === "string" && medicine.id.length > 10 ? { id: medicine.id } : {}),
                        name: medicine.name,
                        ailment: medicine.ailment,
                        special_instructions: medicine.special_instructions,
                        type: medicine.type,
                        usage: medicine.usage,
                      })) || [],
                  }
                : null,
            ].filter(Boolean),

      contact_numbers: contacts?.map((item) => ({
        type: item?.contactType?.value,
        contact_number: item?.contactNumber,
        country_code: item?.countryCode?.value || item?.countryCode,
      })),

      contact_emails: emails.map((item) => ({
        type: item?.emailType?.value,
        contact_email: item?.emailAddress,
      })),
    };

    setUpdateLoading(true);

    try {
      const response = await ApiServices.contact.updateContact(selectedEventContact, requestData);

      if (response?.code === 200 || response?.data?.code === 200) {
        setUpdateLoading(false);

        const updatedData = response?.data?.data || response?.data;
        if (updatedData) {
          setUserDetailData(updatedData);
          setContactData((prev) => ({ ...prev, ...updatedData }));
        }

        setMessage({ text: "", color: "" });

        openSuccessModal({
          title: t("message.success"),
          message: t("contacts.contactUpdatedSucess") || "Contact updated successfully!",
          onClickDone: () => {
            closeSuccessModel();
            navigate("/get-contact-details");
            localStorage.clear();
          },
        });
      } else {
        setUpdateLoading(false);
        const errorMsg = response?.data?.message || response?.message || "Failed to update contact";
        setMessage({ text: errorMsg, color: "red" });
      }
    } catch (err) {
      setUpdateLoading(false);
      console.error("Update contact error:", err);

      let errorMessage = "Failed to update contact";
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.data?.message) {
        errorMessage = err.response.data.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setMessage({ text: errorMessage, color: "red" });
    }
  }, [
    salutation,
    firstName,
    middleName,
    lastName,
    nickName,
    salutationEmail,
    gender,
    birthDate,
    groups,
    family,
    selectedColorCode,
    children,
    spouse,
    martialStatus,
    anniversaryDate,
    address,
    city,
    state,
    pin,
    country,
    companyName,
    workCity,
    workState,
    workAddress,
    workPin,
    workCountry,
    selectedMealIds,
    specialNeed,
    profileFile,
    note,
    contacts,
    emails,
    contactData,
    validateForm,
    openSuccessModal,
    closeSuccessModel,
    t,
    navigate,
    file,
    selectedEvent,
    selectedEventContact,
    medicines, // NEW: Added medicines to dependency array
    weddingHallSeat,
  ]);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <Spinner size="large" />
        <p className="mt-4 text-center text-gray-600">Loading contact details...</p>
      </div>
    );
  }

  // Error state
  if (!contactData || !userDetailData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="text-center text-red-500">
          <h2 className="mb-2 text-xl font-semibold">Contact Not Found</h2>
          <p>The requested contact could not be loaded.</p>
          <button
            onClick={() => {
              localStorage.clear(); // Clear all localStorage data
              navigate("/get-contact-details");
            }}
            className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-responsive back button header */}
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button
              onClick={() => {
                localStorage.clear(); // Clear all localStorage data
                navigate("/get-contact-details");
              }}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="mr-2 h-5 w-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <h1 className="hidden text-center text-lg font-semibold text-gray-900 sm:inline sm:text-xl">
              <span className="hidden sm:inline">Edit Contact: </span>
              {firstName} {lastName}
            </h1>
            <div className="min-w-0 flex-1 sm:min-w-[200px] sm:flex-none">
              <Dropdown isSearchable options={eventData} placeholder="Events" value={selectedEvent} onChange={handleEventChange} invisible />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[86rem] px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
        <div className="card">
          <form onSubmit={(e) => e.preventDefault()}>
            <h2 className="heading mb-5">{t("contacts.editContact")}</h2>

            {/* Basic Info Section */}
            <div className="mb-5 ltr:text-left rtl:text-right">
              <div>
                <div className="label mb-2 text-secondary">{t("headings.basicInfo")}</div>
              </div>
            </div>

            {/* Mobile-responsive grid for basic info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-7">
              <Input
                label={t("contacts.salutation")}
                placeholder="Salutation"
                value={salutation}
                onChange={(e) => setSalutation(e.target.value)}
                isRequired
                error={isSubmitted && !salutation ? "Required" : ""}
              />
              <Input
                label={t("contacts.firstName")}
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                isRequired
                error={isSubmitted && !firstName ? "Required" : ""}
              />
              <Input label={t("contacts.middleName")} placeholder="Middle Name" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
              <Input
                label={t("contacts.lastName")}
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                isRequired
                error={isSubmitted && !lastName ? "Required" : ""}
              />
              <Input label={t("contacts.nickName")} placeholder="Nick Name" value={nickName} onChange={(e) => setNickName(e.target.value)} />
              <div className="sm:col-span-2 xl:col-span-1">
                <Input
                  label={t("contacts.salutationInEmail")}
                  placeholder="Example, Dear Deepak, Hello Mr. & Mrs. Aggarwal"
                  value={salutationEmail}
                  onChange={(e) => setSalutationEmail(e.target.value)}
                  labelOnTop
                />
              </div>
              <Dropdown
                isSearchable
                options={colorCodeOptions.concat({ value: "add_color_code", label: "Add New Color Code" })}
                title="Select Guest Colour Code"
                placeholder="Select Color Code"
                value={selectedColorCode}
                onChange={handleColorCodeChange}
                Delete
                setOpenDeleteModal={setOpenDeleteModalColorCode}
              />

              <Input
                label="Wedding Hall Seat"
                placeholder="Wedding Hall Seat"
                value={weddingHallSeat}
                onChange={(e) => setWeddingHallSeat(e.target.value)}
              />
            </div>

            {/* Profile Image */}
            <div className="my-5">
              <ChooseFile
                label={t("contacts.profileImage")}
                onClickCross={handleRemoveProfileImage}
                placeholder
                selectedFile={ProfileImage}
                loading={profileLoading}
                dir
                onChange={handleProfileImage}
              />
              {profileError && <span className="mt-5 block text-xs text-red-500">{profileError}</span>}
            </div>

            {/* NEW: Medicine Section */}
            <div className="my-5">
              <div className="mt-5 grid grid-cols-12 gap-2">
                <div className="col-span-8">
                  <button type="button" className="rounded-lg bg-secondary px-4 py-2 text-white" onClick={handleAddMedicine}>
                    Add Medicine
                  </button>
                </div>
              </div>

              {/* Only show medicine fields if there are medicines */}
              {medicines.length > 0 &&
                medicines.map((medicine, index) => (
                  <div key={medicine.id} className="mb-4 mt-5">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">Medicine {index + 1}</h4>
                      <button type="button" className="mt-4" onClick={() => handleRemoveMedicine(medicine.id)}>
                        <TrashIcon className="h-5 w-5 cursor-pointer text-red-500" />
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-7 md:grid-cols-2 lg:grid-cols-4">
                      <Input
                        type="text"
                        label="Medicine Name *"
                        placeholder="Enter medicine name"
                        value={medicine.name}
                        onChange={(e) => handleMedicineChange(medicine.id, "name", e.target.value)}
                      />

                      <Input
                        type="text"
                        label="Problem/Ailment *"
                        placeholder="Enter problem or ailment"
                        value={medicine.ailment}
                        onChange={(e) => handleMedicineChange(medicine.id, "ailment", e.target.value)}
                      />

                      <Input
                        type="text"
                        label="Medicine Type"
                        placeholder="e.g., Tablet, Capsule, Syrup"
                        value={medicine.type}
                        onChange={(e) => handleMedicineChange(medicine.id, "type", e.target.value)}
                      />

                      <Input
                        type="text"
                        label="Medication Type"
                        placeholder="e.g., Once daily, Twice daily"
                        value={medicine.usage}
                        onChange={(e) => handleMedicineChange(medicine.id, "usage", e.target.value)}
                      />
                    </div>

                    <div className="mt-4">
                      <Input
                        textarea
                        label="Special Instructions"
                        placeholder="Enter special instructions"
                        value={medicine.special_instructions}
                        onChange={(e) => handleMedicineChange(medicine.id, "special_instructions", e.target.value)}
                        rows={3}
                      />
                    </div>
                    {/* Show validation error if any */}
                    {medicineValidationErrors[medicine.id] && (
                      <div className="mb-3 rounded-md bg-red-50 p-3">
                        <p className="text-sm text-red-600">{medicineValidationErrors[medicine.id]}</p>
                      </div>
                    )}
                  </div>
                ))}

              {/* Show message when no medicines added */}
              {medicines.length === 0 && (
                <div className="mt-5 text-center text-gray-500">
                  <p className="text-sm">No medicines added yet. Click "Add Medicine" to get started.</p>
                </div>
              )}
            </div>

            {/* Gender - Mobile-responsive */}
            <div className="my-5">
              <div className="label mb-2">{t("contacts.gender")}</div>
              <RadioInput
                name="Gender"
                options={[
                  { id: "male", value: "Male", label: t("contacts.male") },
                  { id: "female", value: "Female", label: t("contacts.female") },
                  { id: "other", value: "Other", label: t("contacts.other") },
                  { id: "n/a", value: "N/A", label: "N/A" },
                ]}
                Classes="flex flex-wrap gap-2 sm:gap-4"
                labelClasses="ml-3"
                onChange={(value) => setGender(value)}
                checked={gender}
              />
            </div>

            {/* Birth Date, Groups, Family - Mobile-responsive */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-7">
              <Input
                type="date"
                label={t("contacts.birthDate")}
                placeholder="Date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={moment().format("YYYY-MM-DD")}
              />
              <Dropdown
                options={groupOptions?.concat({ value: "add_group", label: "Add New Group" })}
                title={t("contacts.groups")}
                placeholder="Select groups"
                value={groups}
                onChange={handleGroupChange}
                Delete
                setOpenDeleteModal={setOpenDeleteModal}
              />
              <Dropdown
                options={familyOptions?.concat({ value: "add_family", label: "Add New Family" })}
                title={t("contacts.family")}
                placeholder="Select family"
                value={family}
                onChange={handleFamilyChange}
                Delete
                setOpenDeleteModalFamily={setOpenDeleteModalFamily}
              />
            </div>

            {/* Marital Status - Mobile-responsive */}
            <div className="my-5">
              <div className="label mb-2">{t("contacts.maritalStatus")}</div>
              <RadioInput
                name="Marital"
                options={[
                  { id: "Single", value: "Single", label: t("contacts.single") },
                  { id: "Married", value: "Married", label: t("contacts.married") },
                ]}
                Classes="flex flex-wrap gap-2 sm:gap-4"
                labelClasses="ml-3"
                onChange={(value) => setMartialStatus(value)}
                checked={martialStatus}
              />
            </div>

            {/* Anniversary Date - Only for Married - Mobile-responsive */}
            {martialStatus === "Married" && (
              <div className="mb-3 w-full sm:w-1/2 lg:w-1/3">
                <Input
                  type="date"
                  label="Anniversary Date"
                  placeholder="Date"
                  value={anniversaryDate}
                  onChange={(e) => setAnniversaryDate(e.target.value)}
                />
              </div>
            )}

            {/* Spouse Section - Only for Married - Mobile-responsive */}
            {martialStatus === "Married" && (
              <div className="mb-5">
                <h2 className="label">Spouse</h2>
                <div className="col-span-12 mt-3 rounded-lg border border-dashed bg-yellow-50 p-4">
                  <h3 className="pb-3 text-sm font-medium text-gray-700">Add Spouse</h3>

                  {/* Spouse basic info - Mobile-responsive grid */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <Input
                      label="Salutation"
                      placeholder="Mr./Mrs./Ms./Dr."
                      value={spouse.salutation}
                      onChange={(e) => setSpouse({ ...spouse, salutation: e.target.value })}
                    />
                    <Input
                      label="First Name"
                      placeholder="First Name"
                      value={spouse.name}
                      onChange={(e) => setSpouse({ ...spouse, name: e.target.value })}
                    />
                    <Input
                      label="Middle Name"
                      placeholder="Middle Name"
                      value={spouse.middleName}
                      onChange={(e) => setSpouse({ ...spouse, middleName: e.target.value })}
                    />
                    <Input
                      label="Last Name"
                      placeholder="Last Name"
                      value={spouse.lastName}
                      onChange={(e) => setSpouse({ ...spouse, lastName: e.target.value })}
                    />
                    <Dropdown
                      isSearchable
                      options={countriesCodeData?.countries.map((country) => ({
                        label: `+${country.callingCodes[0]} ${country.name}`,
                        value: `+${country.callingCodes[0]} ${country.name}`,
                      }))}
                      placeholder="Country Code"
                      title="Country Code"
                      value={spouse.countryCode}
                      onChange={(e) => setSpouse({ ...spouse, countryCode: e })}
                    />
                    <Input
                      type="tel"
                      label="Contact Number"
                      placeholder="Contact Number"
                      value={spouse.contactNumber}
                      onChange={(e) => setSpouse({ ...spouse, contactNumber: e.target.value })}
                    />
                  </div>

                  {/* Spouse Gender Selection - Mobile-responsive */}
                  <div className="mt-3">
                    <div className="label mb-2">Spouse Gender</div>
                    <RadioInput
                      name="SpouseGender"
                      options={[
                        { id: "spouse_male", value: "Male", label: "Male" },
                        { id: "spouse_female", value: "Female", label: "Female" },
                        { id: "spouse_other", value: "Other", label: "Other" },
                        { id: "spouse_na", value: "N/A", label: "N/A" },
                      ]}
                      Classes="flex flex-wrap gap-2 sm:gap-4"
                      onChange={(value) => setSpouse({ ...spouse, gender: value })}
                      checked={spouse?.gender}
                    />
                  </div>

                  {/* Spouse Profile Image */}
                  <div>
                    <ChooseFile
                      label="Profile Image"
                      onClickCross={handleRemoveSpouseProfileImage}
                      placeholder
                      selectedFile={spouse.profileImage}
                      loading={spouseProfileLoading}
                      dir
                      onChange={handleSpouseProfileImage}
                      uni="Spouse"
                    />
                    {spouseProfileError && <span className="mt-2 block text-xs text-red-500">{spouseProfileError}</span>}
                  </div>

                  <Input
                    label="Wedding Hall Seat"
                    placeholder="Wedding Hall Seat"
                    value={spouse.weddingHallSeat}
                    onChange={(e) => setSpouse({ ...spouse, weddingHallSeat: e.target.value })}
                  />

                  {/* NEW: Spouse Preferences Section */}
                  <div className="mt-6">
                    <div className="mb-3">
                      <div className="label text-secondary">Spouse Preferences</div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-5">
                      <Dropdown
                        isSearchable
                        options={filterByType("primary")}
                        title={t("contacts.primaryMealPreference")}
                        placeholder="Select Primary Meal"
                        value={spouse.meal_preference?.[0] || ""}
                        onChange={(value) => handleSpouseMealChange(value, 0)}
                        isMulti
                      />

                      <Dropdown
                        isSearchable
                        options={filterByType("secondary")}
                        title={t("contacts.secondaryMealPreference")}
                        placeholder="Select Secondary Meal"
                        value={spouse.meal_preference?.[1] || ""}
                        onChange={(value) => handleSpouseMealChange(value, 1)}
                        isMulti
                      />

                      <Dropdown
                        isSearchable
                        options={filterByType("alcoholic")}
                        title={t("contacts.alcoholPreference")}
                        placeholder="Select Alcohol Preference"
                        value={spouse.meal_preference?.[2] || ""}
                        onChange={(value) => handleSpouseMealChange(value, 2)}
                        isMulti
                      />
                    </div>
                  </div>
                  {/* Spouse Medicine Section */}
                  <div className="mt-6">
                    <div className="mt-5 grid grid-cols-12 gap-2">
                      <div className="col-span-8">
                        <button type="button" className="rounded-lg bg-secondary px-4 py-2 text-white" onClick={handleAddSpouseMedicine}>
                          Add Medicine for Spouse
                        </button>
                      </div>
                    </div>

                    {/* Only show medicine fields if there are medicines */}
                    {spouse.medicines &&
                      spouse.medicines.length > 0 &&
                      spouse.medicines.map((medicine, index) => (
                        <div key={medicine.id} className="mb-4 mt-5">
                          <div className="mb-3 flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-700">Spouse Medicine {index + 1}</h4>
                            <button type="button" className="mt-4" onClick={() => handleRemoveSpouseMedicine(medicine.id)}>
                              <TrashIcon className="h-5 w-5 cursor-pointer text-red-500" />
                            </button>
                          </div>

                          <div className="grid grid-cols-4 gap-7 md:grid-cols-2 lg:grid-cols-4">
                            <Input
                              type="text"
                              label="Medicine Name *"
                              placeholder="Enter medicine name"
                              value={medicine.name}
                              onChange={(e) => handleSpouseMedicineChange(medicine.id, "name", e.target.value)}
                            />

                            <Input
                              type="text"
                              label="Problem/Ailment *"
                              placeholder="Enter problem or ailment"
                              value={medicine.ailment}
                              onChange={(e) => handleSpouseMedicineChange(medicine.id, "ailment", e.target.value)}
                            />

                            <Input
                              type="text"
                              label="Medicine Type"
                              placeholder="e.g., Tablet, Capsule, Syrup"
                              value={medicine.type}
                              onChange={(e) => handleSpouseMedicineChange(medicine.id, "type", e.target.value)}
                            />

                            <Input
                              type="text"
                              label="Medication Type"
                              placeholder="e.g., Once daily, Twice daily"
                              value={medicine.usage}
                              onChange={(e) => handleSpouseMedicineChange(medicine.id, "usage", e.target.value)}
                            />
                          </div>

                          <div className="mt-4">
                            <Input
                              textarea
                              label="Special Instructions"
                              placeholder="Enter special instructions"
                              value={medicine.special_instructions}
                              onChange={(e) => handleSpouseMedicineChange(medicine.id, "special_instructions", e.target.value)}
                              rows={3}
                            />
                          </div>
                          {/* Show validation error if any */}
                          {spouseMedicineValidationErrors[medicine.id] && (
                            <div className="mb-3 rounded-md bg-red-50 p-3">
                              <p className="text-sm text-red-600">{spouseMedicineValidationErrors[medicine.id]}</p>
                            </div>
                          )}
                        </div>
                      ))}

                    {/* Show message when no medicines added */}
                    {(!spouse.medicines || spouse.medicines.length === 0) && (
                      <div className="mt-5 text-center text-gray-500">
                        <p className="text-sm">No medicines added for spouse yet. Click "Add Medicine for Spouse" to get started.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Children Section - Only for Married - Mobile-responsive */}
            {martialStatus === "Married" && (
              <div>
                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-10">
                  <h2 className="label">Children</h2>
                  {/* Plus button to add new child form block */}
                  <button
                    type="button"
                    onClick={handleAddNewChildForm}
                    className="flex items-center gap-2 self-start text-green-600 hover:text-green-700"
                  >
                    <PlusCircleIcon className="h-6 w-6" />
                    <span className="text-sm">Add Child</span>
                  </button>
                </div>

                {/* Existing Children - Mobile-responsive */}
                {children?.map((child, index) => (
                  <div key={`child-${child.id}`} className="mt-5 space-y-4 rounded-lg border bg-gray-50 p-4">
                    {/* Child basic info - Mobile-responsive grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                      <Input
                        label="Salutation"
                        placeholder="Mr./Mrs./Ms./Dr."
                        labelOnTop
                        value={child.salutation || ""}
                        onChange={(event) => handleChildAdultFieldChange(child.id, "salutation", event.target.value)}
                      />
                      <Input
                        label="First Name"
                        placeholder="First Name"
                        labelOnTop
                        value={child.name}
                        onChange={(event) => handleChildAdultFieldChange(child.id, "name", event.target.value)}
                      />
                      <Input
                        label="Middle Name"
                        placeholder="Middle Name"
                        labelOnTop
                        value={child.middleName || ""}
                        onChange={(event) => handleChildAdultFieldChange(child.id, "middleName", event.target.value)}
                      />
                      <Input
                        label="Last Name"
                        placeholder="Last Name"
                        labelOnTop
                        value={child.lastName || ""}
                        onChange={(event) => handleChildAdultFieldChange(child.id, "lastName", event.target.value)}
                      />
                      <Dropdown
                        isSearchable
                        options={countriesCodeData?.countries.map((country) => ({
                          label: `+${country.callingCodes[0]} ${country.name}`,
                          value: `+${country.callingCodes[0]} ${country.name}`,
                        }))}
                        placeholder="Country Code"
                        title="Country Code"
                        value={child.countryCode}
                        onChange={(event) => handleChildAdultFieldChange(child.id, "countryCode", event)}
                      />
                      <Input
                        type="tel"
                        label="Contact Number"
                        placeholder="Contact Number"
                        value={child.contactNumber}
                        onChange={(event) => handleChildAdultFieldChange(child.id, "contactNumber", event.target.value)}
                      />
                    </div>

                    {/* Child Gender and Actions Row - Mobile-responsive */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <RadioInput
                          name={`Child_${child.id}`}
                          options={[
                            { id: `Male_${child.id}`, value: "Male", label: "Male" },
                            { id: `Female_${child.id}`, value: "Female", label: "Female" },
                            { id: `Other_${child.id}`, value: "Other", label: "Other" },
                            { id: `N/A_${child.id}`, value: "N/A", label: "N/A" },
                          ]}
                          value={child.gender}
                          onChange={(value) => handleChildAdultFieldChange(child.id, "gender", value)}
                          Classes="flex flex-wrap gap-2 sm:gap-4"
                          checked={child?.gender}
                        />
                      </div>
                      <button type="button" onClick={() => handleRemoveChild(child.id)}>
                        <TrashIcon className="h-5 w-5 cursor-pointer text-red-500" />
                      </button>
                    </div>

                    {/* Child Profile Image */}
                    <div>
                      <ChooseFile
                        label={`Child ${index + 1} Profile Image`}
                        onClickCross={() => handleRemoveChildProfileImage(child.id)}
                        placeholder
                        selectedFile={child.profileImage}
                        loading={childrenProfileLoading[child.id] || false}
                        dir
                        onChange={(event) => handleChildProfileImage(event, child.id)}
                        uni={`Child-${child.id}`}
                      />
                      {childrenProfileErrors[child.id] && <span className="mt-2 block text-xs text-red-500">{childrenProfileErrors[child.id]}</span>}
                    </div>

                    <Input
                      label="Wedding Hall Seat"
                      placeholder="Wedding Hall Seat"
                      value={child.weddingHallSeat}
                      onChange={(e) => handleChildAdultFieldChange(child.id, "weddingHallSeat", e.target.value)}
                    />

                    {/* NEW: Child Preferences Section */}
                    <div className="mt-4">
                      <div className="mb-3">
                        <div className="label text-secondary">Child {index + 1} Preferences</div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-5">
                        <Dropdown
                          isSearchable
                          options={filterByType("primary")}
                          title={t("contacts.primaryMealPreference")}
                          placeholder="Select Primary Meal"
                          value={child.meal_preference?.[0] || ""}
                          onChange={(value) => handleChildMealChange(child.id, value, 0)}
                          isMulti
                        />

                        <Dropdown
                          isSearchable
                          options={filterByType("secondary")}
                          title={t("contacts.secondaryMealPreference")}
                          placeholder="Select Secondary Meal"
                          value={child.meal_preference?.[1] || ""}
                          onChange={(value) => handleChildMealChange(child.id, value, 1)}
                          isMulti
                        />

                        <Dropdown
                          isSearchable
                          options={filterByType("alcoholic")}
                          title={t("contacts.alcoholPreference")}
                          placeholder="Select Alcohol Preference"
                          value={child.meal_preference?.[2] || ""}
                          onChange={(value) => handleChildMealChange(child.id, value, 2)}
                          isMulti
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Medicine Section for Existing Children */}
                {children?.map((child, index) => (
                  <div key={`child-medicine-${child.id}`} className="mt-5 space-y-4 rounded-lg border bg-gray-50 p-4">
                    <h3 className="text-sm font-medium text-gray-700">Medicine for Child {index + 1}</h3>

                    <div className="mt-5 grid grid-cols-12 gap-2">
                      <div className="col-span-8">
                        <button
                          type="button"
                          className="rounded-lg bg-secondary px-4 py-2 text-white"
                          onClick={() => handleAddChildMedicine(child.id)}
                        >
                          Add Medicine for Child {index + 1}
                        </button>
                      </div>
                    </div>

                    {/* Only show medicine fields if there are medicines */}
                    {child.medicines &&
                      child.medicines.length > 0 &&
                      child.medicines.map((medicine, medIndex) => (
                        <div key={medicine.id} className="mb-4 mt-5">
                          <div className="mb-3 flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-700">
                              Child {index + 1} Medicine {medIndex + 1}
                            </h4>
                            <button type="button" className="mt-4" onClick={() => handleRemoveChildMedicine(child.id, medicine.id)}>
                              <TrashIcon className="h-5 w-5 cursor-pointer text-red-500" />
                            </button>
                          </div>

                          <div className="grid grid-cols-4 gap-7 md:grid-cols-2 lg:grid-cols-4">
                            <Input
                              type="text"
                              label="Medicine Name *"
                              placeholder="Enter medicine name"
                              value={medicine.name}
                              onChange={(e) => handleChildMedicineChange(child.id, medicine.id, "name", e.target.value)}
                            />

                            <Input
                              type="text"
                              label="Problem/Ailment *"
                              placeholder="Enter problem or ailment"
                              value={medicine.ailment}
                              onChange={(e) => handleChildMedicineChange(child.id, medicine.id, "ailment", e.target.value)}
                            />

                            <Input
                              type="text"
                              label="Medicine Type"
                              placeholder="e.g., Tablet, Capsule, Syrup"
                              value={medicine.type}
                              onChange={(e) => handleChildMedicineChange(child.id, medicine.id, "type", e.target.value)}
                            />

                            <Input
                              type="text"
                              label="Medication Type"
                              placeholder="e.g., Once daily, Twice daily"
                              value={medicine.usage}
                              onChange={(e) => handleChildMedicineChange(child.id, medicine.id, "usage", e.target.value)}
                            />
                          </div>

                          <div className="mt-4">
                            <Input
                              textarea
                              label="Special Instructions"
                              placeholder="Enter special instructions"
                              value={medicine.special_instructions}
                              onChange={(e) => handleChildMedicineChange(child.id, medicine.id, "special_instructions", e.target.value)}
                              rows={3}
                            />
                          </div>
                          {/* Show validation error if any */}
                          {childrenMedicineValidationErrors[child.id]?.[medicine.id] && (
                            <div className="mb-3 rounded-md bg-red-50 p-3">
                              <p className="text-sm text-red-600">{childrenMedicineValidationErrors[child.id][medicine.id]}</p>
                            </div>
                          )}
                        </div>
                      ))}

                    {/* Show message when no medicines added */}
                    {(!child.medicines || child.medicines.length === 0) && (
                      <div className="mt-5 text-center text-gray-500">
                        <p className="text-sm">
                          No medicines added for Child {index + 1} yet. Click "Add Medicine for Child {index + 1}" to get started.
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {/* NEW: New Child Form - Only shows when showNewChildForm is true - Mobile-responsive */}
                {showNewChildForm && (
                  <div className="mt-5 space-y-4 rounded-lg border border-dashed bg-blue-50 p-4">
                    <h3 className="text-sm font-medium text-gray-700">Add New Child</h3>
                    {/* New child basic info - Mobile-responsive grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                      <Input
                        label="Salutation"
                        placeholder="Mr./Mrs./Ms./Dr."
                        labelOnTop
                        value={newChild.salutation}
                        onChange={(event) => handleInputChange("salutation", event.target.value)}
                        isRequired
                        error={errors.salutation}
                      />
                      <Input
                        label="First Name"
                        placeholder="First Name"
                        labelOnTop
                        value={newChild.name}
                        isRequired
                        error={errors.name}
                        onChange={(event) => handleInputChange("name", event.target.value)}
                      />
                      <Input
                        label="Middle Name"
                        placeholder="Middle Name"
                        labelOnTop
                        value={newChild.middleName}
                        onChange={(event) => handleInputChange("middleName", event.target.value)}
                      />
                      <Input
                        label="Last Name"
                        placeholder="Last Name"
                        labelOnTop
                        value={newChild.lastName}
                        isRequired
                        error={errors.lastName}
                        onChange={(event) => handleInputChange("lastName", event.target.value)}
                      />
                      <Dropdown
                        isSearchable
                        options={countriesCodeData?.countries.map((country) => ({
                          label: `+${country.callingCodes[0]} ${country.name}`,
                          value: `+${country.callingCodes[0]} ${country.name}`,
                        }))}
                        placeholder="Country Code"
                        title="Country Code"
                        value={newChild.countryCode}
                        onChange={(event) => handleInputChange("countryCode", event)}
                        isRequired
                        withError={errors.countryCode}
                      />
                      <Input
                        type="tel"
                        label="Contact Number"
                        placeholder="Contact Number"
                        value={newChild.contactNumber}
                        onChange={(event) => handleInputChange("contactNumber", event.target.value)}
                        isRequired
                        error={errors.contactNumber}
                      />
                    </div>

                    {/* New Child Gender - Mobile-responsive */}
                    <div>
                      {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
                      <div>
                        <RadioInput
                          name="NewChild"
                          options={[
                            { id: "Male_NewChild", value: "Male", label: "Male" },
                            { id: "Female_NewChild", value: "Female", label: "Female" },
                            { id: "Other_NewChild", value: "Other", label: "Other" },
                            { id: "N/A_NewChild", value: "N/A", label: "N/A" },
                          ]}
                          value={newChild.gender}
                          onChange={(value) => handleInputChange("gender", value)}
                          Classes="flex flex-wrap gap-2 sm:gap-4"
                          checked={newChild?.gender}
                        />
                      </div>
                    </div>

                    {/* New Child Profile Image */}
                    <div>
                      <ChooseFile
                        label="New Child Profile Image"
                        onClickCross={() => handleRemoveChildProfileImage(null, true)}
                        placeholder
                        selectedFile={newChild.profileImage}
                        loading={childrenProfileLoading.newChild || false}
                        dir
                        onChange={(event) => handleChildProfileImage(event, null, true)}
                        uni="NewChild"
                      />
                      {childrenProfileErrors.newChild && <span className="mt-2 block text-xs text-red-500">{childrenProfileErrors.newChild}</span>}
                    </div>

                    <Input
                      label="Wedding Hall Seat"
                      placeholder="Wedding Hall Seat"
                      value={newChild.weddingHallSeat}
                      onChange={(e) => handleInputChange("weddingHallSeat", e.target.value)}
                    />

                    {/* NEW: New Child Preferences Section */}
                    <div className="mt-4">
                      <div className="mb-3">
                        <div className="label text-secondary">New Child Preferences</div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-5">
                        <Dropdown
                          isSearchable
                          options={filterByType("primary")}
                          title={t("contacts.primaryMealPreference")}
                          placeholder="Select Primary Meal"
                          value={newChild.meal_preference?.[0] || ""}
                          onChange={(value) => handleNewChildMealChange(value, 0)}
                          isMulti
                        />

                        <Dropdown
                          isSearchable
                          options={filterByType("secondary")}
                          title={t("contacts.secondaryMealPreference")}
                          placeholder="Select Secondary Meal"
                          value={newChild.meal_preference?.[1] || ""}
                          onChange={(value) => handleNewChildMealChange(value, 1)}
                          isMulti
                        />

                        <Dropdown
                          isSearchable
                          options={filterByType("alcoholic")}
                          title={t("contacts.alcoholPreference")}
                          placeholder="Select Alcohol Preference"
                          value={newChild.meal_preference?.[2] || ""}
                          onChange={(value) => handleNewChildMealChange(value, 2)}
                          isMulti
                        />
                      </div>
                    </div>

                    {/* Auto-add indicator */}
                    {isChildFormComplete() && (
                      <div className="rounded bg-green-100 p-2 text-sm text-green-600">
                        ✓ Child will be added automatically when you finish filling the form
                      </div>
                    )}
                    {/* New Child Medicine Section */}
                    <div className="mt-6">
                      <div className="mt-5 grid grid-cols-12 gap-2">
                        <div className="col-span-8">
                          <button type="button" className="rounded-lg bg-secondary px-4 py-2 text-white" onClick={handleAddNewChildMedicine}>
                            Add Medicine for New Child
                          </button>
                        </div>
                      </div>

                      {/* Only show medicine fields if there are medicines */}
                      {newChild.medicines &&
                        newChild.medicines.length > 0 &&
                        newChild.medicines.map((medicine, index) => (
                          <div key={medicine.id} className="mb-4 mt-5">
                            <div className="mb-3 flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-700">New Child Medicine {index + 1}</h4>
                              <button type="button" className="mt-4" onClick={() => handleRemoveNewChildMedicine(medicine.id)}>
                                <TrashIcon className="h-5 w-5 cursor-pointer text-red-500" />
                              </button>
                            </div>

                            <div className="grid grid-cols-4 gap-7 md:grid-cols-2 lg:grid-cols-4">
                              <Input
                                type="text"
                                label="Medicine Name *"
                                placeholder="Enter medicine name"
                                value={medicine.name}
                                onChange={(e) => handleNewChildMedicineChange(medicine.id, "name", e.target.value)}
                              />

                              <Input
                                type="text"
                                label="Problem/Ailment *"
                                placeholder="Enter problem or ailment"
                                value={medicine.ailment}
                                onChange={(e) => handleNewChildMedicineChange(medicine.id, "ailment", e.target.value)}
                              />

                              <Input
                                type="text"
                                label="Medicine Type"
                                placeholder="e.g., Tablet, Capsule, Syrup"
                                value={medicine.type}
                                onChange={(e) => handleNewChildMedicineChange(medicine.id, "type", e.target.value)}
                              />

                              <Input
                                type="text"
                                label="Medication Type"
                                placeholder="e.g., Once daily, Twice daily"
                                value={medicine.usage}
                                onChange={(e) => handleNewChildMedicineChange(medicine.id, "usage", e.target.value)}
                              />
                            </div>

                            <div className="mt-4">
                              <Input
                                textarea
                                label="Special Instructions"
                                placeholder="Enter special instructions"
                                value={medicine.special_instructions}
                                onChange={(e) => handleNewChildMedicineChange(medicine.id, "special_instructions", e.target.value)}
                                rows={3}
                              />
                            </div>
                            {/* Show validation error if any */}
                            {newChildMedicineValidationErrors[medicine.id] && (
                              <div className="mb-3 rounded-md bg-red-50 p-3">
                                <p className="text-sm text-red-600">{newChildMedicineValidationErrors[medicine.id]}</p>
                              </div>
                            )}
                          </div>
                        ))}

                      {/* Show message when no medicines added */}
                      {(!newChild.medicines || newChild.medicines.length === 0) && (
                        <div className="mt-5 text-center text-gray-500">
                          <p className="text-sm">No medicines added for new child yet. Click "Add Medicine for New Child" to get started.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Contact Numbers - Mobile-responsive */}
            <div className="pt-5">
              <div className="label mb-4">Contact Numbers</div>
              {contacts.map((contact, index) => (
                <div key={contact.id} className="mt-5 space-y-4 sm:grid sm:grid-cols-12 sm:gap-2 sm:space-y-0">
                  <div className="sm:col-span-3">
                    <Dropdown
                      title={`Contact Number ${index + 1}`}
                      placeholder="Select Type"
                      value={contact.contactType}
                      onChange={(value) => handleInputChangePhone(contact.id, "contactType", value)}
                      isRequired={isSubmitted && contact.contactType === ""}
                      withError={isSubmitted && contact.contactType === "" ? "Required" : false}
                      options={[
                        { label: "Home", value: "Home" },
                        { label: "Mobile", value: "Mobile" },
                        { label: "Land line", value: "Land line" },
                        { label: "Work", value: "Work" },
                        { label: "Fax", value: "Fax" },
                        { label: "Other", value: "Other" },
                      ]}
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <Dropdown
                      isSearchable
                      options={countriesCodeData?.countries.map((country) => ({
                        label: `+${country.callingCodes[0]} ${country.name}`,
                        value: `+${country.callingCodes[0]} ${country.name}`,
                      }))}
                      placeholder="Country Code"
                      title="Country Code"
                      value={contact.countryCode}
                      onChange={(value) => handleInputChangePhone(contact.id, "countryCode", value)}
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <Input
                      type="tel"
                      label="Contact Number"
                      placeholder="Contact Number"
                      value={contact.contactNumber}
                      onChange={(e) => handleInputChangePhone(contact.id, "contactNumber", e.target.value)}
                      isRequired={isSubmitted && contact.contactNumber === ""}
                      error={isSubmitted && contact.contactNumber === "" ? "Required" : ""}
                    />
                  </div>
                  <div className="flex justify-end sm:col-span-1 sm:mt-6">
                    {index > 0 && (
                      <button type="button" onClick={() => handleRemoveContact(contact.id)}>
                        <TrashIcon className="h-5 w-5 cursor-pointer text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="mt-5">
                <button type="button" className="rounded-lg bg-secondary px-4 py-2 text-white" onClick={handleAddContactField}>
                  Add Another Contact
                </button>
              </div>
            </div>

            {/* Email Section - Mobile-responsive */}
            <div className="pt-5">
              {emails?.map((emailItem, index) => (
                <div key={emailItem.id} className="mt-5 space-y-4 sm:grid sm:grid-cols-12 sm:gap-3 sm:space-y-0">
                  <div className="sm:col-span-3">
                    <Dropdown
                      title={`Email ${index + 1}`}
                      placeholder="Select Type"
                      value={emailItem.emailType}
                      onChange={(value) => handleInputChangeEmail(emailItem.id, "emailType", value)}
                      options={[
                        { label: "Main", value: "Main" },
                        { label: "Personal", value: "Personal" },
                        { label: "Work", value: "Work" },
                        { label: "Other", value: "Other" },
                      ]}
                    />
                  </div>

                  <div className="sm:col-span-8">
                    <Input
                      placeholder="Email Address"
                      labelOnTop
                      value={emailItem.emailAddress}
                      onChange={(e) => handleInputChangeEmail(emailItem.id, "emailAddress", e.target.value)}
                      label="Email Address"
                      isRequired
                      type="email"
                    />
                  </div>
                  <div className="flex justify-end sm:col-span-1 sm:mt-6">
                    {index > 0 && (
                      <button type="button" onClick={() => handleRemoveEmail(emailItem.id)}>
                        <TrashIcon className="h-5 w-5 cursor-pointer text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="mt-4">
                <button type="button" className="rounded-lg bg-secondary px-4 py-2 text-white" onClick={handleAddEmailField}>
                  Add Another Email
                </button>
              </div>
            </div>

            {/* Address Section - Mobile-responsive */}
            <div className="mb-5 mt-5 ltr:text-left rtl:text-right">
              <div>
                <div className="label mb-2 text-secondary">{t("contacts.residenceAddress")}</div>
              </div>
            </div>
            <Input
              label={t("contacts.address")}
              placeholder="Address"
              textarea
              value={address}
              rows={2}
              onChange={(e) => setAddress(e.target.value)}
            />

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
              <Input label={t("contacts.city")} placeholder="City" labelOnTop value={city} onChange={(e) => setCity(e.target.value)} />
              <Input label={t("contacts.state")} placeholder="State" labelOnTop value={state} onChange={(e) => setState(e.target.value)} />
              <Input type="number" label={t("contacts.pin")} placeholder="PIN" labelOnTop value={pin} onChange={(e) => setPin(e.target.value)} />
              <Dropdown
                isSearchable
                options={countriesData.countries.map((country) => ({ label: country.name, Value: country.name }))}
                title={t("contacts.country")}
                placeholder="Select Country"
                value={country}
                onChange={(value) => setCountry(value)}
              />
            </div>

            {/* Work Address Section - Mobile-responsive */}
            <div className="mb-5 mt-5 ltr:text-left rtl:text-right">
              <div>
                <div className="label mb-2 text-secondary">{t("contacts.workAddress")}</div>
              </div>
            </div>

            <div className="mb-5 mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
              <Input
                label={t("contacts.companyName")}
                placeholder="Company Name"
                labelOnTop
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
              <Input label={t("contacts.city")} placeholder="City" labelOnTop value={workCity} onChange={(e) => setWorkCity(e.target.value)} />
              <Input label={t("contacts.state")} placeholder="State" labelOnTop value={workState} onChange={(e) => setWorkState(e.target.value)} />
              <Input
                type="number"
                label={t("contacts.pin")}
                placeholder="PIN"
                labelOnTop
                value={workPin}
                onChange={(e) => setWorkPin(e.target.value)}
              />
              <Dropdown
                isSearchable
                options={countriesData.countries.map((country) => ({ label: country.name, Value: country.name }))}
                title={t("contacts.country")}
                placeholder="Select Country"
                value={workCountry}
                onChange={(value) => setWorkCountry(value)}
              />
            </div>

            <Input
              label={t("contacts.address")}
              placeholder="Address"
              textarea
              value={workAddress}
              rows={2}
              onChange={(e) => setWorkAddress(e.target.value)}
            />

            {/* Preferences Section - Mobile-responsive */}
            <div className="mb-5 mt-5 ltr:text-left rtl:text-right">
              <div>
                <div className="label mb-2 text-secondary">{t("contacts.preferences")}</div>
              </div>
            </div>

            <div className="my-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-5">
              <Dropdown
                isSearchable
                options={filterByType("primary")}
                title={t("contacts.primaryMealPreference")}
                placeholder="Select Primary Meal"
                value={selectedMealIds[0] || ""}
                onChange={(value) => handleMealChange(value, 0)}
                isMulti
              />
              <Dropdown
                isSearchable
                options={filterByType("secondary")}
                title={t("contacts.secondaryMealPreference")}
                placeholder="Select Secondary Meal"
                value={selectedMealIds[1] || ""}
                onChange={(value) => handleMealChange(value, 1)}
                isMulti
              />
              <Dropdown
                isSearchable
                options={filterByType("alcoholic")}
                title={t("contacts.alcoholPreference")}
                placeholder="Select Alcohol Preference"
                value={selectedMealIds[2] || ""}
                onChange={(value) => handleMealChange(value, 2)}
                isMulti
              />
            </div>

            {/* Other Info Section - Mobile-responsive */}
            <div className="mb-5 mt-5 ltr:text-left rtl:text-right">
              <div>
                <div className="label mb-2 text-secondary">{t("headings.otherInfo")}</div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <div className="label ltr:text-left rtl:text-right">{t("contacts.specialNeeds")}</div>
              <div className="flex items-center gap-2">
                <input type="checkbox" value={specialNeed} onChange={(e) => setSpecialNeed(e.target.checked)} checked={specialNeed} />
                <div className="label ltr:text-left rtl:text-right">{t("contacts.wheelChair")}</div>
              </div>
            </div>

            {/* NEW: Identity Files Section */}
            <div className="my-5">
              <div>
                <ChooseFile
                  uni="Identify"
                  label={t("contacts.IdentityProofFile")}
                  onClickCross={handleCrossClick}
                  placeholder
                  multi
                  selectedFile={identityFile}
                  loading={fileLoading}
                  onChange={handleFileChangeIdentify}
                />
              </div>
            </div>

            <Input label={t("headings.notes")} placeholder="Note" textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />

            {message.text && <span className="text-xs font-medium text-red-500">{message.text}</span>}

            {/* Action Buttons - Mobile-responsive */}
            <div className="my-10 flex flex-col gap-4 sm:my-20 sm:flex-row sm:justify-end sm:space-x-5">
              <Button
                icon={updateLoading ? "" : <CheckIcon />}
                title={updateLoading ? <Spinner /> : t("contacts.saveContact")}
                onClick={updateContact}
                disabled={updateLoading}
                className="w-full sm:w-auto"
              />
              <Button
                icon={<XMarkIcon />}
                title="Cancel"
                buttonColor="bg-red-500"
                onClick={() => navigate("/get-contact-details")}
                className="w-full sm:w-auto"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Modals */}
      <AddGroupModal
        isOpen={openGroupModal}
        setIsOpen={setOpenGroupModal}
        handleSubmit={addNewGroup}
        value={newGroupName}
        handleChange={(e) => setNewGroupName(e.target.value)}
        message={errorMessageServer}
        setErrorMessageServer={setErrorMessageServer}
        setNewGroupName={setNewGroupName}
      />

      <AddFamilyModal
        isOpen={openFamilyModal}
        setIsOpen={setOpenFamilyModal}
        handleSubmit={addNewFamily}
        value={newFamilyName}
        handleChange={(e) => setNewFamilyName(e.target.value)}
        message={errorMessageServer}
        setErrorMessageServer={setErrorMessageServer}
        setNewFamilyName={setNewFamilyName}
      />

      <AddColorModal
        isOpen={openColorCodeModal}
        setIsOpen={setOpenColorCodeModal}
        handleSubmit={addNewColorCode}
        value={newColorCodeName}
        handleChange={(e) => setNewColorCodeName(e.target.value)}
        message={errorMessageServer}
        setErrorMessageServer={setErrorMessageServer}
        setNewGroupName={setNewColorCodeName}
        title="Add New Color Code"
      />

      {/* NEW: Delete Confirmation Modals */}
      <ConfirmationModal
        message="Are you sure you want to delete this Group?"
        isOpen={openDeleteModal.open}
        setIsOpen={(open) => setOpenDeleteModal((prev) => ({ ...prev, open }))}
        handleSubmit={deleteGroup}
      />

      <ConfirmationModal
        message="Are you sure you want to delete this Family?"
        isOpen={openDeleteModalFamily.open}
        setIsOpen={(open) => setOpenDeleteModalFamily((prev) => ({ ...prev, open }))}
        handleSubmit={deleteFamily}
      />

      <ConfirmationModal
        message="Are you sure you want to delete this Color Code?"
        isOpen={openDeleteModalColorCode.open}
        setIsOpen={(open) => setOpenDeleteModalColorCode((prev) => ({ ...prev, open }))}
        handleSubmit={deleteColorCode}
      />
    </div>
  );
};

export default ContactDetailView;
