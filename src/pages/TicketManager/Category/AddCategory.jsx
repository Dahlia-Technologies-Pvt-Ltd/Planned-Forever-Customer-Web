import React from "react";
import ApiServices from "@api";
import { useThemeContext } from "@context";
import Input from "@components/common/Input";
import Button from "@components/common/Button";
import Dropdown from "@components/common/Dropdown";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

const allCustomFieldList = [
  { label: "Select Box", value: "Select Box" },
  { label: "Time Picker", value: "Time Picker" },
];

const AddCategory = ({ isOpen, setIsOpen, refreshData, editMode, data }) => {
  const { t } = useTranslation("common");

  //
  // Context
  const { eventSelect, btnLoading, setBtnLoading, openSuccessModal, closeSuccessModel, loading, setLoading, getCustomFieldLibrary, fields } =
    useThemeContext();

  // useStates
  const [category, setCategory] = useState("");
  const [customField, setCustomField] = useState([]);
  const [customFieldError, setCustomFieldError] = useState("");
  const [categoryError, setCategoryError] = useState("");

  // Form Validation
  const isValidForm = () => {
    let isValidData = true;

    if (category === "") {
      setCategoryError(" Required");
      isValidData = false;
    }
    // if (customField.length === 0) {
    //   setCustomFieldError(" Required");
    //   isValidData = false;
    // }

    return isValidData;
  };

  // const [fields, setFields] = useState([]);

  // const getCustomFieldLibrary = async () => {
  //   setLoading(true);

  //   const res = await ApiServices.Custom_Field_Library.getCustomFieldLibrary()
  //     .then((res) => {
  //       const { data, message } = res;

  //       if (data?.code === 200) {
  //         setLoading(false);
  //         const formattedVenues = res.data.data.data.map((venue) => ({
  //           value: venue.id,
  //           label: venue.name,
  //         }));

  //         setFields(formattedVenues);
  //       } else {
  //         setLoading(false);
  //       }
  //     })
  //     .catch((err) => {
  //       setLoading(false);
  //     });
  // };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidForm()) {
      try {
        setBtnLoading(true);

        let payload = {
          name: category,
          type: 1,
          custom_field_library: customField.map((item) => item.value),
          event_id: eventSelect,
        };

        const response =
          data === null ? await ApiServices.category.addCategory(payload) : await ApiServices.category.updateCategory(data?.id, payload);

        if (response.data.code === 200) {
          setBtnLoading(false);
          setIsOpen(false);
          closeModal()
          refreshData();
          openSuccessModal({
            title: t("messages.success"),
            message: data === null ? t("category.categoryAddedSuccess") : t("category.categoryUpdatedSucess"),
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
    setCategory("");
    setBtnLoading(false);
    setCategoryError("");
  };

  // Use Effects
  useEffect(() => {
    if (data && isOpen && editMode) {
      console.log({ data });
      setCategory(data?.name);
      setCustomField(
        data?.custom_field_library?.map((tag) => {
          return { label: tag?.name, value: tag?.id };
        }),
      );
    }
  }, [isOpen, editMode, data]);

  useEffect(() => {
    if (isOpen) {
      getCustomFieldLibrary();
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
                <Dialog.Panel className="w-full max-w-3xl rounded-2xl bg-white p-8 shadow-xl transition-all">
                  <div className="mb-5 flex items-center justify-between">
                    <Dialog.Title as="h3" className="font-poppins text-lg font-semibold leading-7 text-secondary-color">
                      {data === null ? t("category.addCategory") : t("category.updateCategory")}
                    </Dialog.Title>
                    <XMarkIcon onClick={closeModal} className="h-8 w-8 cursor-pointer text-info-color" />
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-12">
                    <div className="space-y-4">
                      <Input
                        isRequired
                        label={t("category.category")}
                        placeholder={t("category.category")}
                        value={category}
                        error={categoryError}
                        onChange={(e) => {
                          setCategory(e.target.value);
                          setCategoryError("");
                        }}
                      />
                      <Dropdown
                        // isRequired
                        isMulti
                        title={t("category.customField")}
                        placeholder={t("category.customField")}
                        // withError={customFieldError}
                        options={fields}
                        value={customField}
                        onChange={(e) => {
                          setCustomField(e);
                          // setCustomFieldError("");
                        }}
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-center gap-7">
                      <Button
                        icon={<CheckIcon />}
                        title={data === null ? t("category.addCategory") : t("category.updateCategory")}
                        type="submit"
                        loading={btnLoading}
                      />
                      <Button
                        icon={<XMarkIcon />}
                        title={t("buttons.cancel")}
                        type="button"
                        buttonColor="bg-red-500"
                        // onClick={() => {
                        //   setIsOpen(false);
                        //   // setModalData(null);
                        //   closeModal();
                        //   setError("");
                        // }}
                        onClick={closeModal}
                      />
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

export default AddCategory;
