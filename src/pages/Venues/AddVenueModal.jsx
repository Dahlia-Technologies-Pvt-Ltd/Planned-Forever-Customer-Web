import ApiServices from "../../api/services";
import Input from "../../components/common/Input";
import TimezoneSelect from "react-timezone-select";
import Button from "../../components/common/Button";
import { Dialog, Transition } from "@headlessui/react";
import Dropdown from "../../components/common/Dropdown";
import countriesData from "../../utilities/country.json";
import { useThemeContext } from "../../context/GlobalContext";
import countriesCodeData from "../../utilities/countryCode.json";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import {
  InformationCircleIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { VENUE_PRINT, VENUES } from "../../routes/Names";
import MapPicker from "../../components/MapPickervenue";
import { Link, useNavigate } from "react-router-dom";
import React, { Fragment, useState, useEffect, useCallback, useRef } from "react";
import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import { useTranslation } from "react-i18next";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 31.5204,
  lng: 74.3587,
};

const normalizeCountryCode = (countryCode) =>
  String(countryCode || "").match(/\+\d{1,4}/)?.[0] || "+91";

const AddVenueModal = ({ isOpen, setIsOpen, refreshData, data, setModalData, rData, setRecommendedData }) => {
  // translation
  const { t } = useTranslation("common");
  // Context
  const { eventSelect, openSuccessModal, closeSuccessModel, setErrorMessage } = useThemeContext();

  const navigate = useNavigate();

  // useStates
  const [pin, setPin] = useState("");
  const [city, setCity] = useState("");
  const [Address2, setAddress2] = useState("");
  const [address1, setAddress1] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState(null);
  const [timeZone, setTimeZone] = useState("");
  const [countryError, setCountryError] = useState("");
  const [pinError, setPinError] = useState("");
  const [timeZoneError, setTimeZoneError] = useState("");
  const [venueNote, setVenueNote] = useState("");
  const [cityError, setCityError] = useState("");
  const [address1Error, setAddress1Error] = useState("");
  const [Address2Error, setAddress2Error] = useState("");
  const [venueName, setVenueName] = useState("");
  const [stateError, setStateError] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const [venueAddress, setVenueAddress] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [venueNoteError, setVenueNoteError] = useState("");
  const [venueNameError, setVenueNameError] = useState("");
  const [venueAddressError, setVenueAddressError] = useState("");
  const [contactPersonError, setContactPersonError] = useState("");
  const [email, setEmail] = useState({ emailType: "", email: "" });
  const [contactNumberError, setContactNumberError] = useState("");
  const [emailAddress, setEmailAddress] = useState({ emailType: "", email: "" });
  const [items, setItems] = useState([{ hallName: "", floor: "" }]);
  const [errors, setErrors] = useState([{ hallName: "", floor: "" }]);
  const [contact, setContact] = useState({ contactType: "", countryCode: "", number: "" });
  const [contactNumber, setContactNumber] = useState({ contactType: "", countryCode: "", number: "" });
  const [contactNumber2, setContactNumber2] = useState({ contactType: "", countryCode: "", number: "" });
  const [location, setLocation] = useState({ address: null, lat: null, lng: null });
  const [emailError, setEmailError] = useState("");
  const [contacts, setContacts] = useState([
    {
      contactPerson: "",
      countryCode: {
        label: "+91",
        value: "+91",
      },
      phone: "",
      email: "",
    },
  ]);
  const [contactErrors, setContactErrors] = useState([
    { contactPerson: "", countryCode: "", phone: "", email: "" },
  ]);

  const addContact = () => {
    setContacts([
      ...contacts,
      {
        contactPerson: "",
        countryCode: {
          label: "+91",
          value: "+91",
        },
        phone: "",
        email: "",
      },
    ]);
    setContactErrors([
      ...contactErrors,
      { contactPerson: "", countryCode: "", phone: "", email: "" },
    ]);
  };

  const removeContact = (index) => {
    setContacts(contacts.filter((_, i) => i !== index));
    setContactErrors(contactErrors.filter((_, i) => i !== index));
  };

  const handleContactChange = (index, field, value) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);

    const updatedErrors = [...contactErrors];
    updatedErrors[index] = { ...updatedErrors[index], [field]: "" };
    setContactErrors(updatedErrors);
  };

  const buildContactRows = (venueData) => {
    if (Array.isArray(venueData?.contacts) && venueData.contacts.length) {
      return venueData.contacts.map((currentContact) => ({
        contactPerson: currentContact.contact_person_name || currentContact.name || "",
        countryCode: {
          label: normalizeCountryCode(currentContact.country_code),
          value: normalizeCountryCode(currentContact.country_code),
        },
        phone: currentContact.contact_number || currentContact.mobile || currentContact.land_line_number || "",
        email: currentContact.email || "",
      }));
    }

    const contactNumbers = venueData?.contact_numbers || [];
    const emails = venueData?.emails || [];
    const rowCount = Math.max(contactNumbers.length, emails.length, 1);

    return Array.from({ length: rowCount }, (_, index) => ({
      contactPerson: index === 0 ? venueData?.contact_person_name || "" : "",
      countryCode: {
        label: normalizeCountryCode(contactNumbers[index]?.country_code),
        value: normalizeCountryCode(contactNumbers[index]?.country_code),
      },
      phone: contactNumbers[index]?.mobile || contactNumbers[index]?.land_line_number || "",
      email: emails[index]?.personal || emails[index]?.work || "",
    }));
  };

  // field add function
  const handleInputChange = (e, index, field) => {
    const updatedItems = items.map((item, idx) => {
      if (idx === index) {
        return { ...item, [field]: e.target.value };
      }
      return item;
    });
    setItems(updatedItems);

    const updatedErrors = errors.map((error, idx) => {
      if (idx === index) {
        return { ...error, [field]: "" };
      }
      return error;
    });
    setErrors(updatedErrors);
  };

  const addNewFieldSet = (e) => {
    e.preventDefault();
    let isValid = true;

    const newErrors = items.map((currentItem) => {
      let itemError = { hallName: "", floor: "" };

      if (!currentItem.hallName) {
        itemError.hallName = "Required";
        isValid = false;
      }

      // if (!currentItem.capacity) {
      //   itemError.capacity = "Required";
      //   isValid = false;
      // }

      return itemError;
    });

    setErrors(newErrors);

    if (isValid) {
      setItems([...items, { hallName: "", floor: "" }]);
      setErrors([...errors, { hallName: "", floor: "" }]);
    }
  };

  // Delete API
  const handleDeleteItem = (index) => {
    const updatedItems = items.filter((_, idx) => idx !== index);
    const updatedErrors = errors.filter((_, idx) => idx !== index);
    setItems(updatedItems);
    setErrors(updatedErrors);
  };

  // validation function
  const isValidForm = () => {
    let isValidData = true;

    const requiredError = " Required";
    const trimmedVenueName = venueName?.trim();
    const trimmedAddress = location?.address?.trim();

    setVenueNameError(trimmedVenueName ? "" : requiredError);
    setVenueAddressError(trimmedAddress ? "" : requiredError);
    setCountryError("");
    setStateError(state?.trim() ? "" : requiredError);
    setCityError(city?.trim() ? "" : requiredError);
    setPinError("");
    setTimeZoneError("");

    if (
      !trimmedVenueName ||
      !trimmedAddress ||
      !state?.trim() ||
      !city?.trim()
    ) {
      isValidData = false;
    }

    const nextContactErrors = contacts.map((currentContact) => {
      const currentErrors = {
        contactPerson: "",
        countryCode: "",
        phone: "",
        email: "",
      };

      if (
        currentContact.email?.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentContact.email.trim())
      ) {
        currentErrors.email = " Invalid email";
        isValidData = false;
      }

      return currentErrors;
    });

    setContactErrors(nextContactErrors);
    setErrors(items.map(() => ({ hallName: "", floor: "" })));

    return isValidData;
  };

  // submit API
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidForm() || btnLoading) return;

    const populatedContacts = contacts.filter(
      (currentContact) =>
        currentContact.contactPerson?.trim() ||
        currentContact.phone?.trim() ||
        currentContact.email?.trim()
    );
    const contactNumbers = populatedContacts
      .filter((currentContact) => currentContact.phone?.trim())
      .map((currentContact) => ({
        contact_person_name: currentContact.contactPerson?.trim() || "",
        mobile: currentContact.phone.trim(),
        country_code: currentContact.countryCode?.value || "",
      }));
    const emailsArray = populatedContacts
      .filter((currentContact) => currentContact.email?.trim())
      .map((currentContact) => ({
        contact_person_name: currentContact.contactPerson?.trim() || "",
        personal: currentContact.email.trim(),
      }));
    const venueDetails = items
      .filter((item) => item.hallName?.trim() || item.floor?.trim())
      .map((item) => ({
        name: item.hallName?.trim() || "",
        location: item.floor?.trim() || "",
      }));

    const fullAddress = [location.address.trim(), Address2?.trim()]
      .filter(Boolean)
      .filter((addressPart, index, addressParts) => addressParts.indexOf(addressPart) === index)
      .join(", ");
    const payload = {
      name: (rData === null ? venueName : rData?.name || venueName).trim(),
      address: fullAddress,
      city: city.trim(),
      state: state.trim(),
      pin: String(pin || "").trim(),
      time_zone: timeZone?.value || null,
      contact_person_name: populatedContacts[0]?.contactPerson?.trim() || "",
      contact_numbers: contactNumbers,
      emails: emailsArray,
      description: venueNote?.trim() || "",
      country: country?.value || country?.Value || null,
      longitude: location?.lng,
      latitude: location?.lat,
      venue_details: venueDetails,
      event_id: eventSelect,
      recommended_trending_id: rData?.id || null,
      recommended_trending_type: rData ? "recommended" : data?.recommended_trending_type || "recommended",
    };

    try {
      setBtnLoading(true);
      console.log("Venue request payload:", payload);

      const response =
        data === null
          ? await ApiServices.venues.addVenue(payload)
          : await ApiServices.venues.updateVenue(data.id, payload);

      if (response?.data?.code === 200 || response?.status === 200 || response?.status === 201) {
        closeModal();
        if (rData !== null) navigate(VENUES);
        refreshData();
        openSuccessModal({
          title: t("message.success"),
          message: t("venues.venueAddedSuccess"),
          onClickDone: () => closeSuccessModel(),
        });
      } else {
        setErrorMessage(response?.data?.message || "Unable to save venue");
      }
    } catch (err) {
      console.error("Venue save failed:", err?.response?.data || err);
      setErrorMessage(err?.response?.data?.message || "Unable to save venue");
    } finally {
      setBtnLoading(false);
    }
  };

  // Clear All Data
  const clearAllData = () => {
    setPin("");
    setVenueName("");
    setLocation({ address: "", lat: "", lng: "" });
    setAddress1("");
    setAddress2("");
    setCity("");
    setState("");
    setPin("");
    setTimeZone({});
    setContactPerson("");
    setVenueNote("");
    setCountry(null);
    setItems([{ hallName: "", floor: "" }]);
    setContactNumber({ contactType: "", countryCode: "", number: "" });
    setContactNumber2({ contactType: "", countryCode: "", number: "" });
    setContact({ contactType: "", countryCode: "", number: "" });
    setEmail({ emailType: "", email: "" });
    setEmailAddress({ emailType: "", email: "" });
    setContacts([
      {
        contactPerson: "",
        countryCode: { label: "+91", value: "+91" },
        phone: "",
        email: "",
      },
    ]);
    setContactErrors([
      { contactPerson: "", countryCode: "", phone: "", email: "" },
    ]);
    setVenueNameError("");
    setVenueAddressError("");
    setErrors([{ hallName: "", floor: "" }]);
    setContactNumberError("");
    setContactPersonError("");
    setStateError("");
    setCityError("");
    setEmailError("");
    setCountryError("");
    setPinError("");
    setTimeZoneError("");
    setAddress1Error("");
    setAddress2Error("");
  };

  // Close Modal
  const closeModal = () => {
    setIsOpen(false);
    clearAllData();
    setModalData(null);
    setBtnLoading(false);
  };

  console.log({ data });

  // Use Effects
  useEffect(() => {
    if (data !== null) {
      setVenueName(data?.name);
      // setVenueAddress(data?.address);
      setLocation({ address: data?.address, lat: data?.latitude, lng: data?.longitude });
      setAddress1(data?.address_line_1 || data?.address || "");
      setAddress2(data?.address_line_2 || "");
      setCity(data?.city);
      setState(data?.state);
      setPin(data?.pin);
      setTimeZone({ value: data?.time_zone });
      setContactPerson(data?.contact_person_name);
      setVenueNote(data?.description);
      setCountry(data?.country ? { value: data?.country, label: data?.country } : null);

      const contactNumbers = data?.contact_numbers || [];
      const items = data?.venue_details || [];
      const currentItem = items.map((item) => ({
        hallName: item.name,
        // capacity: item.capacity,
        floor: item.location,
      }));
      setItems(currentItem.length ? currentItem : [{ hallName: "", floor: "" }]);
      setErrors((currentItem.length ? currentItem : [{}]).map(() => ({ hallName: "", floor: "" })));

      let contact1 = { contactType: "", countryCode: "", number: "" };
      let contact2 = { contactType: "", countryCode: "", number: "" };
      let contact3 = { contactType: "", countryCode: "", number: "" };

      const getContactType = (contact) => {
        return contact?.mobile ? "Mobile" : "Landline";
      };

      const getContactNumber = (contact) => {
        return contact?.mobile || contact?.land_line_number;
      };

      if (contactNumbers?.length > 0) {
        contact1 = {
          contactType: { label: getContactType(contactNumbers[0]), value: getContactType(contactNumbers[0]) },
          number: getContactNumber(contactNumbers[0]),
          countryCode: {
            label: normalizeCountryCode(contactNumbers[0]?.country_code),
            value: normalizeCountryCode(contactNumbers[0]?.country_code),
          },
        };
      }

      if (contactNumbers?.length > 1) {
        contact2 = {
          contactType: { label: getContactType(contactNumbers[1]), value: getContactType(contactNumbers[1]) },
          number: getContactNumber(contactNumbers[1]),
          countryCode: {
            label: normalizeCountryCode(contactNumbers[1]?.country_code),
            value: normalizeCountryCode(contactNumbers[1]?.country_code),
          },
        };
      }
      if (contactNumbers?.length > 2) {
        contact3 = {
          contactType: { label: getContactType(contactNumbers[2]), value: getContactType(contactNumbers[2]) },
          number: getContactNumber(contactNumbers[2]),
          countryCode: {
            label: normalizeCountryCode(contactNumbers[2]?.country_code),
            value: normalizeCountryCode(contactNumbers[2]?.country_code),
          },
        };
      }

      setContactNumber(contact1);
      setContactNumber2(contact2);
      setContact(contact3);

      // For emails
      const emails = data?.emails || [];

      let email1 = { emailType: "", email: "" };
      let email2 = { emailType: "", email: "" };

      if (emails?.length > 0) {
        const firstEmailType = emails[0]?.work ? "Work" : "Personal";
        email1 = { emailType: { label: firstEmailType, value: firstEmailType }, email: emails[0][firstEmailType?.toLowerCase()] };
      }
      if (emails.length > 1) {
        const secondEmailType = emails[1]?.work ? "Work" : "Personal";
        email2 = { emailType: { label: secondEmailType, value: secondEmailType }, email: emails[1][secondEmailType?.toLowerCase()] };
      }

      // Update state
      setEmail(email1);
      setEmailAddress(email2);
      const contactRows = buildContactRows(data);
      setContacts(contactRows);
      setContactErrors(contactRows.map(() => ({ contactPerson: "", countryCode: "", phone: "", email: "" })));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && rData !== null) {
      const recommendedAddress =
        typeof rData?.address === "string"
          ? rData.address
          : rData?.address?.formatted_address ||
            rData?.address?.full_address ||
            rData?.address?.address_line_1 ||
            "";
      const recommendedAddress1 =
        rData?.address_line_1 ||
        rData?.addressLine1 ||
        rData?.address_1 ||
        rData?.address1 ||
        rData?.venue_address ||
        rData?.location?.address_line_1 ||
        rData?.location?.address ||
        rData?.formatted_address ||
        rData?.full_address ||
        recommendedAddress ||
        "";
      const recommendedAddress2 =
        rData?.address_line_2 ||
        rData?.addressLine2 ||
        rData?.address_2 ||
        rData?.address2 ||
        rData?.location?.address_line_2 ||
        rData?.address?.address_line_2 ||
        "";

      setVenueName(rData?.name);
      setLocation({
        address: recommendedAddress1,
        lat: rData?.latitude,
        lng: rData?.longitude,
      });
      setAddress1(recommendedAddress1);
      setAddress2(recommendedAddress2);
      setCity(rData?.city);
      setState(rData?.state);
      setPin(rData?.pin);
      setTimeZone({ value: rData?.time_zone });
      setContactPerson(rData?.contact_person_name);
      setVenueNote(rData?.description);
      setCountry(rData?.country ? { value: rData?.country, label: rData?.country } : null);

      const contactNumbers = rData?.contact_numbers || [];
      const items = rData?.venue_details || [];
      const currentItem = items.map((item) => ({
        hallName: item.name,
        // capacity: item.capacity,
        floor: item.location,
      }));
      setItems(currentItem.length ? currentItem : [{ hallName: "", floor: "" }]);
      setErrors((currentItem.length ? currentItem : [{}]).map(() => ({ hallName: "", floor: "" })));

      let contact1 = { contactType: "", countryCode: "", number: "" };
      let contact2 = { contactType: "", countryCode: "", number: "" };
      let contact3 = { contactType: "", countryCode: "", number: "" };

      const getContactType = (contact) => {
        return contact?.mobile ? "Mobile" : "Landline";
      };

      const getContactNumber = (contact) => {
        return contact?.mobile || contact?.land_line_number;
      };

      if (contactNumbers?.length > 0) {
        contact1 = {
          contactType: { label: getContactType(contactNumbers[0]), value: getContactType(contactNumbers[0]) },
          number: getContactNumber(contactNumbers[0]),
          countryCode: {
            label: normalizeCountryCode(contactNumbers[0]?.country_code),
            value: normalizeCountryCode(contactNumbers[0]?.country_code),
          },
        };
      }

      if (contactNumbers?.length > 1) {
        contact2 = {
          contactType: { label: getContactType(contactNumbers[1]), value: getContactType(contactNumbers[1]) },
          number: getContactNumber(contactNumbers[1]),
          countryCode: {
            label: normalizeCountryCode(contactNumbers[1]?.country_code),
            value: normalizeCountryCode(contactNumbers[1]?.country_code),
          },
        };
      }
      if (contactNumbers?.length > 2) {
        contact3 = {
          contactType: { label: getContactType(contactNumbers[2]), value: getContactType(contactNumbers[2]) },
          number: getContactNumber(contactNumbers[2]),
          countryCode: {
            label: normalizeCountryCode(contactNumbers[2]?.country_code),
            value: normalizeCountryCode(contactNumbers[2]?.country_code),
          },
        };
      }

      setContactNumber(contact1);
      setContactNumber2(contact2);
      setContact(contact3);

      // For emails
      const emails = rData?.emails || [];

      let email1 = { emailType: "", email: "" };
      let email2 = { emailType: "", email: "" };

      if (emails?.length > 0) {
        const firstEmailType = emails[0]?.work ? "Work" : "Personal";
        email1 = { emailType: { label: firstEmailType, value: firstEmailType }, email: emails[0][firstEmailType?.toLowerCase()] };
      }
      if (emails.length > 1) {
        const secondEmailType = emails[1]?.work ? "Work" : "Personal";
        email2 = { emailType: { label: secondEmailType, value: secondEmailType }, email: emails[1][secondEmailType?.toLowerCase()] };
      }

      // Update state
      setEmail(email1);
      setEmailAddress(email2);
      const contactRows = buildContactRows(rData);
      setContacts(contactRows);
      setContactErrors(contactRows.map(() => ({ contactPerson: "", countryCode: "", phone: "", email: "" })));
    }
  }, [isOpen, rData]);

  // const handleLocationSelect = (selectedLocation) => {
  //   setLocation(selectedLocation);
  //   if (selectedLocation) {
  //     setVenueAddressError("");
  //   }
  // };
  const handleLocationSelect = (selectedLocation) => {
    console.log(selectedLocation);
    setLocation({
      address: selectedLocation.address,
      displayAddress: selectedLocation.address1 || selectedLocation.address,
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
    });

    setAddress1(selectedLocation.address1 || "");
    setAddress2(selectedLocation.address2 || "");

    setCity(selectedLocation.city || "");
    setState(selectedLocation.state || "");

    setPin(selectedLocation.postalCode || "");

    if (selectedLocation.country) {
      setCountry({
        label: selectedLocation.country,
        value: selectedLocation.country,
        Value: selectedLocation.country,
      });
    }

    if (selectedLocation.timeZone) {
      const selectedTimeZone = selectedLocation.timeZone;
      const isIndiaTimeZone = ["Asia/Calcutta", "Asia/Kolkata"].includes(selectedTimeZone.value);

      setTimeZone(
        isIndiaTimeZone
          ? {
              value: "Asia/Kolkata",
              label: "(GMT+5:30) Chennai, Kolkata, Mumbai, New Delhi",
            }
          : selectedTimeZone
      );
    }

    setVenueAddressError("");
    setCountryError("");
    setStateError("");
    setCityError("");
    setPinError("");
    setTimeZoneError("");
  };

  console.log({ location });

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="overflow-y-auto fixed inset-0">
          <div className="flex justify-center items-center p-4 min-h-full text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-75"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-75"
            >
              <Dialog.Panel
                className={`venue-modal p-6 w-full max-w-4xl bg-white rounded-2xl shadow-xl transition-all`}
              >
                <div className="flex justify-between items-center mb-2">
                  <Dialog.Title as="h3" className="ml-1 text-lg font-semibold leading-7 font-poppins text-secondary-color">
                    {data === null ? t("venues.addVenue") : t("venues.updateVenue")}
                  </Dialog.Title>
                  <XMarkIcon onClick={closeModal} className="w-8 h-8 cursor-pointer text-info-color" />
                </div>

                <form onSubmit={handleSubmit} className="[&_.label]:text-xs [&_.label]:font-medium [&_input]:h-9 [&_input]:min-h-[36px] [&_input]:text-sm [&_input]:py-1 [&_input[type='datetime-local']]:h-9 [&_textarea]:text-sm [&_.css-b62m3t-container]:text-sm [&_.css-13cymwt-control]:h-9 [&_.css-13cymwt-control]:min-h-[36px] [&_.css-13cymwt-control]:py-0 [&_.css-t3ipsp-control]:h-9 [&_.css-t3ipsp-control]:min-h-[36px] [&_.css-t3ipsp-control]:py-0 [&_.css-hlgwow]:h-9 [&_.css-hlgwow]:min-h-[36px] [&_.css-hlgwow]:py-0 [&_.css-hlgwow]:px- [&_.css-1jqq78o-placeholder]:text-sm [&_.css-1jqq78o-placeholder]:leading-none [&_.css-1dimb5e-singleValue]:text-sm [&_.css-1dimb5e-singleValue]:leading-none [&_.css-1wy0on6]:h-9 [&_.css-19bb58m]:my-0">
                  <div className=" h-[600px] overflow-y-auto p-1 md:h-[400px] lg:h-[400px] xl:h-[500px] 2xl:h-[600px]">
                    <div className="mb-5 ltr:text-left rtl:text-right">
                      <div>
                        <div className="mb-2 label text-black">{t("headings.basicInfo")}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <Input
                        isRequired
                        label={t("venues.venueName")}
                        placeholder={t("venues.venueName")}
                        labelOnTop
                        error={venueNameError}
                        value={rData === null ? venueName : rData?.name}
                        onChange={(e) => {
                          setVenueName(e.target.value);
                          setVenueNameError("");
                        }}
                        disabled={rData === null && data?.recommend_trending_venue === "recommended" ? true : false}
                      />

                      {/* <Input
                        isRequired
                        label={t("venues.venueAddress1")}
                        placeholder={t("venues.venueAddress1")}
                        labelOnTop
                        value={address1}
                        error={address1Error}
                        onChange={(e) => {
                          setAddress1(e.target.value);
                          setAddress1Error("");
                        }}
                      /> */}
                      <div className="[&>div>div]:mb-0">
                        <MapPicker
                          label={t("venues.venueAddress1")}
                          placeholder={t("venues.searchVenueLocation")}
                          setLocation={setLocation}
                          location={location}
                          autoResolveAddress={Boolean(rData)}
                          venueAddressError={venueAddressError}
                          onLocationSelect={handleLocationSelect}
                        />
                      </div>
                      <Input
                        
                        label={t("venues.venueAddress2")}
                        placeholder={t("venues.venueAddress2")}
                        labelOnTop
                        value={Address2}
                        error={Address2Error}
                        onChange={(e) => {
                          setAddress2(e.target.value);
                          setAddress2Error("");
                        }}
                      />
                      <Dropdown
                        isSearchable
                        options={countriesData.countries.map((country) => ({ label: country.name, value: country.name, Value: country.name }))}
                        title={t("venues.country")}
                        placeholder={t("venues.country")}
                        value={country}
                        onChange={(value) => {
                          setCountry(value);
                          setCountryError("");
                        }}
                      />
                      <Input
                        isRequired 
                        label={t("venues.state")}
                        placeholder={t("venues.state")}
                        labelOnTop
                        value={state}
                        error={stateError}
                        onChange={(e) => {
                          setState(e.target.value);
                          setStateError("");
                        }}
                      />
                      <Input
                        isRequired
                        label={t("venues.city")}
                        placeholder={t("venues.city")}
                        labelOnTop
                        value={city}
                        error={cityError}
                        onChange={(e) => {
                          setCity(e.target.value);
                          setCityError("");
                        }}
                      />
                      <Input
                        label={t("venues.pin")}
                        placeholder={t("venues.pin")}
                        labelOnTop
                        value={pin}
                        onChange={(e) => {
                          setPin(e.target.value);
                          setPinError("");
                        }}
                        type="number"
                      />

                      <div className="col-span-2 w-full">
                        <div className="mb-3 label ltr:text-left rtl:text-right">
                          <p>
                            {t("venues.timeZone")}
                          </p>
                        </div>
                        <TimezoneSelect
                          value={timeZone}
                          onChange={(e) => {
                            setTimeZone(e);
                            setTimeZoneError("");
                          }}
                          placeholder={t("venues.timeZone")}
                          styles={{
                            placeholder: (defaultStyles) => ({
                              ...defaultStyles,
                              color: "#c3c3c3",
                              fontWeight: "300",
                              fontSize: "15px",
                              textAlign: "left",
                            }),
                            control: (defaultStyles, state) => ({
                              ...defaultStyles,
                              width: "100%",
                              boxShadow: state.isFocused ? "0 0 0 2px black" : defaultStyles.boxShadow,
                              borderRadius: "10px",
                              borderColor: state.isFocused || state.isHovered ? "none" : defaultStyles.border,
                              border: state.isFocused || state.isHovered ? "none" : defaultStyles.border,
                              minHeight: "36px",
                              textAlign: "left",
                            }),
                            menu: (defaultStyles, state) => ({
                              ...defaultStyles,
                              zIndex: "9999999",
                            }),
                            option: (provided, state) => ({
                              ...provided,
                              textAlign: "left",
                            }),
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-12 ">
                      <div className="col-span-8 md:col-span-12 lg:col-span-12 xl:col-span-8">
                        <div className="mt-3">
                          {/* <MapPicker
                            label={t("venues.venueAddress")}
                            setLocation={setLocation}
                            placeholder={t("venues.venueAddress")}
                            onLocationSelect={handleLocationSelect}
                            location={location}
                            venueAddressError={venueAddressError}
                          /> */}
                        </div>
                      </div>
                    </div>

                    <div className="relative mt-12 ltr:text-left rtl:text-right before:absolute before:-top-7 before:left-0 before:right-0 before:h-px before:bg-gray-200">
                      <div>
                        <div className="mb-5 flex items-center gap-1.5 label text-black">
                          <span>{t("venues.venueDetail")}</span>
                          <span className="group relative inline-flex">
                            <button
                              type="button"
                              aria-label={t("venues.hallInfo")}
                              className="inline-flex text-black"
                            >
                              <InformationCircleIcon className="h-5 w-5" />
                            </button>
                            <span className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 hidden w-80 rounded-md bg-secondary px-3 py-2 text-xs font-normal leading-5 text-white shadow-lg group-hover:block group-focus-within:block">
                              {t("venues.hallInfoTooltip")}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {items?.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-3 items-end">
                          <div className="col-span-5 [&_.label>span]:ml-1">
                            <Input
                              label={index === 0 ? t("venues.hallName") : ""}
                              placeholder={t("venues.hallName")}
                              error={errors[index]?.hallName}
                              value={item?.hallName}
                              onChange={(e) => handleInputChange(e, index, "hallName")}
                              labelOnTop={index === 0}
                            />
                          </div>

                          <div className="col-span-6 [&_.label>span]:ml-1">
                            <Input
                              label={index === 0 ? t("venues.hallAddress") : ""}
                        placeholder={t("venues.hallAddressExample")}
                              error={errors[index]?.floor}
                              value={item?.floor}
                              onChange={(e) => handleInputChange(e, index, "floor")}
                              labelOnTop={index === 0}
                            />
                          </div>

                          <div className="col-span-1 flex h-9 items-center justify-center">
                            {items.length > 1 && (
                              <button
                                type="button"
                                aria-label={t("venues.removeHall")}
                                onClick={() => handleDeleteItem(index)}
                                className="inline-flex h-9 w-9 items-center justify-center text-gray-400 transition hover:text-red-500"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addNewFieldSet}
                      className="mt-5 flex h-8 w-fit items-center gap-2 rounded-lg border border-secondary/50 px-3 text-sm font-medium text-secondary transition hover:border-secondary hover:bg-secondary/5"
                    >
                      <PlusIcon className="h-5 w-5" />
                      {t("venues.addAnotherHall")}
                    </button>

                    <div className="relative mt-14 mb-5 ltr:text-left rtl:text-right before:absolute before:-top-7 before:left-0 before:right-0 before:h-px before:bg-gray-200">
                      <div>
                        <div className="mb-5 label text-black">{t("venues.venuePrimaryContact")}</div>
                      </div>
                    </div>

                    <div className="mt-5">
                      {contacts.map((item, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-12 gap-4 items-end mb-4"
                        >
                          {/* Contact Person */}
                          <div className="col-span-3">
                            <Input
                              label={t("venues.contactPerson")}
                              labelOnTop
                              placeholder={t("venues.contactPerson")}
                              value={item.contactPerson}
                              onChange={(e) =>
                                handleContactChange(
                                  index,
                                  "contactPerson",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          {/* Phone Number */}
                          <div className="col-span-4">
                            
                            <div className="label ltr:text-left rtl:text-right">
                              <p>
                                {t("venues.contactNumber")}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <div className="w-24">
                                <Dropdown
                                  isSearchable
                                  value={item.countryCode}
                                  options={countriesCodeData?.countries.map(
                                    (country) => ({
                                      label: `+${country.callingCodes[0]}`,
                                      value: `+${country.callingCodes[0]}`,
                                    })
                                  )}
                                  onChange={(value) =>
                                    handleContactChange(
                                      index,
                                      "countryCode",
                                      value
                                    )
                                  }
                                  invisible
                                />
                              </div>

                              <div className="flex-1">
                                <Input
                                  placeholder={t("venues.contactNumber")}
                                  value={item.phone}
                                  onChange={(e) =>
                                    handleContactChange(
                                      index,
                                      "phone",
                                      e.target.value
                                    )
                                  }
                                  invisible
                                />
                              </div>
                            </div>
                          </div>

                          {/* Email */}
                          <div className="col-span-4">
                            <Input
                              label={t("venues.emailAddress")}
                              labelOnTop
                              placeholder={t("venues.emailAddress")}
                              value={item.email}
                              error={contactErrors[index]?.email}
                              onChange={(e) =>
                                handleContactChange(
                                  index,
                                  "email",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          {/* Action Button */}
                          <div className="col-span-1 flex h-9 items-center justify-center">
                            {contacts.length > 1 && (
                              <button
                                type="button"
                                aria-label={t("venues.removeContact")}
                                onClick={() => removeContact(index)}
                                className="inline-flex h-9 w-9 items-center justify-center text-gray-400 transition hover:text-red-500"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addContact}
                      className="mt-1 flex h-8 w-fit items-center gap-2 rounded-lg border border-secondary/50 px-3 text-sm font-medium text-secondary transition hover:border-secondary hover:bg-secondary/5"
                    >
                      <PlusIcon className="h-5 w-5" />
                      {t("venues.addAnotherContact")}
                    </button>

                    <div className="relative mt-14 ltr:text-left rtl:text-right before:absolute before:-top-7 before:left-0 before:right-0 before:h-px before:bg-gray-200">
                      <div>
                        <div className="mb-2 label text-black">{t("headings.otherInfo")}</div>
                      </div>
                    </div>

                    <div className="mt-5">
                      <Input
                        labelOnTop
                        label={t("headings.notes")}
                        placeholder={t("headings.notes")}
                        textarea
                        error={venueNoteError}
                        value={venueNote}
                        onChange={(e) => {
                          setVenueNote(e.target.value);
                          setVenueNoteError("");
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-7 mx-auto mt-10 w-8/12 md:w-full lg:w-8/12 xl:w-8/12">
                    <Button icon={<CheckIcon />} title={data ? t("venues.updateVenue") : t("venues.addVenue")} type="submit" loading={btnLoading} />
                    <Button icon={<XMarkIcon />} title={t("buttons.cancel")} type="button" buttonColor="bg-red-500" onClick={closeModal} />
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AddVenueModal;

const contact_options = [
  {
    label: "Mobile",
    value: "Mobile",
  },
  {
    label: "Landline",
    value: "Landline",
  },
];

const email_options = [
  {
    label: "Work",
    value: "Work",
  },
  {
    label: "Personal",
    value: "Personal",
  },
];
