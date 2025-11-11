import React from "react";
import ApiServices from "../../../api/services";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import InputTags from "../../../components/common/InputTags";
import { useThemeContext } from "../../../context/GlobalContext";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import countriesCodeData from "../../../utilities/countryCode.json";
import Dropdown from "../../../components/common/Dropdown";
import { useAsyncError } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AddVendorModal = ({ isOpen, setIsOpen, data, refreshData, setModalData }) => {

  const { t: commonT } = useTranslation("common");

  // Context
  const {
    eventSelect,
    setBtnLoading,
    btnLoading,
    openSuccessModal,
    closeSuccessModel,
    setErrorMessage,
    errorMessage,
    allType2CategoryList,
    getType2CategoryList,
  } = useThemeContext();

  // useStates
  const [address, setAddress] = useState("");
  const [firstName, setFirstName] = useState("");
  const [vendorNote, setVendorNote] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [selectedValue, setSelectedValue] = useState([]);
  const [firstDesignation, setFirstDesignation] = useState("");
  const [secondDesignation, setSecondDesignation] = useState("");
  const [firstContactNumber, setFirstContactNumber] = useState({ phone: "", countryCode: "" });
  const [firstContactNumberWhatsapp, setFirstContactNumberWhatsapp] = useState({ phone: "", countryCode: "" });
  const [secondContactNumber, setSecondContactNumber] = useState({ phone: "", countryCode: "" });
  const [secondContactNumberWhatsapp, setSecondContactNumberWhatsapp] = useState({ phone: "", countryCode: "" });
  const [vendorContact, setVendorContact] = useState({ phone: "", countryCode: "" });
  const [tagError, setTagError] = useState("");

  // Error
  const [addressError, setAddressError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [vendorNoteError, setVendorNoteError] = useState("");
  const [vendorNameError, setVendorNameError] = useState("");
  const [secondNameError, setSecondNameError] = useState("");
  const [selectedValueError, setSelectedValueError] = useState("");
  const [firstDesignationError, setFirstDesignationError] = useState("");
  const [secondDesignationError, setSecondDesignationError] = useState("");
  const [firstContactNumberErrorDrop, setFirstContactNumberErrorDrop] = useState("");
  const [firstContactNumberErrorInput, setFirstContactNumberErrorInput] = useState("");
  const [secondContactNumberError, setSecondContactNumberError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [subCategoryError, setSubCategoryError] = useState("");
  const [furtherClassificationError, setFurtherClassificationError] = useState("");
  const [category, setCategory] = useState("");
  const [allSubCategoryList, setAllSubCategoryList] = useState([]);
  const [allClassificationList, setAllClassificatioinList] = useState([]);
  const [subCategory, setSubCategory] = useState("");
  const [furtherClassification, setFurtherClassification] = useState("");
  const [emailError, setEmailError] = useState("");
  const [contactErrorDrop, setContactErrorDrop] = useState("");
  const [contactErrorInput, setContactErrorInput] = useState("");
  const [selectedItem, setSelectedItem] = useState([]);
  const [allTags, setAllTags] = useState([]);

  // Validations
  const isValidForm = () => {
    let isValidData = true;

    if (selectedItem.length === 0) {
      setTagError("Required");
      isValidData = false;
    }

    if (vendorContact?.countryCode === "") {
      setContactErrorDrop("Required");
      isValidData = false;
    } else {
      setContactErrorDrop("");
    }

    if (vendorContact?.phone === "") {
      setContactErrorInput("Required");
      isValidData = false;
    } else {
      setContactErrorInput("");
    }
    if (firstContactNumberWhatsapp?.countryCode === "") {
      setFirstContactNumberErrorDrop("Required");
      isValidData = false;
    } else {
      setFirstContactNumberErrorDrop("");
    }
    if (firstContactNumberWhatsapp?.phone === "") {
      setFirstContactNumberErrorInput("Required");
      isValidData = false;
    } else {
      setFirstContactNumberErrorInput("");
    }
    if (category === "") {
      setCategoryError("Required");
      isValidData = false;
    }
    if (subCategory === "") {
      setSubCategoryError("Required");
      isValidData = false;
    }
    if (furtherClassification === "") {
      setFurtherClassificationError("Required");
      isValidData = false;
    }
    if (vendorEmail === "") {
      setEmailError("Required");
      isValidData = false;
    }
    if (vendorName === "") {
      setVendorNameError(" Required");
      isValidData = false;
    }

    if (firstName === "") {
      setFirstNameError(" Required");
      isValidData = false;
    }

    return isValidData;
  };

  // Event handler for Category dropdown change
  const handleCategoryChange = async (selectedCategory) => {
    setCategory(selectedCategory);
    setSubCategory("");
    setFurtherClassification("");
    setCategoryError("");
    await getSubCategoryList(selectedCategory.value);
  };

  const handleSubCategoryChange = async (selectedSubCategory) => {
    setSubCategory(selectedSubCategory);
    setSubCategoryError("");
    await getFurtherClassification(selectedSubCategory);
  };

  // Get Sub Category List
  const getSubCategoryList = async (categoryId) => {
    try {
      const payload = {
        type: 2,
        event_id : eventSelect
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

  const getFurtherClassification = async (selectedSubCategory) => {
    if (selectedSubCategory?.value) {
      try {
        let payload = {
          // category_id: category?.value,
          sub_category_id: selectedSubCategory?.value,
          type: 2,
          // event_id : eventSelect
        };

        const response = await ApiServices.further_classification.addFurtherClassificationByIds(payload);

        if (response.data.code === 200) {
          const formattedSubCategory = response.data.data.map((subcategory) => ({
            value: subcategory.id,
            label: subcategory.name,
          }));

          setAllClassificatioinList(formattedSubCategory);
        } else {
        }
      } catch (err) {
        console.error("Error:", err);
      }
    }
  };

  const getTags = async () => {
    let payload = {
      quick_contact: 1,
      event_id : eventSelect
    };
    const res = await ApiServices.Vendor_Tags.getVendorTags(payload)
      .then((res) => {
        const { data, message } = res;

        if (data?.code === 200) {
          const formattedSubCategory = data.data.data.map((subcategory) => ({
            value: subcategory.id,
            label: subcategory.name,
          }));

          setAllTags(formattedSubCategory);
        } else {
        }
      })
      .catch((err) => {});
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidForm()) {
      try {
        setBtnLoading(true);

        let payload = {
          name: vendorName,
          email: vendorEmail,
          address: address,
          contact: {
            phone: vendorContact?.phone,
            countryCode: vendorContact?.countryCode.value,
          },

          "1st_contact_person_name": firstName,
          "1st_contact_person_designation": firstDesignation,
          "1st_contact_person_contact_number": {
            phone: firstContactNumber?.phone,
            countryCode: firstContactNumber?.countryCode.value,
          },

          "1st_contact_person_whats_app_number": {
            phone: firstContactNumberWhatsapp?.phone,
            countryCode: firstContactNumberWhatsapp?.countryCode.value,
          },
          "2nd_contact_person_name": secondName,
          "2nd_contact_person_designation": secondDesignation,
          "2nd_contact_person_contact_number": {
            phone: secondContactNumber?.phone,
            countryCode: secondContactNumber?.countryCode.value,
          },
          "2nd_contact_person_whats_app_number": {
            phone: secondContactNumberWhatsapp?.phone,
            countryCode: secondContactNumberWhatsapp?.countryCode.value,
          },
          category_id: category?.value,
          sub_category_id: subCategory?.value,
          classification_id: furtherClassification?.value,
          tag_id: selectedItem.map((item) => item.value),
          event_id : eventSelect
        };

        const response = await (data === null
          ? ApiServices.vendors.addRecommandedVendor(payload)
          : ApiServices.vendors.updateRecommandedVendor(data?.id, payload));

        if (response.data.code === 200) {
          setBtnLoading(false);
          setIsOpen(false);
          setModalData(null);
          clearAllData();
          refreshData();
          openSuccessModal({
            title: "Success!",
            message: data === null ? "Vendor has been added successfully" : "Vendor has been updated successfully",
            onClickDone: (close) => {
              closeSuccessModel();
            },
          });
        } else {
          setBtnLoading(false);
        }
      } catch (err) {
        setErrorMessage(err?.response?.data?.message);
        setBtnLoading(false);
      }
    } else {
    }
  };

  // Clear States
  const clearAllData = () => {
    console.log("close");
    setAddress("");
    setFirstName("");
    setVendorName("");
    setSecondName("");
    setFirstDesignation("");
    setSecondDesignation("");
    setFirstContactNumber({ phone: "", countryCode: "" });
    setSecondContactNumber({ phone: "", countryCode: "" });
    SetVendorEmail("");
    setFirstContactNumberWhatsapp({ phone: "", countryCode: "" });
    setSecondContactNumberWhatsapp("");
    setCategory("");
    setSubCategory("");
    setFurtherClassification("");
    setSelectedItem([]);
    setVendorContact({ phone: "", countryCode: "" });

    // Error
    setAddressError("");
    setFirstNameError("");
    setVendorNameError("");
    setSecondNameError("");
    setFirstDesignationError("");
    setSecondDesignationError("");
    setFirstContactNumberErrorInput("");
    setFirstContactNumberErrorDrop("");
    setSecondContactNumberError("");
    setCategoryError("");
    setSubCategoryError("");
    setFurtherClassificationError("");
    setEmailError("");
    setContactErrorInput("");
    setContactErrorDrop("");
    setTagError("");
  };

  const [vendorEmail, SetVendorEmail] = useState("");

  // Use Effects
  useEffect(() => {
    if (data !== null) {
      setCategory({ label: data?.category.name, value: data?.category_id });
      setSubCategory({ label: data?.sub_category?.name, value: data?.sub_category?.id });
      setFurtherClassification({ label: data?.classification?.name, value: data?.classification_id });
      setSelectedItem(
        data?.tags?.map((tag) => {
          return { label: tag?.name, value: tag?.id };
        }),
      );
      SetVendorEmail(data?.email);
      setVendorContact({ phone: data?.contact?.phone, countryCode: { label: data?.contact?.countryCode, value: data?.contact?.countryCode } });
      setAddress(data?.address);
      setFirstName(data?.["1st_contact_person_name"]);
      setVendorName(data?.name);
      setSecondName(data?.["2nd_contact_person_name"]);
      setFirstDesignation(data?.["1st_contact_person_designation"]);
      setSecondDesignation(data?.["2nd_contact_person_designation"]);
      setFirstContactNumber({
        phone: data?.["1st_contact_person_contact_number"]?.phone,
        countryCode: {
          label: data?.["1st_contact_person_contact_number"]?.countryCode,
          value: data?.["1st_contact_person_contact_number"]?.countryCode,
        },
      });
      setFirstContactNumberWhatsapp({
        phone: data?.["1st_contact_person_whats_app_number"]?.phone,
        countryCode: {
          label: data?.["1st_contact_person_whats_app_number"]?.countryCode,
          value: data?.["1st_contact_person_whats_app_number"]?.countryCode,
        },
      });
      setSecondContactNumber({
        phone: data?.["2nd_contact_person_contact_number"]?.phone,
        countryCode: {
          label: data?.["2nd_contact_person_contact_number"]?.countryCode,
          value: data?.["2nd_contact_person_contact_number"]?.countryCode,
        },
      });
      setSecondContactNumberWhatsapp({
        phone: data?.["2nd_contact_person_whats_app_number"]?.phone,
        countryCode: {
          label: data?.["2nd_contact_person_whats_app_number"]?.countryCode,
          value: data?.["2nd_contact_person_whats_app_number"]?.countryCode,
        },
      });
    }
  }, [isOpen]);

  console.log({ data });

  const closeModal = () => {
    setIsOpen(false);
    clearAllData();
    setBtnLoading(false);
    setModalData(null);
  };

  useEffect(() => {
    if (isOpen) {
      getType2CategoryList();
      getTags();
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
            <div className="flex min-h-full items-center justify-center p-4 ">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-75"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-75"
              >
                <Dialog.Panel className="w-full max-w-7xl overflow-hidden rounded-2xl bg-white p-8 shadow-xl transition-all">
                  <div className="mb-5 flex items-center justify-between">
                    <Dialog.Title as="h3" className="font-poppins text-lg font-semibold leading-7 text-secondary-color">
                      {data === null ? "Add New Vendor" : "Update Vendor"}
                    </Dialog.Title>
                    <XMarkIcon onClick={closeModal} className="h-8 w-8 cursor-pointer text-info-color" />
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className=" h-[450px] overflow-y-auto p-2">
                      <div className="mb-5 text-left ">
                        <h2 className="label mb-2 text-secondary">Select Vendor Type</h2>
                      </div>

                      <div className="mb-5 grid grid-cols-2 gap-7">
                        <Dropdown
                          isSearchable
                          options={allType2CategoryList}
                          placeholder="Category"
                          title="Category"
                          value={category}
                          onChange={(selectedCategory) => handleCategoryChange(selectedCategory)}
                          withError={categoryError}
                          isRequired
                        />
                        <Dropdown
                          isSearchable
                          options={allSubCategoryList}
                          placeholder="Sub Category"
                          title="Sub Category"
                          value={subCategory}
                          onChange={(selectedSubCategory) => handleSubCategoryChange(selectedSubCategory)}
                          withError={subCategoryError}
                          isRequired
                        />
                        <Dropdown
                          isSearchable
                          options={allClassificationList}
                          placeholder="Further Classification"
                          value={furtherClassification}
                          onChange={(e) => {
                            setFurtherClassification(e);
                            setFurtherClassificationError("");
                          }}
                          title="Further Classification"
                          withError={furtherClassificationError}
                          isRequired
                        />
                        <Dropdown
                          isRequired
                          placeholder="Tags"
                          options={allTags}
                          value={selectedItem}
                          onChange={(e) => {
                            setSelectedItem(e);
                            setTagError("");
                          }}
                          title="Tags"
                          isMulti
                          withError={tagError}
                        />
                      </div>

                      <div className="mb-5 text-left ">
                        <h2 className="label mb-2 text-secondary">{commonT('headings.basicInfo')}</h2>
                      </div>

                      <div className="grid grid-cols-2 gap-7">
                        <Input
                          isRequired
                          error={vendorNameError}
                          label="Vendor Name"
                          placeholder="Vendor Name"
                          value={vendorName}
                          onChange={(e) => {
                            setVendorName(e.target.value);
                            setVendorNameError("");
                          }}
                        />
                        <Input
                          error={emailError}
                          isRequired
                          label="Vendor Email"
                          placeholder="Vendor Email"
                          value={vendorEmail}
                          onChange={(e) => {
                            SetVendorEmail(e.target.value);
                            setEmailError("");
                          }}
                        />
                        <Dropdown
                          isSearchable
                          options={countriesCodeData?.countries.map((country) => ({
                            label: `+${country?.callingCodes[0]} ${country?.name}`,
                            value: `+${country?.callingCodes[0]} ${country?.name}`,
                          }))}
                          placeholder="Country Code"
                          value={vendorContact.countryCode}
                          onChange={(e) => {
                            setVendorContact({ ...vendorContact, countryCode: e });
                            setContactErrorDrop("");
                          }}
                          isRequired
                          title="Country Code"
                          withError={contactErrorDrop}
                        />
                        <Input
                          isRequired
                          error={contactErrorInput}
                          label="Vendor Contact Number"
                          placeholder="Contact Number"
                          value={vendorContact.phone}
                          onChange={(e) => {
                            setVendorContact({ ...vendorContact, phone: e.target.value });
                            setContactErrorInput("");
                          }}
                        />
                        <Input
                          error={addressError}
                          label="Address"
                          placeholder="Address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </div>

                      <div className="mb-5 mt-5 text-left ">
                        <h2 className="label mb-2 text-secondary">1st Contact Person</h2>
                      </div>

                      <div className="grid grid-cols-4 gap-7">
                        <Input
                          isRequired
                          error={firstNameError}
                          label="Name"
                          placeholder="Name"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            setFirstNameError("");
                          }}
                        />
                        <Input
                          error={firstDesignationError}
                          label="Designation"
                          placeholder="Designation"
                          value={firstDesignation}
                          onChange={(e) => setFirstDesignation(e.target.value)}
                        />
                        <Dropdown
                          isSearchable
                          options={countriesCodeData?.countries.map((country) => ({
                            label: `+${country.callingCodes[0]} ${country.name}`,
                            value: `+${country.callingCodes[0]} ${country.name}`,
                          }))}
                          placeholder="Country Code"
                          value={firstContactNumber.countryCode}
                          onChange={(e) => setFirstContactNumber({ ...firstContactNumber, countryCode: e })}
                          title="Country Code"
                        />
                        <Input
                          isRequired
                          label="Contact Number"
                          placeholder="Contact Number"
                          value={firstContactNumber.phone}
                          onChange={(e) => setFirstContactNumber({ ...firstContactNumber, phone: e.target.value })}
                        />

                        <Dropdown
                          isSearchable
                          options={countriesCodeData?.countries.map((country) => ({
                            label: `+${country.callingCodes[0]} ${country.name}`,
                            value: `+${country.callingCodes[0]} ${country.name}`,
                          }))}
                          placeholder="Country Code"
                          value={firstContactNumberWhatsapp.countryCode}
                          onChange={(e) => {
                            setFirstContactNumberWhatsapp({ ...firstContactNumberWhatsapp, countryCode: e });
                            setFirstContactNumberErrorDrop("");
                          }}
                          title="Country Code"
                          withError={firstContactNumberErrorDrop}
                          isRequired
                        />
                        <Input
                          isRequired
                          error={firstContactNumberErrorInput}
                          label="Whatsapp Number"
                          placeholder="Contact Number"
                          value={firstContactNumberWhatsapp.phone}
                          onChange={(e) => {
                            setFirstContactNumberWhatsapp({ ...firstContactNumberWhatsapp, phone: e.target.value });
                            setFirstContactNumberErrorInput("");
                          }}
                        />
                      </div>

                      <div className="mb-5 mt-5 text-left ">
                        <h2 className="label mb-2 text-secondary">2nd Contact Person</h2>
                      </div>
                      <div className="grid grid-cols-4 gap-7">
                        <Input
                          error={secondNameError}
                          label="Name"
                          placeholder="Name"
                          value={secondName}
                          onChange={(e) => setSecondName(e.target.value)}
                        />
                        <Input
                          error={secondDesignationError}
                          label="Designation"
                          placeholder="Designation"
                          value={secondDesignation}
                          onChange={(e) => setSecondDesignation(e.target.value)}
                        />
                        <Dropdown
                          isSearchable
                          options={countriesCodeData?.countries.map((country) => ({
                            label: `+${country.callingCodes[0]} ${country.name}`,
                            value: `+${country.callingCodes[0]} ${country.name}`,
                          }))}
                          placeholder="Country Code"
                          value={secondContactNumber.countryCode}
                          onChange={(e) => setSecondContactNumber({ ...secondContactNumber, countryCode: e })}
                          title="Country Code"
                        />
                        <Input
                          error={secondContactNumberError}
                          label="Contact Number"
                          placeholder="Contact Number"
                          value={secondContactNumber.phone}
                          onChange={(e) => setSecondContactNumber({ ...secondContactNumber, phone: e.target.value })}
                        />
                        <Dropdown
                          isSearchable
                          options={countriesCodeData?.countries.map((country) => ({
                            label: `+${country.callingCodes[0]} ${country.name}`,
                            value: `+${country.callingCodes[0]} ${country.name}`,
                          }))}
                          placeholder="Country Code"
                          value={secondContactNumberWhatsapp.countryCode}
                          onChange={(e) => setSecondContactNumberWhatsapp({ ...secondContactNumberWhatsapp, countryCode: e })}
                          title="Country Code"
                        />
                        <Input
                          error={secondContactNumberError}
                          label="Whatsapp Number"
                          placeholder="Contact Number"
                          value={secondContactNumberWhatsapp.phone}
                          onChange={(e) => setSecondContactNumberWhatsapp({ ...secondContactNumberWhatsapp, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Error Message */}
                    <div className="justify-centere flex">
                      <p className="text-sm text-red-500">{errorMessage}</p>
                    </div>

                    <div className="mx-auto mt-10 grid w-8/12 grid-cols-2 gap-7">
                      <Button icon={<CheckIcon />} title={data === null ? "Add New Vendor" : "Update Vendor"} type="submit" loading={btnLoading} />
                      <Button icon={<XMarkIcon />} title="Cancel" type="button" buttonColor="bg-red-500" onClick={closeModal} />
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

export default AddVendorModal;
