import React from "react";
import ApiServices from "@api";
import { useThemeContext } from "@context";
import Input from "@components/common/Input";
import Button from "@components/common/Button";
import Dropdown from "@components/common/Dropdown";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import InputTags from "../../../components/common/InputTags";
import { useTranslation } from "react-i18next";

const AddCustomFieldDetail = ({ isOpen, setIsOpen, refreshData, editMode, data }) => {
  const { t } = useTranslation("common");

  //
  // Context
  const { eventSelect, btnLoading, setBtnLoading, openSuccessModal, closeSuccessModel, allType2CategoryList } = useThemeContext();

  console.log({ data });

  // useStates
  const [customField, setCustomField] = useState("");
  const [customFieldError, setCustomFieldError] = useState("");

  // const [selectedValue, setSelectedValue] = useState([]);
  // const [selectedValueError, setSelectedValueError] = useState("");

  const [customFieldDetailName, setCustomFieldDetailName] = useState([]);
  const [customFieldDetailNameError, setCustomFieldDetailNameError] = useState("");

  // Form Validation
  const isValidForm = () => {
    let isValidData = true;

    if (customField === "") {
      setCustomFieldError(" Required");
      isValidData = false;
    }

    if (customFieldDetailName?.length === 0) {
      setCustomFieldDetailNameError(" Required");
      isValidData = false;
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
          name: customField,
          detail: customFieldDetailName.map((name, index) => ({
            id: index + 1,
            name: name,
          })),
          event_id: eventSelect,
        };

        console.log({ customFieldDetailName });

        const response =
          data === null
            ? await ApiServices.Custom_Field_Type.addCustomFieldType(payload)
            : await ApiServices.Custom_Field_Type.updateCustomFieldType(data?.id, payload);

        if (response.data.code === 200) {
          setBtnLoading(false);
          setIsOpen(false);
          refreshData();
          openSuccessModal({
            title: t("messages.success"),
            message:
              data === null
                ? t("customFieldTypeDetail.customFieldTypeDetailAddedSuccess")
                : t("customFieldTypeDetail.customFieldTypeDetailUpdatedSucess"),
            onClickDone: closeSuccessModel,
          });
        } else {
          setBtnLoading(false);
        }
      } catch (err) {
        console.error("Error:", err);
        setBtnLoading(false);
      }
    } else {
    }
  };

  // close modal
  const closeModal = () => {
    setIsOpen(false);
    setCustomField("");
    setBtnLoading(false);
    setCustomFieldError("");
    setCustomFieldDetailName([]);
    setCustomFieldDetailNameError("");
  };

  // Use Effects
  useEffect(() => {
    if (data && isOpen && editMode) {
      setCustomField(data?.name);
      setCustomFieldDetailName(data?.detail?.map((item) => item.name));
    }
  }, [isOpen, editMode, data]);

  console.log({ customFieldDetailName });

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
                <Dialog.Panel className="w-full max-w-3xl rounded-2xl bg-white p-8 shadow-xl transition-all">
                  <div className="mb-5 flex items-center justify-between">
                    <Dialog.Title as="h3" className="font-poppins text-lg font-semibold leading-7 text-secondary-color">
                      {data === null ? t("customFieldTypeDetail.customFieldTypeDetail") : t("customFieldTypeDetail.updateCustomFieldDetail")}
                    </Dialog.Title>
                    <XMarkIcon onClick={closeModal} className="h-8 w-8 cursor-pointer text-info-color" />
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5 text-left">
                    {/* <Dropdown
                      isRequired
                      title="Custom Field"
                      placeholder="Custom Field"
                      withError={customFieldError}
                      options={allType2CategoryList}
                      value={customField}
                      onChange={(e) => {
                        setCustomField(e);
                        setCustomFieldError("");
                      }}
                    /> */}

                    <Input
                      isRequired
                      label={t("customFieldTypeDetail.customFieldType")}
                      placeholder={t("customFieldTypeDetail.customFieldType")}
                      value={customField}
                      error={customFieldError}
                      onChange={(e) => {
                        setCustomField(e.target.value);
                        setCustomFieldError("");
                      }}
                    />

                    <InputTags
                      label={t("customFieldTypeDetail.customFieldDetailName")}
                      note={t("customFieldTypeDetail.customFieldDetailNameMsg")}
                      selected={customFieldDetailName}
                      setSelected={(e) => {
                        setCustomFieldDetailName(e);
                        setCustomFieldDetailNameError("");
                      }}
                      name="Custom Field Detail Name"
                      isRequired
                      error={customFieldDetailNameError}
                      placeHolder={t("customFieldTypeDetail.customFieldDetailName")}
                    />

                    {/* <Input
                      isRequired
                      label="Custom Field Detail Name"
                      placeholder="Custom Field Detail Name"
                      value={customFieldDetailName}
                      error={customFieldDetailNameError}
                      onChange={(e) => {
                        setCustomFieldDetailName(e.target.value);
                        setCustomFieldDetailNameError("");
                      }}
                    /> */}

                    {/* Buttons */}
                    <div className="flex justify-center gap-7">
                      <Button
                        icon={<CheckIcon />}
                        title={data === null ? t("customFieldTypeDetail.customFieldTypeDetail") : t("customFieldTypeDetail.updateCustomFieldDetail")}
                        type="submit"
                        loading={btnLoading}
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

export default AddCustomFieldDetail;
