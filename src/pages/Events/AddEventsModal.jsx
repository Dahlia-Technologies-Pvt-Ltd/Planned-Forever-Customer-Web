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


const AddEventsModal = ({ isOpen, setIsOpen, refreshData, data, setModalData }) => {
  
  const { t: commonT } = useTranslation("common");
  
  // Context
  const { allVenues, getVenueList } = useThemeContext();

  // useStates
  const [venue, setVenue] = useState(null);
  const [eventNote, setEventNote] = useState("");
  const [eventName, setEventName] = useState("");
  const [venueError, setVenueError] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const [eventNameError, setEventNameError] = useState("");
  const [eventNoteError, setEventNoteError] = useState("");
  const [endDateAndTime, setEndDateAndTime] = useState("");
  const [startDateAndTime, setStartDateAndTime] = useState("");
  const [endDateAndTimeError, setEndDateAndtimeError] = useState("");
  const [startDateAndTimeError, setStartDateAndtimeError] = useState("");

  const isValidForm = () => {
    let isValidData = true;
    if (eventName === "") {
      setEventNameError(" Required");
      isValidData = false;
    }
    if (venue === null) {
      setVenueError(" Required");
      isValidData = false;
    }

    if (!startDateAndTime) {
      setStartDateAndtimeError(" Required");
      isValidData = false;
    }
    if (!endDateAndTime) {
      setEndDateAndtimeError(" Required");
      isValidData = false;
    }
    return isValidData;
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidForm()) {
      if (data === null) {
        try {
          setBtnLoading(true);

          let payload = {
            name: eventName,
            venue_id: venue?.value,
            start_date: toUTCUnixTimestamp(startDateAndTime),
            end_date: toUTCUnixTimestamp(endDateAndTime),
            description: eventNote,
          };

          const response = await ApiServices.events.addEvent(payload);

          if (response.data.code === 200) {
            setBtnLoading(false);
            setIsOpen(false);
            setModalData(null);
            clearAllData();
            refreshData();
          } else {
            setBtnLoading(false);
          }
        } catch (err) {
          setError(err?.response?.data?.message);
          setBtnLoading(false);
        }
      } else {
        try {
          setBtnLoading(true);

          let payload = {
            name: eventName,
            venue_id: venue?.value,
            start_date: toUTCUnixTimestamp(startDateAndTime),
            end_date: toUTCUnixTimestamp(endDateAndTime),
            description: eventNote,
          };

          const response = await ApiServices.events.updateEvent(data?.id, payload);

          if (response.data.code === 200) {
            setBtnLoading(false);
            setIsOpen(false);
            setModalData(null);
            clearAllData();
            refreshData();
          } else {
            setBtnLoading(false);
          }
        } catch (err) {
          setError(err?.response?.data?.message);
          setBtnLoading(false);
        }
      }
    }
  };

  // Clear States
  const clearAllData = () => {
    setEventName("");
    setVenue(null);
    setStartDateAndTime();
    setEndDateAndTime();
    setEventNote("");
    setEndDateAndtimeError("");
    setEventNoteError("");
    setEventNameError("");
    setStartDateAndtimeError("");
    setVenueError("");
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
      setEventName(data?.name);
      setVenue({ label: data?.venue?.name, value: data?.venue?.id });
      setStartDateAndTime(moment.unix(data?.start_date).format("YYYY-MM-DD HH:mm:ss"));
      setEndDateAndTime(moment.unix(data?.end_date).format("YYYY-MM-DD HH:mm:ss"));
      setEventNote(data?.description);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      getVenueList();
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
                  <div className="mb-5 flex items-center justify-between">
                    <Dialog.Title as="h3" className="font-poppins text-lg font-semibold leading-7 text-secondary-color">
                      {data === null ? "Add New Event" : "Update Event"}
                    </Dialog.Title>
                    <XMarkIcon onClick={closeModal} className="h-8 w-8 cursor-pointer text-info-color" />
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="h-[600px] overflow-y-auto p-2 md:h-[400px] lg:h-[400px] xl:h-[500px] 2xl:h-[600px]">
                      <div className="mb-5 text-left ">
                        <div>
                          <div className="label mb-2 text-secondary">Basic Information</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-7">
                        <Input
                          isRequired
                          label="Event Name"
                          placeholder="Event Name"
                          error={eventNameError}
                          value={eventName}
                          onChange={(e) => {
                            setEventName(e.target.value);
                            setEventNameError("");
                          }}
                        />

                        <Dropdown
                          isRequired
                          title="Venue"
                          placeholder="Venue"
                          withError={venueError}
                          options={allVenues}
                          value={venue}
                          onChange={(e) => {
                            setVenue(e);
                            setVenueError("");
                          }}
                        />

                        <Input
                          isRequired
                          type="datetime-local"
                          label="Start Date & Time"
                          placeholder="Select Start Date & Time"
                          value={startDateAndTime}
                          error={startDateAndTimeError}
                          onChange={(e) => {
                            setStartDateAndTime(e.target.value);
                            setStartDateAndtimeError("");
                          }}
                        />

                        <Input
                          isRequired
                          type="datetime-local"
                          label="End Date & Time"
                          placeholder="Select End Date & Time"
                          value={endDateAndTime}
                          error={endDateAndTimeError}
                          onChange={(e) => {
                            setEndDateAndTime(e.target.value);
                            setEndDateAndtimeError("");
                          }}
                          min={startDateAndTime}
                          disabled={!startDateAndTime}
                        />
                      </div>

                      <div className="mt-5 text-left ">
                        <div>
                          <div className="label mb-2 text-secondary">Other Information</div>
                        </div>
                      </div>

                      <div className="mt-5">
                        <Input
                          label="Event Note"
                          placeholder="Event Note"
                          textarea
                          error={eventNoteError}
                          value={eventNote}
                          onChange={(e) => {
                            setEventNote(e.target.value);
                            setEventNoteError("");
                          }}
                        />
                      </div>

                      <div className="mx-auto mt-10 grid w-8/12 grid-cols-2 gap-7">
                        <Button icon={<CheckIcon />} title={data === null ? "Add Event" : "Update Event"} type="submit" loading={btnLoading} />
                        <Button icon={<XMarkIcon />} title="Cancel" type="button" buttonColor="bg-red-500" onClick={closeModal} />
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

export default AddEventsModal;
