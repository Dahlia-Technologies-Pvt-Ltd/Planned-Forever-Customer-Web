import React from "react";
import moment from "moment";
import ApiServices from "../../api/services";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Dropdown from "../../components/common/Dropdown";
import { useThemeContext } from "../../context/GlobalContext";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { toUTCUnixTimestamp } from "../../utilities/HelperFunctions";
import { MinusCircleIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import { VENUE_PRINT, CEREMONIES } from "../../routes/Names";
import countriesCodeData from "../../utilities/countryCode.json";
import { useTranslation } from "react-i18next";

const defaultCountryCode = {
  label: "+91",
  value: "+91",
};

const AddCeremoniesModal = ({ isOpen, setIsOpen, data, refreshData, setModalData, rData, tData }) => {
  const { t } = useTranslation("common");

  const navigate = useNavigate();

  // Context
  const {
    eventDetail,
    eventSelect,
    allVenues,
    allEvents,
    setBtnLoading,
    btnLoading,
    openSuccessModal,
    closeSuccessModel,
    getEventList,
    getVenueList,
    allEventsNotFormatted,
  } = useThemeContext();

  // useStates
  const [venues, setVenues] = useState([]);
  const [event, setEvent] = useState(null);
  const [heldAt, setHeldAt] = useState(null);
  const [eventNote, setEventNote] = useState("");
  const [cermonyName, setCeremonyName] = useState("");
  const [inChargeName, setInChargeName] = useState("");
  const [inChargeMobile, setInChargeMobile] = useState({ countryCode: defaultCountryCode, phone: "" });
  const [endDateAndTime, setEndDateAndTime] = useState("");
  const [asstInChargeName, setAsstInChargeName] = useState("");
  const [startDateAndTime, setStartDateAndTime] = useState("");
  const [asstInChargeMobile, setAsstInChargeMobile] = useState({ countryCode: defaultCountryCode, phone: "" });

  // Errors
  const [eventError, setEventError] = useState("");
  const [heldAtError, setHeldAtError] = useState("");
  const [eventNoteError, setEventNoteError] = useState("");
  const [cermonyNameError, setCeremonyNameError] = useState("");
  const [inChargeNameError, setInChargeNameError] = useState("");
  const [endDateAndTimeError, setEndDateAndTimeError] = useState("");
  const [startDateAndTimeError, setStartDateAndTimeError] = useState("");
  const [asstInChargeNameError, setAsstInChargeNameError] = useState("");

  const [inChargeMobileError, setInChargeMobileError] = useState("");
  const [asstInChargeMobileError, setAsstInChargeMobileError] = useState("");

  const [inChargeMobileErrorC, setInChargeMobileErrorC] = useState("");
  const [asstInChargeMobileErrorC, setAsstInChargeMobileErrorC] = useState("");

  const [venueHeldlist, setVenueHeldlist] = useState([]);
  const [venueHeld, setVenueHeld] = useState(null);
  const [venueHeldError, setVenueHeldError] = useState("");
  const [dressCode, setDressCode] = useState("");

  // Validations
  const isValidForm = () => {
    let isValidData = true;
    if (rData === null && tData === null ? cermonyName === "" : cermonyName === (rData === null ? tData?.name : rData?.name)) {
      setCeremonyNameError(" Required");
      isValidData = false;
    }
    if (heldAt === null) {
      setHeldAtError(" Required");
      isValidData = false;
    }
    // if (venueHeld === null) {
    //   setVenueHeldError(" Required");
    //   isValidData = false;
    // }
    // if (event === null) {
    //   setEventError("Required");
    //   isValidData = false;
    // }
    // if (!event) {
    //   // Check if an event is selected
    //   setEventError("Please select an event first");
    //   isValidData = false;
    // }
    if (startDateAndTime === "") {
      setStartDateAndTimeError(" Required");
      isValidData = false;
    }
    if (endDateAndTime === "") {
      setEndDateAndTimeError("Required");
      isValidData = false;
    }
    return isValidData;
  };

  console.log({ inChargeMobile, inChargeMobileError });

  console.log("allEvents ==>", allEvents);

  // Event handler for Category dropdown change
  // const handleEventChange = async (selectedEvent) => {
  //   setEvent(selectedEvent);
  //   setHeldAt(null);
  //   setEventError("");
  //   await getVenueListById(selectedEvent.venue_id);
  // };

  console.log("aaaaaa", eventSelect);

  // Get Sub Category List
  const getVenueListById = async () => {
    let params = {
      event_id: eventSelect,
    };

    try {
      const response = await ApiServices.venues.getVenueByEvent(params);

      console.log({ response });

      if (response.data.code === 200) {
        const formattedVenues = response.data.data.data.map((venue) => ({
          value: venue.id,
          label: venue.name,
        }));

        setVenues(formattedVenues);
      }
    } catch (err) {}
  };

  console.log({ heldAt });

  const getVenueDetailById = async () => {
    try {
      const response = await ApiServices.ceremonies.getVenueById(heldAt?.value);

      console.log({ response });

      if (response.data.code === 200) {
        const formattedVenues = response.data.data.venue_details.map((venue) => ({
          value: venue.id,
          label: venue.name,
        }));

        setVenueHeldlist(formattedVenues);
      }
    } catch (err) {}
  };

  useEffect(() => {
    if (heldAt?.value) {
      getVenueDetailById();
    }
  }, [heldAt?.value]);

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidForm()) {
      try {
        setBtnLoading(true);

        let payload = {
          // name: ((rData === null || tData === null) ? cermonyName : (rData === null ? tData?.name : rData?.name)),
          name: rData ? rData.name : tData ? tData.name : cermonyName,
          venue_id: heldAt?.value,
          start_date: toUTCUnixTimestamp(startDateAndTime),
          end_date: toUTCUnixTimestamp(endDateAndTime),
          incharge_name: inChargeName,
          incharge_contact_number: { code: inChargeMobile?.countryCode?.value, phone_number: inChargeMobile?.phone },
          asst_incharge_name: asstInChargeName,
          asst_incharge_contact_number: { code: asstInChargeMobile?.countryCode?.value, phone_number: asstInChargeMobile?.phone },
          event_id: eventSelect,
          description: eventNote,
          recommended_trending_id: rData === null ? tData?.id : rData?.id,
          recommended_trending_type: rData === null ? "trending" : "recommended",
          held_at: venueHeld?.value,
          dress_code: dressCode,
        };

        const response = await (data === null
          ? ApiServices.ceremonies.addCeremony(payload)
          : ApiServices.ceremonies.updateCeremony(data.id, payload));

        if (response.data.code === 200) {
          setBtnLoading(false);
          setIsOpen(false);
          rData !== null || tData !== null ? navigate(CEREMONIES) : "";
          setModalData(null);
          clearAllData();
          refreshData();
          openSuccessModal({
            title: t("message.success"),
            message: data === null ? t("ceremonies.ceremonyAddedSuccess") : t("ceremonies.ceremonyUpdatedSucess"),
            onClickDone: (close) => {
              closeSuccessModel();
            },
          });
        } else {
          setBtnLoading(false);
        }
      } catch (err) {
        setError(err?.response?.data?.message);
        setBtnLoading(false);
      } finally {
        setBtnLoading(false);
      }
    } else {
    }
  };

  // Clear States
  const clearAllData = () => {
    setEvent(null);
    setHeldAt(null);
    setEventNote("");
    setEventError("");
    setHeldAtError("");
    setModalData(null);
    setInChargeName("");
    setCeremonyName("");
    setEndDateAndTime("");
    setInChargeMobile({ countryCode: defaultCountryCode, phone: "" });
    setEventNoteError("");
    setStartDateAndTime("");
    setAsstInChargeName("");
    setInChargeNameError("");
    setCeremonyNameError("");
    setAsstInChargeMobile({ countryCode: defaultCountryCode, phone: "" });
    setInChargeMobileError("");
    setInChargeMobileErrorC("");
    setEndDateAndTimeError("");
    setStartDateAndTimeError("");
    setAsstInChargeNameError("");
    setAsstInChargeMobileError("");
    setAsstInChargeMobileErrorC("");
    setVenueHeld(null);
    setVenueHeldError("");
    setDressCode("");
  };

  // Close Modal
  const closeModal = () => {
    setIsOpen(false);
    clearAllData();
    setBtnLoading(false);
  };

  // Use Effects
  useEffect(() => {
    if (data !== null) {
      setDressCode(data?.dress_code);
      setVenueHeld({ value: data?.held_at?.id, label: data?.held_at?.name });
      setCeremonyName(data?.name);
      setEventNote(data?.description);
      setInChargeName(data?.incharge_name);
      setAsstInChargeName(data?.asst_incharge_name);
      setInChargeMobile({
        countryCode: data?.incharge_contact_number?.code
          ? { label: data.incharge_contact_number.code, value: data.incharge_contact_number.code }
          : defaultCountryCode,
        phone: data?.incharge_contact_number?.phone_number,
      });
      setAsstInChargeMobile({
        countryCode: data?.asst_incharge_contact_number?.code
          ? { label: data.asst_incharge_contact_number.code, value: data.asst_incharge_contact_number.code }
          : defaultCountryCode,
        phone: data?.asst_incharge_contact_number?.phone_number,
      });
      setHeldAt({ label: data?.venue?.name, value: data?.venue?.id });
      setEvent({ label: data?.event?.name, value: data?.event?.id });
      setEndDateAndTime(moment.unix(data?.end_date).format("YYYY-MM-DD HH:mm"));
      setStartDateAndTime(moment.unix(data?.start_date).format("YYYY-MM-DD HH:mm"));
    }
  }, [isOpen]);

  console.log({ data });

  useEffect(() => {
    if (isOpen) {
      getVenueListById();
    }
  }, [isOpen]);

  const [matchedEvent, setMatchedEvent] = useState({});

  useEffect(() => {
    // Find the matching event
    const eventIdToMatch = event?.value;
    const foundEvent = allEventsNotFormatted?.find((event) => event.id === eventIdToMatch);

    if (foundEvent) {
      setMatchedEvent({
        id: foundEvent?.id,
        start_date: foundEvent?.start_date,
        end_date: foundEvent?.end_date,
      });
    } else {
      setMatchedEvent({});
    }
  }, [event]);

  console.log({ aaaaaaaaaa: eventDetail });
  console.log({ DateTime : moment.unix(eventDetail?.end_date).format("YYYY-MM-DDTHH:mm") });

  return (
    <>
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

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-75"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-75"
              >
                <Dialog.Panel className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl transition-all">
                  <div className="mb-2 flex items-center justify-between">
                    <Dialog.Title as="h3" className="font-poppins ml-1 text-lg font-semibold leading-7 text-secondary-color">
                      {data === null ? <>{t("ceremonies.addNewCeremony")}</> : <>{t("ceremonies.updateCeremony")}</>}
                    </Dialog.Title>
                    <XMarkIcon onClick={closeModal} className="h-8 w-8 cursor-pointer text-info-color" />
                  </div>

                  <form className="[&_.label]:text-xs [&_.label]:font-medium [&_input]:h-9 [&_input]:min-h-[36px] [&_input]:text-sm [&_input]:py-1 [&_input[type='datetime-local']]:h-9 [&_textarea]:text-sm [&_.css-b62m3t-container]:text-sm [&_.css-13cymwt-control]:h-9 [&_.css-13cymwt-control]:min-h-[36px] [&_.css-13cymwt-control]:py-0 [&_.css-t3ipsp-control]:h-9 [&_.css-t3ipsp-control]:min-h-[36px] [&_.css-t3ipsp-control]:py-0 [&_.css-hlgwow]:h-9 [&_.css-hlgwow]:min-h-[36px] [&_.css-hlgwow]:py-0 [&_.css-hlgwow]:px- [&_.css-1jqq78o-placeholder]:text-sm [&_.css-1jqq78o-placeholder]:leading-none [&_.css-1dimb5e-singleValue]:text-sm [&_.css-1dimb5e-singleValue]:leading-none [&_.css-1wy0on6]:h-9 [&_.css-19bb58m]:my-0">
                    <div className="h-[600px] overflow-y-auto p-1 md:h-[400px] lg:h-[400px] xl:h-[500px] 2xl:h-[600px]">
                      <div className="mb-5 ltr:text-left rtl:text-right">
                        <div>
                          <div className="mb-2 label text-black">{t("headings.basicInfo")}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <Input
                          label={t("ceremonies.ceremonyName")}
                          placeholder={t("ceremonies.ceremonyName")}
                          isRequired
                          error={cermonyNameError}
                          value={rData === null && tData === null ? cermonyName : rData === null ? tData?.name : rData?.name}
                          onChange={(e) => {
                            setCeremonyName(e.target.value);
                            setCeremonyNameError("");
                          }}
                          disabled={
                            (rData === null && data?.recommend_trending_ceremony === "recommended") ||
                            (tData === null && data?.recommend_trending_ceremony === "trending")
                              ? true
                              : false
                          }
                        />

                        {/* <Dropdown
                          isRequired
          title={t("ceremonies.events")}
          placeholder={t("ceremonies.events")}
                          withError={eventError}
                          options={allEvents}
                          value={event}
                          onChange={(selectedEvent) => handleEventChange(selectedEvent)}
                        /> */}

                        <Dropdown
                          isRequired
                          title={t("ceremonies.venue")}
                          placeholder={t("ceremonies.venue")}
                          withError={heldAtError}
                          options={venues}
                          value={heldAt}
                          onChange={(e) => {
                            setHeldAt(e);
                            setVenueHeld(null);
                            setHeldAtError("");
                          }}
                        />

                        <Dropdown
                          // isRequired
                          title={t("ceremonies.heldAt")}
                          placeholder={t("ceremonies.heldAt")}
                          // withError={venueHeldError}
                          options={venueHeldlist}
                          value={venueHeld}
                          onChange={(e) => {
                            setVenueHeld(e);
                            // setVenueHeldError("");
                          }}
                        />

                        <Input
                          label={t("ceremonies.dressCode")}
                          placeholder={t("ceremonies.dressCode")}
                          value={dressCode}
                          onChange={(e) => {
                            setDressCode(e.target.value);
                          }}
                        />

                        <Input
                          isRequired
                          type="datetime-local"
                          label={t("ceremonies.startDateAndTime")}
                          placeholder={t("ceremonies.startDateAndTime")}
                          value={startDateAndTime ? startDateAndTime : ""}
                          error={startDateAndTimeError}
                          onChange={(e) => {
                            const value = e.target.value;
                            setStartDateAndTime(value);
                            setStartDateAndTimeError("");

                            if (endDateAndTime && new Date(value) >= new Date(endDateAndTime)) {
                              setStartDateAndTimeError("Start date & time must be before end date & time");
                            }
                          }}
                          min={moment.unix(eventDetail?.start_date).format("YYYY-MM-DDTHH:mm")}
                          max={moment.unix(eventDetail?.end_date).format("YYYY-MM-DDTHH:mm")}
                        />

                        {console.log("a", moment.unix(eventDetail?.start_date).format("YYYY-MM-DDTHH:mm"))}

                        <Input
                          isRequired
                          type="datetime-local"
                          label={t("ceremonies.endDateAndTime")}
                          placeholder={t("ceremonies.endDateAndTime")}
                          value={endDateAndTime}
                          error={endDateAndTimeError}
                          onChange={(e) => {
                            const value = e.target.value;
                            setEndDateAndTime(value);
                            setEndDateAndTimeError("");

                            if (startDateAndTime && new Date(value) <= new Date(startDateAndTime)) {
                              setEndDateAndTimeError("End date & time must be after start date & time");
                            }
                          }}
                          min={startDateAndTime || ""}
                          max={moment.unix(eventDetail?.end_date).format("YYYY-MM-DDTHH:mm")}
                          disabled={!startDateAndTime || !eventSelect}
                        />
                      </div>

                      <div className="relative mb-5 mt-14 ltr:text-left rtl:text-right before:absolute before:-top-7 before:left-0 before:right-0 before:h-px before:bg-gray-200">
                        <h2 className="label text-black">{t("headings.otherInfo")}</h2>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <Input
                          label={t("ceremonies.personIncharge")}
                          placeholder={t("ceremonies.personIncharge")}
                          value={inChargeName}
                          onChange={(e) => {
                            setInChargeName(e.target.value);
                            setInChargeNameError("");
                          }}
                        />

                        <div>
                          <div className="label mb-2 ltr:text-left rtl:text-right">
                            <p>{t("ceremonies.contactNumber")}</p>
                          </div>
                          <div className="flex gap-2">
                            <div className="w-24 shrink-0">
                              <Dropdown
                                isSearchable
                                options={countriesCodeData?.countries.map((country) => ({
                                  label: `+${country.callingCodes[0]}`,
                                  value: `+${country.callingCodes[0]}`,
                                }))}
                                placeholder="+91"
                                value={inChargeMobile.countryCode}
                                onChange={(value) => {
                                  setInChargeMobile({ ...inChargeMobile, countryCode: value });
                                  setInChargeMobileErrorC("");
                                }}
                                invisible
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <Input
                                placeholder={t("ceremonies.contactNumber")}
                                value={inChargeMobile.phone}
                                onChange={(e) => {
                                  setInChargeMobile({ ...inChargeMobile, phone: e.target.value });
                                  setInChargeMobileError("");
                                }}
                                invisible
                              />
                            </div>
                          </div>
                        </div>
                        <div aria-hidden="true" />

                        <Input
                          label={t("ceremonies.asstPersonIncharge")}
                          placeholder={t("ceremonies.asstPersonIncharge")}
                          value={asstInChargeName}
                          onChange={(e) => {
                            setAsstInChargeName(e.target.value);
                            setAsstInChargeNameError("");
                          }}
                        />

                        <div>
                          <div className="label mb-2 ltr:text-left rtl:text-right">
                            <p>{t("ceremonies.contactNumber")}</p>
                          </div>
                          <div className="flex gap-2">
                            <div className="w-24 shrink-0">
                              <Dropdown
                                isSearchable
                                options={countriesCodeData?.countries.map((country) => ({
                                  label: `+${country.callingCodes[0]}`,
                                  value: `+${country.callingCodes[0]}`,
                                }))}
                                placeholder="+91"
                                value={asstInChargeMobile.countryCode}
                                onChange={(value) => {
                                  setAsstInChargeMobile({ ...asstInChargeMobile, countryCode: value });
                                  setAsstInChargeMobileErrorC("");
                                }}
                                invisible
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <Input
                                placeholder={t("ceremonies.contactNumber")}
                                value={asstInChargeMobile.phone}
                                onChange={(e) => {
                                  setAsstInChargeMobile({ ...asstInChargeMobile, phone: e.target.value });
                                  setAsstInChargeMobileError("");
                                }}
                                invisible
                              />
                            </div>
                          </div>
                        </div>
                        <div aria-hidden="true" />
                      </div>

                      <div className="relative mt-14 before:absolute before:-top-7 before:left-0 before:right-0 before:h-px before:bg-gray-200">
                        <Input
                          // isRequired
                          error={eventNoteError}
                          label={t("headings.notes")}
                          placeholder={t("ceremonies.ceremonyNote")}
                          textarea
                          value={eventNote}
                          onChange={(e) => {
                            setEventNote(e.target.value);
                            setEventNoteError("");
                          }}
                        />
                      </div>

                      <div className="mx-auto mt-10 grid w-8/12 grid-cols-2 gap-7 md:w-full lg:w-8/12 xl:w-8/12">
                        <Button
                          icon={<CheckIcon />}
                          title={data === null ? <>{t("ceremonies.addNewCeremony")}</> : <>{t("ceremonies.updateCeremony")}</>}
                          type="button"
                          loading={btnLoading}
                          onClick={handleSubmit}
                        />
                        <Button icon={<XMarkIcon />} title={t("buttons.cancel")} type="button" buttonColor="bg-red-500" onClick={closeModal} />
                      </div>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default AddCeremoniesModal;
