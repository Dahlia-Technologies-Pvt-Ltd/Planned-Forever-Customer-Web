import React from "react";
import ApiServices from "@api";
import Input from "@components/common/Input";
import Button from "@components/common/Button";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Dropdown from "@components/common/Dropdown";
import { useThemeContext } from "@context";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

const allCustomFieldList = [
  { label: "Select Box", value: "Select Box" },
  { label: "Time Picker", value: "Time Picker" },
];

const AddFurtherClassification = ({ isOpen, setIsOpen, refreshData, data, editMode }) => {
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
    getCustomFieldLibrary,
    fields,
  } = useThemeContext();

  // useStates
  const [category, setCategory] = useState(null);
  const [subCategory, setSubCategory] = useState(null);
  const [categoryError, setCategoryError] = useState("");
  const [customField, setCustomField] = useState([]);
  const [customFieldError, setCustomFieldError] = useState("");

  const [subCategoryError, setSubCategoryError] = useState("");
  const [allSubCategoryList, setAllSubCategoryList] = useState([]);
  const [furtherClassification, setFurtherClassification] = useState("");
  const [furtherClassificationError, setFurtherClassificationError] = useState("");

  // Form Validation
  const isValidForm = () => {
    let isValidData = true;

    if (category === null) {
      setCategoryError(" Required");
      isValidData = false;
    }

    if (subCategory === null) {
      setSubCategoryError(" Required");
      isValidData = false;
    }

    if (furtherClassification === "") {
      setFurtherClassificationError(" Required");
      isValidData = false;
    }

    // if (customField.length === 0) {
    //   setCustomFieldError(" Required");
    //   isValidData = false;
    // }

    return isValidData;
  };

  // Event handler for Category dropdown change
  const handleCategoryChange = async (selectedCategory) => {
    setCategory(selectedCategory);
    setSubCategory("");
    setCategoryError("");
    await getSubCategoryList(selectedCategory.value);
  };

  // Get Sub Category List
  const getSubCategoryList = async (categoryId) => {
    try {
      const payload = {
        type: 1,
      };
      const response = await ApiServices.sub_category.getSubCategoryByCategory(categoryId, payload);

      if (response.data.code === 200) {
        const formattedSubCategory = response.data.data.map((subcategory) => ({
          value: subcategory.id,
          label: subcategory.name,
        }));

        setAllSubCategoryList(formattedSubCategory);
      }
    } catch (err) {}
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidForm()) {
      try {
        setBtnLoading(true);

        let payload = {
          category_id: category?.value,
          sub_category_id: subCategory?.value,
          name: furtherClassification,
          type: 1,
          custom_field_library: customField.map((item) => item.value),
          event_id: eventSelect,
        };

        const response =
          data === null
            ? await ApiServices.further_classification.addFurtherClassification(payload)
            : await ApiServices.further_classification.updateFurtherClassification(data?.id, payload);

        if (response.data.code === 200) {
          setBtnLoading(false);
          setIsOpen(false);
          closeModal()
          refreshData();
          openSuccessModal({
            title: t("messages.success"),
            message: data === null ? t("classification.furtherClassificationAddedSuccess") : t("classification.furtherClassificationUpdatedSucess"),
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
    setCategory(null);
    setSubCategory(null);
    setCategoryError("");
    setSubCategoryError("");
    setAllSubCategoryList([]);
    setFurtherClassification("");
    setFurtherClassificationError("");
    setCustomField([]);
    setBtnLoading(false);
  };

  // Use Effects
  useEffect(() => {
    if (data && editMode && isOpen) {
      setCategory({ label: data?.sub_category?.category?.name, value: data?.sub_category?.category?.id });
      setSubCategory({ label: data?.sub_category?.name, value: data?.sub_category?.id });
      setFurtherClassification(data?.name);
      setCustomField(
        data?.custom_field_library?.map((tag) => {
          return { label: tag?.name, value: tag?.id };
        }),
      );
    }
  }, [data, editMode, isOpen]);

  useEffect(() => {
    if (isOpen) {
      getCategoryList();
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
                      {data === null ? t("classification.addFurtherClassification") : t("classification.updateFurtherClassification")}
                    </Dialog.Title>
                    <XMarkIcon onClick={closeModal} className="h-8 w-8 cursor-pointer text-info-color" />
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-12">
                    <div className="space-y-4">
                      <Dropdown
                        isRequired
                        title={t("classification.category")}
                        placeholder={t("classification.category")}
                        withError={categoryError}
                        options={allCategoryList}
                        value={category}
                        onChange={(selectedCategory) => handleCategoryChange(selectedCategory)}
                      />

                      <Dropdown
                        isRequired
                        title={t("classification.subCategory")}
                        placeholder={t("classification.subCategory")}
                        withError={subCategoryError}
                        options={allSubCategoryList}
                        value={subCategory}
                        onChange={(e) => {
                          setSubCategory(e);
                          setSubCategoryError("");
                        }}
                      />

                      <Input
                        isRequired
                        label={t("classification.furtherClassification")}
                        placeholder={t("classification.furtherClassification")}
                        value={furtherClassification}
                        error={furtherClassificationError}
                        onChange={(e) => {
                          setFurtherClassification(e.target.value);
                          setFurtherClassificationError("");
                        }}
                      />

                      <Dropdown
                        // isRequired
                        isMulti
                        title={t("classification.customField")}
                        placeholder={t("classification.customField")}
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
                        title={data === null ? t("classification.addFurtherClassification") : t("classification.updateFurtherClassification")}
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

export default AddFurtherClassification;
