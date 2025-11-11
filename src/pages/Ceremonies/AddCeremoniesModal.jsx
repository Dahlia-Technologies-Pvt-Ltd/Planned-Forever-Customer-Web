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
  const [inChargeMobile, setInChargeMobile] = useState({ countryCode: "", phone: "" });
  const [endDateAndTime, setEndDateAndTime] = useState("");
  const [asstInChargeName, setAsstInChargeName] = useState("");
  const [startDateAndTime, setStartDateAndTime] = useState("");
  const [asstInChargeMobile, setAsstInChargeMobile] = useState({ countryCode: "", phone: "" });

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
    if (inChargeName === "") {
      setInChargeNameError(" Required");
      isValidData = false;
    }
    if (inChargeMobile.phone === "") {
      setInChargeMobileError(" Required");
      isValidData = false;
    }
    if (inChargeMobile.countryCode === "") {
      setInChargeMobileErrorC(" Required");
      isValidData = false;
    }
    // if (asstInChargeName === "") {
    //   setAsstInChargeNameError(" Required");
    //   isValidData = false;
    // }
    // if (asstInChargeMobile.phone === "") {
    //   setAsstInChargeMobileError(" Required");
    //   isValidData = false;
    // }
    // if (asstInChargeMobile?.countryCode === "") {
    //   setAsstInChargeMobileErrorC(" Required");
    //   isValidData = false;
    // }

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
          event_id: event?.value,
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
    setInChargeMobile({ countryCode: "", phone: "" });
    setEventNoteError("");
    setStartDateAndTime("");
    setAsstInChargeName("");
    setInChargeNameError("");
    setCeremonyNameError("");
    setAsstInChargeMobile({ countryCode: "", phone: "" });
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
        countryCode: { label: data?.incharge_contact_number?.code, value: data?.incharge_contact_number?.code },
        phone: data?.incharge_contact_number?.phone_number,
      });
      setAsstInChargeMobile({
        countryCode: { label: data?.asst_incharge_contact_number?.code, value: data?.asst_incharge_contact_number?.code },
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
                <Dialog.Panel className="overflow-hidden p-8 w-full max-w-4xl bg-white rounded-2xl shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-5">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-7 font-poppins text-secondary-color">
                      {data === null ? <>{t("ceremonies.addNewCeremony")}</> : <>{t("ceremonies.updateCeremony")}</>}
                    </Dialog.Title>
                    <XMarkIcon onClick={closeModal} className="w-8 h-8 cursor-pointer text-info-color" />
                  </div>

                  <form>
                    <div className=" h-[600px] overflow-y-scroll p-2 md:h-[400px] lg:h-[400px] xl:h-[500px] 2xl:h-[600px]">
                      <div className="mb-5 ltr:text-left rtl:text-right">
                        <div>
                          <div className="mb-2 label text-secondary">{t("headings.basicInfo")}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-7">
                        <Input
                          label={t("ceremonies.ceremonyName")}
                          placeholder="Ceremony Name"
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
                          title="Events"
                          placeholder="Events"
                          withError={eventError}
                          options={allEvents}
                          value={event}
                          onChange={(selectedEvent) => handleEventChange(selectedEvent)}
                        /> */}

                        <Dropdown
                          isRequired
                          title={t("ceremonies.venue")}
                          placeholder="Venue"
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
                          placeholder="Held At"
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
                          placeholder="Dress Code"
                          value={dressCode}
                          onChange={(e) => {
                            setDressCode(e.target.value);
                          }}
                        />

                        <Input
                          isRequired
                          type="datetime-local"
                          label={t("ceremonies.startDateAndTime")}
                          placeholder="Select Start Date & Time"
                          value={startDateAndTime ? startDateAndTime : ""}
                          error={startDateAndTimeError}
                          onChange={(e) => {
                            setStartDateAndTime(e.target.value);
                            setStartDateAndTimeError("");
                          }}
                          min={moment.unix(eventDetail?.start_date).format("YYYY-MM-DDTHH:mm")}
                          max={moment.unix(eventDetail?.end_date).format("YYYY-MM-DDTHH:mm")}
                        />

                        {console.log("a", moment.unix(eventDetail?.start_date).format("YYYY-MM-DDTHH:mm"))}

                        <Input
                          isRequired
                          type="datetime-local"
                          label={t("ceremonies.endDateAndTime")}
                          placeholder="Select End Date & Time"
                          value={endDateAndTime}
                          error={endDateAndTimeError}
                          onChange={(e) => {
                            setEndDateAndTime(e.target.value);
                            setEndDateAndTimeError("");
                          }}
                          min={startDateAndTime || ""}
                          max={moment.unix(eventDetail?.end_date).format("YYYY-MM-DDTHH:mm")}
                          disabled={!startDateAndTime || !eventSelect}
                        />
                      </div>

                      <div className="my-7 ltr:text-left rtl:text-right">
                        <h2 className="label text-secondary">{t("headings.otherInfo")}</h2>
                      </div>

                      <div className="grid grid-cols-3 gap-7">
                        <Input
                          isRequired
                          error={inChargeNameError}
                          label={t("ceremonies.personIncharge")}
                          placeholder="Person Incharge Name"
                          value={inChargeName}
                          onChange={(e) => {
                            setInChargeName(e.target.value);
                            setInChargeNameError("");
                          }}
                        />

                        <Dropdown
                          isSearchable
                          options={countriesCodeData?.countries.map((country) => ({
                            label: `+${country.callingCodes[0]} ${country.name}`,
                            value: `+${country.callingCodes[0]} ${country.name}`,
                          }))}
                          placeholder="Country Code"
                          value={inChargeMobile.countryCode}
                          onChange={(e) => {
                            setInChargeMobile({ ...inChargeMobile, countryCode: e });
                            setInChargeMobileErrorC("");
                          }}
                          title={t("ceremonies.countryCode")}
                          withError={inChargeMobileErrorC}
                          isRequired
                        />
                        <Input
                          isRequired
                          error={inChargeMobileError}
                          label={t("ceremonies.contactNumber")}
                          placeholder="Contact Number"
                          value={inChargeMobile.phone}
                          onChange={(e) => {
                            setInChargeMobile({ ...inChargeMobile, phone: e.target.value });
                            setInChargeMobileError("");
                          }}
                        />

                        {/* <Input
                          isRequired
                          error={inChargeMobileError}
                          label="Person Incharge Mobile"
                          placeholder="Person Incharge Mobile"
                          value={inChargeMobile}
                          onChange={(e) => {
                            setInChargeMobile(e.target.value);
                            setInChargeMobileError("");
                          }}
                        />  */}

                        <Input
                          // isRequired
                          // error={asstInChargeNameError}
                          label={t("ceremonies.asstPersonIncharge")}
                          placeholder="Asst Person Incharge Name"
                          value={asstInChargeName}
                          onChange={(e) => {
                            setAsstInChargeName(e.target.value);
                            setAsstInChargeNameError("");
                          }}
                        />

                        <Dropdown
                          isSearchable
                          options={countriesCodeData?.countries.map((country) => ({
                            label: `+${country.callingCodes[0]} ${country.name}`,
                            value: `+${country.callingCodes[0]} ${country.name}`,
                          }))}
                          placeholder="Country Code"
                          value={asstInChargeMobile.countryCode}
                          onChange={(e) => {
                            setAsstInChargeMobile({ ...asstInChargeMobile, countryCode: e });
                            setAsstInChargeMobileErrorC("");
                          }}
                          title={t("ceremonies.countryCode")}
                          // withError={asstInChargeMobileErrorC}
                          // isRequired
                        />
                        <Input
                          // isRequired
                          // error={asstInChargeMobileError}
                          label={t("ceremonies.contactNumber")}
                          placeholder="Contact Number"
                          value={asstInChargeMobile.phone}
                          onChange={(e) => {
                            setAsstInChargeMobile({ ...asstInChargeMobile, phone: e.target.value });
                            setAsstInChargeMobileError("");
                          }}
                        />

                        {/* <Input
                          isRequired
                          error={asstInChargeMobileError}
                          label="Asst Person Incharge Mobile"
                          placeholder="Asst Person Incharge Mobile"
                          value={asstInChargeMobile}
                          onChange={(e) => {
                            setAsstInChargeMobile(e.target.value);
                            setAsstInChargeMobileError("");
                          }}
                        /> */}
                      </div>

                      <div className="mt-5">
                        <Input
                          // isRequired
                          error={eventNoteError}
                          label={t("headings.notes")}
                          placeholder="Ceremony Note"
                          textarea
                          value={eventNote}
                          onChange={(e) => {
                            setEventNote(e.target.value);
                            setEventNoteError("");
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-7 mx-auto mt-10 w-9/12">
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
