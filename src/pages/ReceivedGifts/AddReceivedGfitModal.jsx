import React from "react";
import ApiServices from "../../api/services";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Dropdown from "../../components/common/Dropdown";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { useThemeContext } from "../../context/GlobalContext";
import { toUTCUnixTimestamp } from "../../utilities/HelperFunctions";
import moment from "moment";
import { useTranslation } from "react-i18next";

const AddReceivedGfitModal = ({ label, isOpen, setIsOpen, refreshData, data, setModalData }) => {
  // translation
  const { t } = useTranslation("common");

  // useContext
  const {
    eventSelect,
    allContact,
    openSuccessModal,
    closeSuccessModel,
    setBtnLoading,
    btnLoading,
    getContacts,
  } = useThemeContext();

  // useState

  const [note, setNote] = useState("");
  const [receviedOn, setReceivedOn] = useState("");
  const [receivedGfit, setReceivedGfit] = useState("");
  const [receivedGfitFrom, setReceivedGfitFrom] = useState("");

  // validation states
  const [noteError, setNoteError] = useState("");
  const [receviedOnError, setReceviedOnError] = useState("");
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
    if (!receviedOn) {
      setReceviedOnError("Required");
      isValidData = false;
    } else {
      setReceviedOnError("");
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
    setReceivedGfit("");
    setReceivedGfitFrom("");
    setReceviedOnError("");
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
      setReceivedOn(moment.unix(data?.received_on).format("YYYY-MM-DD HH:mm"));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      getContacts();
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

                  <form onSubmit={handleSubmit} className="[&_.label]:text-xs [&_.label]:font-medium [&_input]:h-9 [&_input]:min-h-[36px] [&_input]:text-sm [&_input]:py-1 [&_input[type='datetime-local']]:h-9 [&_textarea]:text-sm [&_.css-b62m3t-container]:text-sm [&_.css-13cymwt-control]:h-9 [&_.css-13cymwt-control]:min-h-[36px] [&_.css-13cymwt-control]:py-0 [&_.css-t3ipsp-control]:h-9 [&_.css-t3ipsp-control]:min-h-[36px] [&_.css-t3ipsp-control]:py-0 [&_.css-hlgwow]:h-9 [&_.css-hlgwow]:min-h-[36px] [&_.css-hlgwow]:py-0 [&_.css-hlgwow]:px- [&_.css-1jqq78o-placeholder]:text-sm [&_.css-1jqq78o-placeholder]:leading-none [&_.css-1dimb5e-singleValue]:text-sm [&_.css-1dimb5e-singleValue]:leading-none [&_.css-1wy0on6]:h-9 [&_.css-19bb58m]:my-0">
                    <div className=" h-[400px] overflow-y-auto p-2 md:h-[500px] lg:h-[500px] xl:h-[500px] 2xl:h-[500px]">
                      <div className="grid grid-cols-2 gap-7">
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
