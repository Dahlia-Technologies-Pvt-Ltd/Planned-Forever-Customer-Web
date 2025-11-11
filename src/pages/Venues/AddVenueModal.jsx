import ApiServices from "../../api/services";
import Input from "../../components/common/Input";
import TimezoneSelect from "react-timezone-select";
import Button from "../../components/common/Button";
import { Dialog, Transition } from "@headlessui/react";
import Dropdown from "../../components/common/Dropdown";
import countriesData from "../../utilities/country.json";
import { useThemeContext } from "../../context/GlobalContext";
import countriesCodeData from "../../utilities/countryCode.json";
import { XMarkIcon, CheckIcon, MinusCircleIcon } from "@heroicons/react/24/solid";
import { VENUE_PRINT, VENUES } from "../../routes/Names";
import MapPicker from "../../components/MapPicker";
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
const AddVenueModal = ({ isOpen, setIsOpen, refreshData, data, setModalData, rData, setRecommendedData }) => {
  // translation
  const { t } = useTranslation("common");
  // Context
  const { eventSelect, openSuccessModal, closeSuccessModel, setErrorMessage } = useThemeContext();

  const navigate = useNavigate();

  // useStates
  const [pin, setPin] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState(null);
  const [timeZone, setTimeZone] = useState("");
  const [venueNote, setVenueNote] = useState("");
  const [cityError, setCityError] = useState("");
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
  const [location, setLocation] = useState({ address: "", lat: "", lng: "" });
  const [emailError, setEmailError] = useState("");

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

      if (!currentItem.floor) {
        itemError.floor = "Required";
        isValid = false;
      }

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

    if (venueName === "") {
      setVenueNameError(" Required");
      isValidData = false;
    }
    if (!location?.address) {
      setVenueAddressError(" Required");
      isValidData = false;
    }

    if (city === "") {
      setCityError(" Required");
      isValidData = false;
    }
    if (state === "") {
      setStateError("Required");
      isValidData = false;
    }

    if (contactPerson === "") {
      setContactPersonError(" Required");
      isValidData = false;
    }

    if (contactNumber.contactType === "" || contactNumber.number === "" || contactNumber.countryCode === "") {
      setContactNumberError(" Required");
      isValidData = false;
    }

    if (email.email === "" || email.emailType === "") {
      setEmailError(" Required");
      isValidData = false;
    }

    const newErrors = errors?.map((error, index) => {
      const currentItem = items[index];
      let itemError = { hallName: "", floor: "" };

      if (!currentItem?.hallName) {
        itemError.hallName = "Required";
        isValidData = false;
      }

      // if (!currentItem?.capacity) {
      //   itemError.capacity = "Required";
      //   isValidData = false;
      // }

      if (!currentItem?.floor) {
        itemError.floor = "Required";
        isValidData = false;
      }

      return itemError;
    });
    setErrors(newErrors);

    return isValidData;
  };

  console.log({ rData });

  // submit API
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isValidForm()) {
      const contactNumbers = [];

      if (contactNumber.number) {
        const key = contactNumber.contactType?.label?.toLowerCase() === "mobile" ? "mobile" : "land_line_number";
        const countryCode = typeof contactNumber.countryCode === "object" ? contactNumber.countryCode.value : contactNumber.countryCode;
        contactNumbers.push({
          [key]: contactNumber.number,
          country_code: countryCode,
        });
      }

      if (contact.number) {
        const key = contact.contactType?.label?.toLowerCase() === "mobile" ? "mobile" : "land_line_number";
        const countryCode = typeof contact.countryCode === "object" ? contact.countryCode.value : contact.countryCode;
        contactNumbers.push({
          [key]: contact.number,
          country_code: countryCode,
        });
      }

      if (contactNumber2.number) {
        const key = contactNumber2.contactType?.label?.toLowerCase() === "mobile" ? "mobile" : "land_line_number";
        const countryCode = typeof contactNumber2.countryCode === "object" ? contactNumber2.countryCode.value : contactNumber2.countryCode;
        contactNumbers.push({
          [key]: contactNumber2.number,
          country_code: countryCode,
        });
      }

      const emailsArray = [];
      if (email.email) {
        const key = email.emailType?.label?.toLowerCase() === "work" ? "work" : "personal";
        emailsArray.push({ [key]: email.email });
      }
      if (emailAddress.email) {
        const key = emailAddress.emailType?.label?.toLowerCase() === "work" ? "work" : "personal";
        emailsArray.push({ [key]: emailAddress.email });
      }

      let payload;

      if (data === null) {
        try {
          setBtnLoading(true);

          payload = {
            name: rData === null ? venueName : rData?.name,
            address: location.address,
            city: city,
            state: state,
            pin: pin,
            time_zone: timeZone?.value,
            contact_person_name: contactPerson,
            contact_numbers: contactNumbers,
            emails: emailsArray,
            description: venueNote,
            country: country.value ? country?.value : country.Value,
            longitude: location?.lng,
            latitude: location?.lat,
            venue_details: items?.map((item) => ({
              name: item.hallName,
              // capacity: item.capacity,
              location: item.floor,
            })),
            event_id: eventSelect,
            recommended_trending_id: rData?.id,
            recommended_trending_type: "recommended",
          };

          const response = await ApiServices.venues.addVenue(payload);

          console.log({ response });

          if (response?.data?.code === 200) {
            closeModal();
            rData !== null ? navigate(VENUES) : "";
            refreshData();
            openSuccessModal({
              title: t("message.success"),
              message: t("venues.venueAddedSuccess"),
              onClickDone: (close) => {
                closeSuccessModel();
              },
            });
          } else {
            setBtnLoading(false);
          }
        } catch (err) {
          setErrorMessage(err?.response?.data?.message);
          setBtnLoading(false);
        } finally {
          setBtnLoading(false);
        }
      } else {
        try {
          setBtnLoading(true);

          payload = {
            name: venueName,
            address: location.address,
            city: city,
            state: state,
            pin: pin,
            time_zone: timeZone?.value,
            contact_person_name: contactPerson,
            contact_numbers: contactNumbers,
            emails: emailsArray,
            description: venueNote,
            country: country?.Value,
            longitude: location?.lng,
            latitude: location?.lat,
            venue_details: items?.map((item) => ({
              name: item.hallName || "",
              // capacity: item.capacity,
              location: item.floor || "",
            })),
            event_id: eventSelect,
            recommended_trending_type: "recommended",
          };

          const response = await ApiServices.venues.updateVenue(data.id, payload);

          if (response?.data?.code === 200) {
            closeModal();
            refreshData();
            openSuccessModal({
              title: t("message.success"),
              message: t("venues.venueAddedSuccess"),
              onClickDone: (close) => {
                closeSuccessModel();
              },
            });
          } else {
            setBtnLoading(false);
          }
        } catch (err) {
          setBtnLoading(false);
        } finally {
          setBtnLoading(false);
        }
      }
    }
  };

  // Clear All Data
  const clearAllData = () => {
    setPin("");
    setVenueName("");
    setLocation({ address: "", lat: "", lng: "" });
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
    setVenueNameError("");
    setVenueAddressError("");
    setErrors([{ hallName: "", floor: "" }]);
    setContactNumberError("");
    setContactPersonError("");
    setStateError("");
    setCityError("");
    setEmailError("");
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
      setItems(currentItem);

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
          countryCode: { label: contactNumbers[0]?.country_code, value: contactNumbers[0]?.country_code },
        };
      }

      if (contactNumbers?.length > 1) {
        contact2 = {
          contactType: { label: getContactType(contactNumbers[1]), value: getContactType(contactNumbers[1]) },
          number: getContactNumber(contactNumbers[1]),
          countryCode: { label: contactNumbers[1]?.country_code, value: contactNumbers[1]?.country_code },
        };
      }
      if (contactNumbers?.length > 2) {
        contact3 = {
          contactType: { label: getContactType(contactNumbers[2]), value: getContactType(contactNumbers[2]) },
          number: getContactNumber(contactNumbers[2]),
          countryCode: { label: contactNumbers[2]?.country_code, value: contactNumbers[2]?.country_code },
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
    }
  }, [isOpen]);

  useEffect(() => {
    if (rData !== null) {
      setVenueName(rData?.name);
      setLocation({ address: rData?.address, lat: rData?.latitude, lng: rData?.longitude });
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
      setItems(currentItem);

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
          countryCode: { label: contactNumbers[0]?.country_code, value: contactNumbers[0]?.country_code },
        };
      }

      if (contactNumbers?.length > 1) {
        contact2 = {
          contactType: { label: getContactType(contactNumbers[1]), value: getContactType(contactNumbers[1]) },
          number: getContactNumber(contactNumbers[1]),
          countryCode: { label: contactNumbers[1]?.country_code, value: contactNumbers[1]?.country_code },
        };
      }
      if (contactNumbers?.length > 2) {
        contact3 = {
          contactType: { label: getContactType(contactNumbers[2]), value: getContactType(contactNumbers[2]) },
          number: getContactNumber(contactNumbers[2]),
          countryCode: { label: contactNumbers[2]?.country_code, value: contactNumbers[2]?.country_code },
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
    }
  }, [isOpen]);

  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation);
    if (selectedLocation) {
      setVenueAddressError("");
    }
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
                className={`p-8 w-full max-w-7xl bg-white rounded-2xl shadow-xl transition-all md:max-w-xl lg:max-w-3xl xl:max-w-5xl 2xl:max-w-6xl 3xl:max-w-7xl`}
              >
                <div className="flex justify-between items-center mb-5">
                  <Dialog.Title as="h3" className="text-lg font-semibold leading-7 font-poppins text-secondary-color">
                    {data === null ? t("venues.addVenue") : t("venues.updateVenue")}
                  </Dialog.Title>
                  <XMarkIcon onClick={closeModal} className="w-8 h-8 cursor-pointer text-info-color" />
                </div>

                <form onSubmit={handleSubmit}>
                  <div className=" h-[600px] overflow-y-auto p-2 md:h-[400px] lg:h-[400px] xl:h-[500px] 2xl:h-[600px]">
                    <div className="mb-5 ltr:text-left rtl:text-right">
                      <div>
                        <div className="mb-2 label text-secondary">{t("headings.basicInfo")}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-7">
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
                      <Dropdown
                        isSearchable
                        options={countriesData.countries.map((country) => ({ label: country.name, Value: country.name }))}
                        title={t("venues.country")}
                        placeholder={t("venues.country")}
                        value={country}
                        onChange={(value) => setCountry(value)}
                      />
                      <Input
                        label={t("venues.pin")}
                        placeholder={t("venues.pin")}
                        labelOnTop
                        value={pin}
                        onChange={(e) => {
                          setPin(e.target.value);
                        }}
                        type="number"
                      />

                      <div>
                        <div className="mb-2 label ltr:text-left rtl:text-right">
                          <p>{t("venues.timeZone")}</p>
                        </div>
                        <TimezoneSelect
                          value={timeZone}
                          onChange={(e) => {
                            setTimeZone(e);
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
                              boxShadow: state.isFocused ? "0 0 0 2px black" : defaultStyles.boxShadow,
                              borderRadius: "10px",
                              borderColor: state.isFocused || state.isHovered ? "none" : defaultStyles.border,
                              border: state.isFocused || state.isHovered ? "none" : defaultStyles.border,
                              minHeight: "44px",
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

                    <div className="grid grid-cols-12 mt-5">
                      <div className="col-span-8 md:col-span-12 lg:col-span-12 xl:col-span-8">
                        <div className="mt-3">
                          <MapPicker
                            label={t("venues.venueAddress")}
                            setLocation={setLocation}
                            placeholder={t("venues.venueAddress")}
                            onLocationSelect={handleLocationSelect}
                            location={location}
                            venueAddressError={venueAddressError}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 ltr:text-left rtl:text-right">
                      <div>
                        <div className="mb-2 label text-secondary">
                          {t("venues.venueDetail")}
                          <span className="text-red-500">*</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left">
                      {items?.map((item, index) => (
                        <div key={index} className="flex items-center mb-2 space-x-3 w-full">
                          <Input
                            placeholder={t("venues.hallName")}
                            error={errors[index]?.hallName}
                            labelOnTop
                            value={item?.hallName}
                            onChange={(e) => handleInputChange(e, index, "hallName")}
                            invisible
                          />

                          <Input
                            placeholder={t("venues.hallAddress")}
                            labelOnTop
                            error={errors[index]?.floor}
                            value={item?.floor}
                            onChange={(e) => handleInputChange(e, index, "floor")}
                            invisible
                          />
                          {index > 0 && (
                            <MinusCircleIcon
                              className="inline-block ml-1.5 w-10 h-10 text-red-500 cursor-pointer"
                              onClick={() => handleDeleteItem(index)}
                            />
                          )}
                        </div>
                      ))}

                      <button className="px-4 py-2 mt-4 text-white rounded-lg bg-secondary" onClick={addNewFieldSet}>
                        {t("buttons.addAnother")}
                      </button>
                    </div>

                    <div className="mt-5 mb-5 ltr:text-left rtl:text-right">
                      <div>
                        <div className="mb-2 label text-secondary">{t("headings.contactInfo")}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-7">
                      <div className="col-span-4 md:col-span-12 lg:col-span-12 xl:col-span-4 2xl:col-span-4 3xl:col-span-4">
                        <Input
                          isRequired
                          label={t("venues.contactPerson")}
                          placeholder={t("venues.contactPerson")}
                          labelOnTop
                          error={contactPersonError}
                          value={contactPerson}
                          onChange={(e) => {
                            setContactPerson(e.target.value);
                            setContactPersonError("");
                          }}
                        />
                      </div>
                      <div className="col-span-4 md:col-span-12 lg:col-span-6 xl:col-span-4 2xl:col-span-4 3xl:col-span-4">
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-4">
                            <Dropdown
                              selectClasses=""
                              title={t("venues.email1")}
                              placeholder={t("venues.type")}
                              value={email.emailType}
                              onChange={(e) => {
                                setEmail({ ...email, emailType: e });
                                setEmailError("");
                              }}
                              options={email_options}
                              labelClasses="whitespace-nowrap"
                              withError={emailError}
                              isRequired
                            />
                          </div>

                          <div className="col-span-8 mt-6">
                            <Input
                              placeholder={t("addVenueModal.emailAddress")}
                              value={email.email}
                              onChange={(e) => {
                                setEmail({ ...email, email: e.target.value });
                                setEmailError("");
                              }}
                              error={emailError}
                              invisible
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-span-4 md:col-span-12 lg:col-span-6 xl:col-span-4 2xl:col-span-4 3xl:col-span-4">
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-4">
                            <Dropdown
                              title={t("venues.email2")}
                              placeholder={t("venues.type")}
                              value={emailAddress.emailType}
                              onChange={(e) => {
                                setEmailAddress({ ...emailAddress, emailType: e });
                              }}
                              options={email_options}
                              labelClasses="whitespace-nowrap"
                            />
                          </div>
                          <div className="col-span-8 mt-6">
                            <Input
                              placeholder={t("venues.emailAddress")}
                              value={emailAddress.email}
                              onChange={(e) => setEmailAddress({ ...emailAddress, email: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-2 mt-5">
                      <div className="col-span-6">
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-3">
                            <Dropdown
                              isRequired
                              title={t("venues.contact1")}
                              placeholder={t("venues.type")}
                              withError={contactNumberError}
                              onChange={(e) => {
                                setContactNumber({ ...contactNumber, contactType: e });
                                setContactNumberError("");
                              }}
                              value={contactNumber.contactType}
                              options={contact_options}
                              labelClasses="whitespace-nowrap"
                            />
                          </div>

                          <div className="col-span-4 mt-6">
                            <Dropdown
                              isSearchable
                              options={countriesCodeData?.countries.map((country) => ({
                                label: `+${country.callingCodes[0]} ${country.name}`,
                                value: `+${country.callingCodes[0]} ${country.name}`,
                              }))}
                              placeholder={t("venues.countryCode")}
                              value={contactNumber.countryCode}
                              onChange={(e) => {
                                setContactNumber({ ...contactNumber, countryCode: e });
                                setContactNumberError("");
                              }}
                              invisible
                              withError={contactNumberError}
                              title={t("venues.contact1")}
                            />
                          </div>

                          <div className="col-span-5 mt-6">
                            <Input
                              placeholder={t("venues.contactNumber")}
                              value={contactNumber.number}
                              onChange={(e) => {
                                setContactNumber({ ...contactNumber, number: e.target.value });
                                setContactNumberError("");
                              }}
                              type="tel"
                              error={contactNumberError}
                              invisible
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-2 mt-5">
                      <div className="col-span-6">
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-3">
                            <Dropdown
                              title={t("venues.contact2")}
                              placeholder={t("venues.type")}
                              onChange={(e) => {
                                setContact({ ...contact, contactType: e });
                              }}
                              value={contact.contactType}
                              options={contact_options}
                              labelClasses="whitespace-nowrap"
                            />
                          </div>
                          <div className="col-span-4 mt-6">
                            <Dropdown
                              isSearchable
                              options={countriesCodeData?.countries.map((country) => ({
                                label: `+${country.callingCodes[0]} ${country.name}`,
                                value: `+${country.callingCodes[0]} ${country.name}`,
                              }))}
                              placeholder={t("venues.countryCode")}
                              value={contact.countryCode}
                              onChange={(e) => setContact({ ...contact, countryCode: e })}
                            />
                          </div>
                          <div className="col-span-5 mt-6">
                            <Input
                              placeholder={t("venues.contactNumber")}
                              value={contact.number}
                              onChange={(e) => setContact({ ...contact, number: e.target.value })}
                              type="tel"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-2 mt-5">
                      <div className="col-span-6">
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-3">
                            <Dropdown
                              title={t("venues.contact3")}
                              placeholder={t("venues.type")}
                              onChange={(e) => {
                                setContactNumber2({ ...contactNumber2, contactType: e });
                              }}
                              value={contactNumber2.contactType}
                              options={contact_options}
                              labelClasses="whitespace-nowrap"
                            />
                          </div>

                          <div className="col-span-4 mt-6">
                            <Dropdown
                              isSearchable
                              options={countriesCodeData?.countries.map((country) => ({
                                label: `+${country.callingCodes[0]} ${country.name}`,
                                value: `+${country.callingCodes[0]} ${country.name}`,
                              }))}
                              placeholder={t("venues.countryCode")}
                              value={contactNumber2.countryCode}
                              onChange={(e) => setContactNumber2({ ...contactNumber2, countryCode: e })}
                            />
                          </div>

                          <div className="col-span-5 mt-6">
                            <Input
                              placeholder={t("venues.contactNumber")}
                              value={contactNumber2.number}
                              onChange={(e) => setContactNumber2({ ...contactNumber2, number: e.target.value })}
                              type="tel"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 ltr:text-left rtl:text-right">
                      <div>
                        <div className="mb-2 label text-secondary">{t("headings.otherInfo")}</div>
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
