import React from "react";
import ApiServices from "../../api/services";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import InputTags from "../../components/common/InputTags";
import { useThemeContext } from "../../context/GlobalContext";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

const AddGfitModal = ({ isOpen, setIsOpen, refreshData, data, setModalData }) => {
  // translation
  const { t } = useTranslation("common");

  // Context
  const { eventSelect, setBtnLoading, btnLoading, openSuccessModal, closeSuccessModel } = useThemeContext();

  // useStates
  const [giftName, setGiftName] = useState("");
  const [giftValue, setGiftValue] = useState("");
  const [giftNote, setGiftNote] = useState("");
  const [selectedValue, setSelectedValue] = useState([]);

  // Error
  const [giftNoteError, setGiftNoteError] = useState("");
  const [giftNameError, setGiftNameError] = useState("");
  const [giftValueError, setGiftValueError] = useState("");
  const [selectedValueError, setSelectedValueError] = useState("");

  const isValidForm = () => {
    let isValidData = true;
    if (giftName === "") {
      setGiftNameError(" Required");
      isValidData = false;
    }
    // if (giftValue === "") {
    //   setGiftValueError(" Required");
    //   isValidData = false;
    // }
    // if (selectedValue.length === 0) {
    //   setSelectedValueError("Required");
    //   isValidData = false;
    // }

    // if (giftNote === "") {
    //   setGiftNoteError(" Required");
    //   isValidData = false;
    // }

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
            name: giftName,
            value: giftValue,
            tags: selectedValue,
            description: giftNote,
            event_id: eventSelect,
          };

          const response = await ApiServices.gifts.addGift(payload);

          if (response.data.code === 200) {
            setBtnLoading(false);
            setIsOpen(false);
            setModalData(null);
            clearAllData();
            refreshData();
            openSuccessModal({
              title: "Success!",
              message: "Gift has been added successfully",
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
        }
      } else {
        try {
          setBtnLoading(true);

          let payload = {
            name: giftName,
            value: giftValue,
            tags: selectedValue,
            description: giftNote,
            event_id: eventSelect,
          };

          const response = await ApiServices.gifts.updateGift(data?.id, payload);

          if (response.data.code === 200) {
            setBtnLoading(false);
            setIsOpen(false);
            setModalData(null);
            clearAllData();
            refreshData();
            openSuccessModal({
              title: "Success!",
              message: "Gift has been updated successfully",
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
        }
      }
    }
  };

  // Clear States
  const clearAllData = () => {
    setModalData(null);
    setGiftNote("");
    setGiftName("");
    setGiftValue("");
    setSelectedValue([]);

    setGiftNameError("");
    setGiftNoteError("");
    setGiftValueError("");
    setSelectedValueError("");
  };

  // Use Effects
  useEffect(() => {
    if (data !== null) {
      setGiftName(data?.name);
      setGiftValue(data?.value);
      setSelectedValue(data?.tags);
      setGiftNote(data?.description);
    }
  }, [isOpen]);

  // Close Modal
  const closeModal = () => {
    setIsOpen(false);
    clearAllData();
    setModalData(null);
    setBtnLoading(false);
  };

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
            <div className="flex min-h-full items-center justify-center p-4">
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
                      {data === null ? t("gift.addNewGift") : t("gift.updateGift")}
                    </Dialog.Title>
                    <XMarkIcon onClick={closeModal} className="h-8 w-8 cursor-pointer text-info-color" />
                  </div>

                  <form>
                    <div className=" h-[600px] overflow-y-auto p-2 md:h-[400px] lg:h-[400px] xl:h-[500px] 2xl:h-[480px]">
                      <div className="mb-5 ltr:text-left rtl:text-right">
                        <h2 className="label mb-2 text-secondary">{t("headings.basicInfo")}</h2>
                      </div>

                      <div className="grid grid-cols-2 gap-7">
                        <Input
                          isRequired
                          error={giftNameError}
                          label={t("gift.giftName")}
                          placeholder={t("gift.giftName")}
                          value={giftName}
                          onChange={(e) => {
                            setGiftName(e.target.value);
                            setGiftNameError("");
                          }}
                        />
                        <Input
                          label={t("gift.giftValue")}
                          placeholder={t("gift.giftValue")}
                          value={giftValue}
                          onChange={(e) => {
                            setGiftValue(e.target.value);
                          }}
                        />
                      </div>

                      <div className="mb-5 mt-5 ltr:text-left rtl:text-right">
                        <h2 className="label mb-2 text-secondary">{t("headings.otherInfo")}</h2>
                      </div>
                      <div className="mt-5">
                        <InputTags label={t("gift.tags")} selected={selectedValue} setSelected={setSelectedValue} name="tags" />
                      </div>
                      <div className="mt-5">
                        <Input
                          error={giftNoteError}
                          label={t("headings.notes")}
                          placeholder="Gift Notes"
                          textarea
                          value={giftNote}
                          onChange={(e) => {
                            setGiftNote(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="mx-auto mt-10 grid w-8/12 grid-cols-2 gap-7">
                      <Button
                        icon={<CheckIcon />}
                        title={data === null ? t("gift.addNewGift") : t("gift.updateGift")}
                        type="button"
                        loading={btnLoading}
                        onClick={handleSubmit}
                      />
                      <Button icon={<XMarkIcon />} title={t("buttons.cancel")} type="button" buttonColor="bg-red-500" onClick={closeModal} />
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

export default AddGfitModal;
