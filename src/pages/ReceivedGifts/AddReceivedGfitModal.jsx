import React from "react";
import ApiServices from "../../api/services";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Dropdown from "../../components/common/Dropdown";
import DateAndTime from "../../components/common/DateAndTime";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { useThemeContext } from "../../context/GlobalContext";
import { getLocalDateFromUnixTimestamp, toUTCUnixTimestamp } from "../../utilities/HelperFunctions";
import moment from "moment";
import { useTranslation } from "react-i18next";

const AddReceivedGfitModal = ({ label, isOpen, setIsOpen, refreshData, data, setModalData }) => {
  // translation
  const { t } = useTranslation("common");

  // useContext
  const {
    eventSelect,
    allEvents,
    allContact,
    allGifts,
    openSuccessModal,
    closeSuccessModel,
    setBtnLoading,
    btnLoading,
    getEventList,
    getContacts,
    getGifts,
  } = useThemeContext();

  // useState

  const [note, setNote] = useState("");
  const [receviedOn, setReceivedOn] = useState("");
  const [noteSentOn, setNoteSentOn] = useState("");
  const [receivedGfit, setReceivedGfit] = useState("");
  const [eventName, setEventName] = useState("");
  const [receivedGfitFrom, setReceivedGfitFrom] = useState("");

  // validation states
  const [noteError, setNoteError] = useState("");
  const [eventNameError, setEventNameError] = useState("");
  const [receviedOnError, setReceviedOnError] = useState("");
  const [noteSentOnError, setNoteSentOnError] = useState("");
  const [receivedGfitError, setReceivedGfitError] = useState("");
  const [receivedGfitFromError, setReceivedGfitFromError] = useState("");
  const [message, setMessage] = useState("");

  // function to validate states
  const isValidForm = () => {
    let isValidData = true;
    // if (!note) {
    //   setNoteError("Required");
    //   isValidData = false;
    // } else {
    //   setNoteError("");
    // }
    // if (!eventName) {
    //   setEventNameError("Required");
    //   isValidData = false;
    // } else {
    //   setEventNameError("");
    // }
    if (!receviedOn) {
      setReceviedOnError("Required");
      isValidData = false;
    } else {
      setReceviedOnError("");
    }

    if (!noteSentOn) {
      setNoteSentOnError("Required");
      isValidData = false;
    } else {
      setNoteSentOnError("");
    }
    if (!receivedGfit) {
      setReceivedGfitError("Required");
      isValidData = false;
    } else {
      setReceivedGfitError("");
    }
    if (!receivedGfitFrom) {
      setReceivedGfitFromError("Required");
      isValidData = false;
    } else {
      setReceivedGfitFromError("");
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
            user_id: receivedGfitFrom?.value,
            event_id: eventSelect,
            // gift_id: receivedGfit?.value,
            gift_received: receivedGfit,
            received_on: toUTCUnixTimestamp(receviedOn),
            notes: note,
            note_send_at: toUTCUnixTimestamp(noteSentOn),
          };
          const response = await ApiServices.receivedGift.addReceivedGifts(payload);

          if (response.data.code === 200) {
            setMessage("");
            setBtnLoading(false);
            setIsOpen(false);
            setModalData(null);
            clearAllData();
            refreshData();
            openSuccessModal({
              title: t("message.success"),
              message: t("receivedGifts.receivedGiftAddedSuccess"),
              onClickDone: (close) => {
                closeSuccessModel();
              },
            });
          } else {
            setBtnLoading(false);
          }
        } catch (err) {
          // setError(err?.response?.data?.message);
          setMessage(err?.response?.data?.message);
          setBtnLoading(false);
        }
      } else {
        try {
          setBtnLoading(true);
          let payload = {
            user_id: receivedGfitFrom?.value,
            event_id: eventSelect,
            // gift_id: receivedGfit?.value,
            gift_received: receivedGfit,
            received_on: toUTCUnixTimestamp(receviedOn),
            notes: note,
            note_send_at: toUTCUnixTimestamp(noteSentOn),
          };

          const response = await ApiServices.receivedGift.updateReceivedGifts(data?.id, payload);

          if (response.data.code === 200) {
            setMessage("");
            setBtnLoading(false);
            setIsOpen(false);
            setModalData(null);
            clearAllData();
            refreshData();
            openSuccessModal({
              title: t("message.success"),
              message: t("receivedGifts.receivedGiftUpdatedSucess"),
              onClickDone: (close) => {
                closeSuccessModel();
              },
            });
          } else {
            setBtnLoading(false);
          }
        } catch (err) {
          setMessage(err?.response?.data?.message);
          setBtnLoading(false);
        }
      }
    }
  };

  // Clear States
  const clearAllData = () => {
    setNote("");
    setNoteError("");
    setMessage("");
    setReceivedOn("");
    setNoteSentOn("");
    setReceivedGfit("");
    setReceivedGfitFrom("");
    setReceviedOnError("");
    setNoteSentOnError("");
    setEventName(null);
    setEventNameError("");
    setReceivedGfitError("");
    setReceivedGfitFromError("");
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
      setNote(data?.notes);
      setReceivedGfitFrom({ label: data?.contact?.first_name + " " + data?.contact?.last_name, value: data?.contact?.uuid });
      setReceivedGfit(data?.gift_received);
      setEventName({ label: data?.event?.name, value: data?.event?.id });
      // setReceivedOn(getLocalDateFromUnixTimestamp(data?.received_on));
      // setNoteSentOn(getLocalDateFromUnixTimestamp(data?.note_send_at));
      setReceivedOn(moment.unix(data?.received_on).format("YYYY-MM-DD HH:mm"));
      setNoteSentOn(moment.unix(data?.note_send_at).format("YYYY-MM-DD HH:mm"));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      getContacts();
      getGifts();
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
                      {data === null ? t("receivedGifts.addReceivedGifts") : t("receivedGifts.updateReceivedGift")}
                    </Dialog.Title>
                    <XMarkIcon onClick={closeModal} className="h-8 w-8 cursor-pointer text-info-color" />
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className=" h-[400px] overflow-y-auto p-2 md:h-[500px] lg:h-[500px] xl:h-[500px] 2xl:h-[500px]">
                      <div className="grid grid-cols-2 gap-7">
                        {/* <Dropdown
                          isRequired
                          title="Event"
                          placeholder="Name"
                          value={eventName}
                          options={allEvents}
                          withError={eventNameError}
                          onChange={(e) => {
                            setEventName(e);
                            setEventNameError("");
                          }}
                        /> */}
                        <Dropdown
                          isRequired
                          title={t("receivedGifts.receivedGiftFrom")}
                          placeholder={t("receivedGifts.receivedGiftFrom")}
                          options={allContact}
                          value={receivedGfitFrom}
                          withError={receivedGfitFromError}
                          onChange={(e) => {
                            setReceivedGfitFrom(e);
                            setReceivedGfitFromError("");
                          }}
                        />

                        <Input
                          isRequired
                          label={t("receivedGifts.receivedGift")}
                          placeholder={t("receivedGifts.receivedGift")}
                          value={receivedGfit}
                          // options={allGifts}
                          error={receivedGfitError}
                          onChange={(e) => {
                            setReceivedGfit(e.target.value);
                            setReceivedGfitError("");
                          }}
                        />

                        <Input
                          isRequired
                          type="datetime-local"
                          label={t("receivedGifts.receivedOn")}
                          placeholder={t("receivedGifts.receivedOn")}
                          value={receviedOn}
                          error={receviedOnError}
                          onChange={(e) => {
                            setReceivedOn(e.target.value);
                            setReceviedOnError("");
                          }}
                        />

                        <Input
                          isRequired
                          type="datetime-local"
                          label={t("receivedGifts.thankYouNoteSentOn")}
                          placeholder={t("receivedGifts.thankYouNoteSentOn")}
                          value={noteSentOn}
                          error={noteSentOnError}
                          onChange={(e) => {
                            setNoteSentOn(e.target.value);
                            setNoteSentOnError("");
                          }}
                        />

                        {/* <DateAndTime
                          isRequired
                          dateAndTime={receviedOn}
                          setDateAndTime={setReceivedOn}
                          label="Received On"
                          error={receviedOnError}
                          setError={setNoteSentOnError}
                        /> */}

                        {/* <DateAndTime
                          isRequired
                          dateAndTime={noteSentOn}
                          setDateAndTime={setNoteSentOn}
                          label="Thank you note sent on"
                          error={noteSentOnError}
                          setError={setNoteSentOnError}
                        /> */}
                      </div>
                      <div className="mt-5 text-left ">
                        <h2 className="label mb-2 text-secondary">{t("headings.basicInfo")}</h2>
                      </div>
                      <div className="mt-5">
                        <Input
                          // isRequired
                          error={noteError}
                          label={t("headings.notes")}
                          placeholder={t("headings.notes")}
                          textarea
                          value={note}
                          onChange={(e) => {
                            setNote(e.target.value);
                            setNoteError("");
                          }}
                        />
                      </div>

                      {/* message */}
                      <div className="flex justify-center">
                        <p className="text-sm text-red-500">{message}</p>
                      </div>
                      <div className="mx-auto mt-20 grid w-10/12 grid-cols-2 gap-7">
                        <Button
                          icon={<CheckIcon />}
                          title={data === null ? t("receivedGifts.addReceivedGifts") : t("receivedGifts.updateReceivedGift")}
                          type="submit"
                          loading={btnLoading}
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

export default AddReceivedGfitModal;
