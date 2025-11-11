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
import { useTranslation } from "react-i18next";

const AddArrivalModal = ({ isOpen, setIsOpen, data, refreshData, setModalData }) => {
  const { t } = useTranslation("common");

  // Context
  const {
    eventSelect,
    setBtnLoading,
    btnLoading,
    openSuccessModal,
    allEvents,
    closeSuccessModel,
    allContact,
    getEventList,
    getContacts,
    allCars,
    getCarListing,
  } = useThemeContext();
  // useState
  const [car, setCar] = useState("");
  const [notes, setNotes] = useState("");
  const [guest, setGuest] = useState(null);
  const [event, setEvent] = useState(null);
  const [arrivingAt, setArrivingAt] = useState(null);
  const [serverError, setServerError] = useState("");
  const [hasArrived, setHasArrived] = useState(false);
  const [arrivingFrom, setArrivingFrom] = useState(null);
  const [numberOfPeople, setNumberOfPeople] = useState("");
  const [allocateToDate, setAllocateToDate] = useState("");
  const [allocateFromDate, setAllocateFromDate] = useState("");
  const [arrivalDateAndTime, setArrivalDateAndtime] = useState("");
  const [arrivalFlightTrainNo, setArrivalFlightTrainNo] = useState("");
  const [carAllocationType, setCarAllocationType] = useState(null);

  // validation states
  const [notesError, setNotesError] = useState("");
  const [guestError, setGuestError] = useState("");
  const [eventError, setEventError] = useState("");
  const [hasArrivedError, setHasArrivedError] = useState("");
  const [arrivingAtError, setArrivingAtError] = useState("");
  const [arrivingFromError, setArrivingFromError] = useState("");
  const [numberOfPeopleError, setNumberOfPeopleError] = useState("");
  const [arrivalDateAndTimeError, setArrivalDateAndtimeError] = useState("");
  const [arrivalFlightTrainNoError, setArrivalFlightTrainNoError] = useState("");

  const [carError, setCarError] = useState("");
  const [allocateToDateError, setAllocateToDateError] = useState("");
  const [allocateFromDateError, setAllocateFromDateError] = useState("");

  // Validatoins
  const isValidForm = () => {
    let isValidData = true;

    if (!guest) {
      setGuestError("Required");
      isValidData = false;
    } else {
      setGuestError("");
    }

    // if (!car) {
    //   setCarError("Required");
    //   isValidData = false;
    // } else {
    //   setCarError("");
    // }

    if (car) {
      if (!allocateFromDate) {
        setAllocateFromDateError("Required");
        isValidData = false;
      } else {
        setAllocateFromDateError("");
      }
    }
    if (car) {
      if (!allocateToDate) {
        setAllocateToDateError("Required");
        isValidData = false;
      } else {
        setAllocateToDateError("");
      }
    }

    // if (event === null) {
    //   setEventError("Required");
    //   isValidData = false;
    // } else {
    //   setEventError("");
    // }

    if (!arrivingAt) {
      setArrivingAtError("Required");
      isValidData = false;
    } else {
      setArrivingAtError("");
    }

    if (!arrivingFrom) {
      setArrivingFromError("Required");
      isValidData = false;
    } else {
      setArrivingFromError("");
    }

    if (!numberOfPeople) {
      setNumberOfPeopleError("Required");
      isValidData = false;
    } else {
      setNumberOfPeopleError("");
    }

    if (!arrivalDateAndTime) {
      setArrivalDateAndtimeError("Required");
      isValidData = false;
    } else {
      setArrivalDateAndtimeError("");
    }

    if (!arrivalFlightTrainNo) {
      setArrivalFlightTrainNoError("Required");
      isValidData = false;
    } else {
      setArrivalFlightTrainNoError("");
    }

    return isValidData;
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidForm()) {
      try {
        setBtnLoading(true);

        let payload = {
          event_id: eventSelect,
          user_id: guest?.value,
          date: toUTCUnixTimestamp(arrivalDateAndTime),
          from: arrivingFrom,
          to: arrivingAt,
          no_of_person: numberOfPeople,
          notes: notes,
          fligh_train_no: arrivalFlightTrainNo,
          status: hasArrived,
          type: "arrival",
          car_allocation_type:carAllocationType?.value,
          car_id: car?.value,
          ...(allocateFromDate &&
            allocateToDate && {
              car_from: toUTCUnixTimestamp(allocateFromDate),
              car_to: toUTCUnixTimestamp(allocateToDate),
            }),
        };

        const response =
          data === null
            ? await ApiServices.arrivalDeparture.addArrivalDeparture(payload)
            : await ApiServices.arrivalDeparture.updateArrivalDeparture(data?.id, payload);

        if (response.data.code === 200) {
          setBtnLoading(false);
          setIsOpen(false);
          setModalData(null);
          setServerError("");
          clearAllData();
          refreshData();
          openSuccessModal({
            title: t("message.success"),
            message: data === null ? t("arrival.arrivalAddedSuccess") : t("arrival.arrivalUpdatedSucess"),
            onClickDone: closeSuccessModel,
          });
        } else {
          setBtnLoading(false);
        }
      } catch (err) {
        console.error("Error:", err);
        setServerError(err.response.data.message);
        setBtnLoading(false);
      } finally {
        setBtnLoading(false);
      }
    } else {
    }
  };

  // Clear States
  const clearAllData = () => {
    setNotes("");
    setGuest(null);
    setEvent(null);
    setNotesError("");
    setGuestError("");
    setEventError("");
    setArrivingAt(null);
    setHasArrived(false);
    setArrivingFrom(null);
    setNumberOfPeople("");
    setArrivingAtError("");
    setHasArrivedError("");
    setArrivingFromError("");
    setArrivalDateAndtime("");
    setNumberOfPeopleError("");
    setArrivalFlightTrainNo("");
    setArrivalDateAndtimeError("");
    setArrivalFlightTrainNoError("");
    setCar("");
    setAllocateFromDate("");
    setAllocateToDate("");
    setCarError("");
    setAllocateFromDateError("");
    setAllocateToDateError("");
    setServerError("");
    setCarAllocationType(null)
  };

  // Close Modal
  const closeModal = () => {
    setIsOpen(false);
    clearAllData();
    setModalData(null);
    setBtnLoading(false);
  };

  // Use Effects
  useEffect(() => {
    if (data !== null) {
      setEvent({ label: data?.event?.name, value: data?.event?.id });
      setGuest({ label: data?.contact?.first_name + " " + data?.contact?.last_name, value: data?.contact?.uuid });
      setArrivingAt(data?.to);
      setArrivingFrom(data?.from);
      setNumberOfPeople(data?.no_of_person);
      setArrivalDateAndtime(moment.unix(data?.date).format("YYYY-MM-DD HH:mm"));
      setArrivalFlightTrainNo(data?.fligh_train_no);
      setNotes(data?.notes);
      setHasArrived(data?.status === 1 ? true : false);
      setCar(data?.car?.make_and_model ? { label: data?.car?.make_and_model, value: data?.car?.id } : "");
      setAllocateFromDate(data?.car_from ? moment.unix(data?.car_from).format("YYYY-MM-DD HH:mm:ss") : "");
      setAllocateToDate(data?.car_to ? moment.unix(data?.car_to).format("YYYY-MM-DD HH:mm:ss") : "");
      setCarAllocationType({
        label:data?.car_allocation_type === "pick_up" ? "Pick Up" : "Drop Off",
        value:data?.car_allocation_type === "pick_up" ? "pick_up": "drop_off"
      })
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      getContacts();
      getCarListing();
    }
  }, [isOpen]);

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
                <Dialog.Panel className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white p-8 shadow-xl transition-all">
                  <div className="mb-10 flex items-center justify-between">
                    <Dialog.Title as="h3" className="font-poppins text-lg font-semibold leading-7 text-secondary-color">
                      {data === null ? t("arrival.addArrival") : t("arrival.updateArrival")}
                    </Dialog.Title>
                    <XMarkIcon onClick={closeModal} className="h-8 w-8 cursor-pointer text-info-color" />
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="h-[600px] overflow-y-auto p-2 md:h-[400px] lg:h-[400px] xl:h-[500px] 2xl:h-[600px]">
                      <div className="mb-5 ltr:text-left rtl:text-right ">
                        <div className="label mb-2 text-secondary">{t("headings.basicInfo")} </div>
                      </div>
                      {/* <Dropdown
                        isRequired
                        title="Events"
                        placeholder="Events"
                        withError={eventError}
                        options={allEvents}
                        value={event}
                        onChange={(e) => {
                          setEvent(e);
                          setEventError("");
                        }}
                      /> */}

                      <div className="mt-5 grid grid-cols-2 gap-7">
                        <Dropdown
                          isRequired
                          title={t("arrival.guestName")}
                          placeholder="Guest Name"
                          options={allContact}
                          withError={guestError}
                          value={guest}
                          onChange={(e) => {
                            setGuest(e);
                            setGuestError("");
                          }}
                        />

                        <Input
                          isRequired
                          type="datetime-local"
                          label={t("arrival.arrivalDateTime")}
                          placeholder="Select Arrival Date & Time"
                          value={arrivalDateAndTime}
                          error={arrivalDateAndTimeError}
                          onChange={(e) => {
                            setArrivalDateAndtime(e.target.value);
                            setArrivalDateAndtimeError("");
                          }}
                        />

                        <Input
                          isRequired
                          label={t("arrival.arrivingFrom")}
                          placeholder="Arriving From"
                          value={arrivingFrom}
                          error={arrivingFromError}
                          onChange={(e) => {
                            setArrivingFrom(e.target.value);
                            setArrivingFromError("");
                          }}
                        />
                        <Input
                          isRequired
                          label={t("arrival.arrivingAt")}
                          placeholder="Arriving At"
                          value={arrivingAt}
                          error={arrivingAtError}
                          onChange={(e) => {
                            setArrivingAt(e.target.value);
                            setArrivingAtError("");
                          }}
                        />
                        <Input
                          isRequired
                          label={t("arrival.flightTrainNo")}
                          placeholder="Flight/Train No"
                          value={arrivalFlightTrainNo}
                          error={arrivalFlightTrainNoError}
                          onChange={(e) => {
                            setArrivalFlightTrainNo(e.target.value);
                            setArrivalFlightTrainNoError("");
                          }}
                        />
                        <Input
                          type="number"
                          isRequired
                          label={t("arrival.noOfPeople")}
                          placeholder="Number of People"
                          value={numberOfPeople}
                          error={numberOfPeopleError}
                          onChange={(e) => {
                            setNumberOfPeople(e.target.value);
                            setNumberOfPeopleError("");
                          }}
                        />

                        <Dropdown
                          // isRequired
                          title={t("arrival.car")}
                          placeholder="Car Name"
                          options={allCars}
                          value={car}
                          // withError={carError}
                          onChange={(e) => {
                            setCar(e);
                            // setCarError("");
                          }}
                        />
                        <Dropdown
                          // isRequired
                          title={"Car Allocation Type"}
                          placeholder="Select"
                          options={[
                            { label: "Pick Up", value: "pick_up" },
                            { label: "Drop Off", value: "drop_off" },
                          ]}
                          value={carAllocationType}
                          onChange={(e) => {
                            setCarAllocationType(e);
                          }}
                        />
                        <Input
                          // isRequired
                          type="datetime-local"
                          label={t("arrival.fromDate")}
                          placeholder="Select Date & Time"
                          value={allocateFromDate}
                          error={car && allocateFromDateError}
                          onChange={(e) => {
                            setAllocateFromDate(e.target.value);
                            setAllocateFromDateError("");
                          }}
                          disabled={!car}
                        />

                        <Input
                          // isRequired
                          type="datetime-local"
                          label={t("arrival.toDate")}
                          placeholder="Select Date & Time"
                          value={allocateToDate}
                          onChange={(e) => {
                            setAllocateToDate(e.target.value);
                            setAllocateToDateError("");
                          }}
                          error={car && allocateToDateError}
                          min={allocateFromDate}
                          disabled={!allocateFromDate}
                        />
                      </div>
                      <div className="my-5 ltr:text-left rtl:text-right ">
                        <div className="label mb-2 text-secondary">{t("headings.otherInfo")}</div>
                      </div>
                      <div className="mt-5">
                        <Input
                          label={t("headings.notes")}
                          placeholder="Notes"
                          error={notesError}
                          textarea
                          value={notes}
                          onChange={(e) => {
                            setNotes(e.target.value);
                            setNotesError("");
                          }}
                        />
                      </div>

                      <div className="mt-2 ltr:text-left rtl:text-right">
                        <input
                          isRequired
                          type="checkbox"
                          id="remember"
                          name="remember"
                          checked={hasArrived}
                          onChange={(e) => {
                            setHasArrived(e.target.checked);
                            setHasArrivedError("");
                          }}
                        />
                        <label for="remember" className="label ps-2">
                          {t("arrival.hasArrived")}
                          {hasArrivedError && <span className="text-xs text-red-500">* {hasArrivedError}</span>}
                        </label>
                      </div>

                      {serverError && <span className="text-xs text-red-500">{serverError}</span>}

                      <div className="mx-auto mt-10 flex justify-center gap-7">
                        <Button
                          loading={btnLoading}
                          icon={<CheckIcon />}
                          title={data === null ? t("arrival.addArrival") : t("arrival.updateArrival")}
                          type="submit"
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

export default AddArrivalModal;
