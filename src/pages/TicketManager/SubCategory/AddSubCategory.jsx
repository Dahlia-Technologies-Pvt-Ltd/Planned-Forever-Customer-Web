import React from "react";
import ApiServices from "@api";
import Input from "@components/common/Input";
import Button from "@components/common/Button";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useThemeContext } from "@context";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import Dropdown from "@components/common/Dropdown";
import { useTranslation } from "react-i18next";

const allCustomFieldList = [
  { label: "Select Box", value: "Select Box" },
  { label: "Time Picker", value: "Time Picker" },
];
const allResolverList = [
  { label: "Shahab", value: "Shahab" },
  { label: "Numan", value: "Numan" },
];
const AddSubCategory = ({ isOpen, setIsOpen, refreshData, data, editMode }) => {
  const { t } = useTranslation("common");

  // Context
  const {
    eventSelect,
    btnLoading,
    setBtnLoading,
    allCategoryList,
    openSuccessModal,
    closeSuccessModel,
    getCategoryList,
    getUsers,
    allUsers,
    getCustomFieldLibrary,
    fields,
  } = useThemeContext();

  // useStates
  const [category, setCategory] = useState(null);
  const [subCategory, setSubCategory] = useState("");
  const [customField, setCustomField] = useState([]);
  const [resolver, setResolver] = useState(null);
  const [resolverError, setResolverError] = useState("");
  const [customFieldError, setCustomFieldError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [subCategoryError, setSubCategoryError] = useState("");

  // Form Validation
  const isValidForm = () => {
    let isValidData = true;

    if (category === null) {
      setCategoryError(" Required");
      isValidData = false;
    }

    if (subCategory === "") {
      setSubCategoryError(" Required");
      isValidData = false;
    }

    // if (resolver === null) {
    //   setResolverError("Required");
    //   isValidData = false;
    // }
    // if (customField.length === 0) {
    //   setCustomFieldError(" Required");
    //   isValidData = false;
    // }
    return isValidData;
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidForm()) {
      try {
        setBtnLoading(true);

        let payload = {
          category_id: category?.value,
          name: subCategory,
          resolver_id: resolver?.value,
          type: 1,
          custom_field_library: customField.map((item) => item.value),
          event_id: eventSelect,
        };

        const response =
          data === null
            ? await ApiServices.sub_category.addSubCategory(payload)
            : await ApiServices.sub_category.updateSubCategory(data?.id, payload);

        if (response.data.code === 200) {
          setBtnLoading(false);
          setIsOpen(false);
          refreshData();
          closeModal();
          openSuccessModal({
            title: t("messages.success"),
            message: data === null ? t("subCategory.subCategoryAddedSuccess") : t("subCategory.subCategoryUpdatedSucess"),
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
    setSubCategory("");
    setCategory(null);
    setResolver("");
    setCustomField([]);
    setCategoryError("");
    setBtnLoading(false);
    setSubCategoryError("");
    setResolverError("");
  };

  // Use Effects
  useEffect(() => {
    if (data && editMode && isOpen) {
      setCategory({ label: data?.category?.name, value: data?.category?.id });
      setSubCategory(data?.name);
      setCustomField(
        data?.custom_field_library?.map((tag) => {
          return { label: tag?.name, value: tag?.id };
        }),
      );
      setResolver({ label: data?.resolver?.first_name + " " + data?.resolver?.last_name, value: data?.resolver?.id });
    }
  }, [data, editMode, isOpen]);

  useEffect(() => {
    if (isOpen) {
      getCategoryList();
      getUsers();
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
                      {data === null ? t("subCategory.addSubCategory") : t("subCategory.updateSubCategory")}
                    </Dialog.Title>
                    <XMarkIcon onClick={closeModal} className="h-8 w-8 cursor-pointer text-info-color" />
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-12">
                    <div className="space-y-4">
                      <Dropdown
                        isRequired
                        title={t("subCategory.category")}
                        placeholder={t("subCategory.category")}
                        withError={categoryError}
                        options={allCategoryList}
                        value={category}
                        onChange={(e) => {
                          setCategory(e);
                          setCategoryError("");
                        }}
                      />

                      <Input
                        isRequired
                        label={t("subCategory.subCategory")}
                        placeholder={t("subCategory.subCategory")}
                        value={subCategory}
                        error={subCategoryError}
                        onChange={(e) => {
                          setSubCategory(e.target.value);
                          setSubCategoryError("");
                        }}
                      />

                      <Dropdown
                        isRequired
                        title={t("subCategory.resolver")}
                        placeholder={t("subCategory.resolver")}
                        // withError={resolverError}
                        options={allUsers}
                        value={resolver}
                        onChange={(e) => {
                          setResolver(e);
                          // setResolverError("");
                        }}
                      />
                      <Dropdown
                        isRequired
                        isMulti
                        title={t("subCategory.customField")}
                        placeholder={t("subCategory.customField")}
                        // withError={customFieldError}
                        options={fields}
                        value={customField}
                        onChange={(e) => {
                          setCustomField(e);
                          setCustomFieldError("");
                        }}
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-center gap-7">
                      <Button
                        icon={<CheckIcon />}
                        title={data === null ? t("subCategory.addSubCategory") : t("subCategory.updateSubCategory")}
                        type="submit"
                        loading={btnLoading}
                      />
                      <Button icon={<XMarkIcon />} title={t("button.cancel")} type="button" buttonColor="bg-red-500" onClick={closeModal} />
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

export default AddSubCategory;
