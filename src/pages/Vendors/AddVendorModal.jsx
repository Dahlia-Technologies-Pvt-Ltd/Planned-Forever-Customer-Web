import React from "react";
import ApiServices from "../../api/services";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import InputTags from "../../components/common/InputTags";
import { useThemeContext } from "../../context/GlobalContext";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import countriesCodeData from "../../utilities/countryCode.json";
import Dropdown from "../../components/common/Dropdown";
import { VENDORS } from "../../routes/Names";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";


const AddVendorModal = ({ isOpen, setIsOpen, data, refreshData, setModalData, rData }) => {

   const { t } = useTranslation("common");

  // Context
  const { eventSelect,setBtnLoading, btnLoading, openSuccessModal, closeSuccessModel, setErrorMessage, errorMessage } = useThemeContext();

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
  const [secondContactNumber, setSecondContactNumber] = useState({ phone: "", countryCode: "" });

  // Error
  const [addressError, setAddressError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [vendorNoteError, setVendorNoteError] = useState("");
  const [vendorNameError, setVendorNameError] = useState("");
  const [secondNameError, setSecondNameError] = useState("");
  const [selectedValueError, setSelectedValueError] = useState("");
  const [firstDesignationError, setFirstDesignationError] = useState("");
  const [secondDesignationError, setSecondDesignationError] = useState("");
  const [firstContactNumberError, setFirstContactNumberError] = useState("");
  const [secondContactNumberError, setSecondContactNumberError] = useState("");

  const navigate = useNavigate();

  // Validations
  const isValidForm = () => {
    let isValidData = true;
    if (vendorName === "") {
      setVendorNameError(" Required");
      isValidData = false;
    }

    if (address === "") {
      setAddressError(" Required");
      isValidData = false;
    }
    // if (selectedValue.length === 0) {
    //   setSelectedValueError("Required");
    //   isValidData = false;
    // }
    if (firstName === "") {
      setFirstNameError(" Required");
      isValidData = false;
    }
    if (firstDesignation === "") {
      setFirstDesignationError(" Required");
      isValidData = false;
    }
    if (firstContactNumber === "") {
      setFirstContactNumberError(" Required");
      isValidData = false;
    }
    // if (secondName === "") {
    //   setSecondNameError(" Required");
    //   isValidData = false;
    // }
    // if (secondDesignation === "") {
    //   setSecondDesignationError(" Required");
    //   isValidData = false;
    // }
    // if (secondContactNumber === "") {
    //   setSecondContactNumberError(" Required");
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
          // name: vendorName,
          name: rData === null ? vendorName : rData?.name ,
          address,
          first_contact_person_name: firstName,
          first_contact_person_designation: firstDesignation,
          first_contact_person_phone: {
            phone: firstContactNumber?.phone,
            countryCode: firstContactNumber?.countryCode?.value,
          },
          second_contact_person_name: secondName,
          second_contact_person_designation: secondDesignation,
          second_contact_person_phone: {
            phone: secondContactNumber?.phone,
            countryCode: secondContactNumber?.countryCode?.value,
          },
          tags: selectedValue,
          notes: vendorNote,
          event_id: eventSelect,
          recommended_trending_id: rData?.id,
          recommended_trending_type:"recommended"
        };

        const response = await (data === null ? ApiServices.vendors.addVendor(payload) : ApiServices.vendors.updateVendor(data?.id, payload));
        
        {console.log({response})}

        if (response.data.code === 200) {
          setBtnLoading(false);
          setIsOpen(false);
          setModalData(null);
          rData !== null ? navigate(VENDORS) : ""
          clearAllData();
          refreshData();
          openSuccessModal({
            title: t("message.success"),
            message: data === null ?  t("vendor.vendorAddedSuccess") :  t("vendor.vendorUpdatedSucess"),
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
    setAddress("");
    setFirstName("");
    setVendorName("");
    setSecondName("");
    setVendorNote("");
    setSelectedValue([]);
    setFirstDesignation("");
    setSecondDesignation("");
    setFirstContactNumber("");
    setSecondContactNumber("");

    // Error
    setAddressError("");
    setFirstNameError("");
    setVendorNameError("");
    setSecondNameError("");
    setVendorNoteError("");
    setSelectedValueError("");
    setFirstDesignationError("");
    setSecondDesignationError("");
    setFirstContactNumberError("");
    setSecondContactNumberError("");
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
      setAddress(data?.address);
      setFirstName(data?.first_contact_person_name);
      setVendorName(data?.name);
      setSecondName(data?.second_contact_person_name);
      setVendorNote(data?.notes);
      setSelectedValue(data?.tags);
      setFirstDesignation(data?.first_contact_person_designation);
      setSecondDesignation(data?.second_contact_person_designation);
      setFirstContactNumber({
        phone: data?.first_contact_person_phone?.phone,
        countryCode: { label: data?.first_contact_person_phone?.countryCode, value: data?.first_contact_person_phone?.countryCode },
      });
      setSecondContactNumber({
        phone: data?.second_contact_person_phone?.phone,
        countryCode: { label: data?.second_contact_person_phone?.countryCode, value: data?.second_contact_person_phone?.countryCode },
      });
    }
  }, [isOpen]);

  console.log({rData , data})

  useEffect(() => {
    if (rData !== null) {
      setVendorName(rData?.name);
      setAddress(rData?.address);
      setFirstName(rData?.["1st_contact_person_name"]);
      setSecondName(rData?.["2nd_contact_person_name"]);
      setSelectedValue(rData?.tags.map((item) => item?.name));
      setFirstDesignation(rData?.["1st_contact_person_designation"]);
      setSecondDesignation(rData?.["2nd_contact_person_designation"]);
      setFirstContactNumber({
        phone: rData?.["1st_contact_person_contact_number"] ? rData?.["1st_contact_person_contact_number"]?.phone : "",
        countryCode: rData?.["1st_contact_person_contact_number"]?.countryCode ? { label: rData?.["1st_contact_person_contact_number"]?.countryCode, value: rData?.["1st_contact_person_contact_number"]?.countryCode } : "",
      });
      setSecondContactNumber({
        phone: rData?.["2nd_contact_person_contact_number"] ? rData?.["2nd_contact_person_contact_number"]?.phone : "",
        countryCode: rData?.["2nd_contact_person_contact_number"]?.countryCode ? { label: rData?.["2nd_contact_person_contact_number"]?.countryCode, value: rData?.["2nd_contact_person_contact_number"]?.countryCode } : "",
      });
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
                      {data === null ? t("vendor.addVendor") : t("vendor.updateVendor")}
                    </Dialog.Title>
                    <XMarkIcon onClick={() => setIsOpen(false)} className="h-8 w-8 cursor-pointer text-info-color" />
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className=" h-[450px] overflow-y-auto p-2">
                      <div className="mb-5 text-left ">
                        <h2 className="label mb-2 text-secondary">{t("headings.basicInfo")}</h2>
                      </div>

                      <div className="grid grid-cols-2 gap-7">
                        <Input
                          isRequired
                          error={vendorNameError}
                          label={t("vendor.vendorName")}
                          placeholder="Vendor Name"
                          value={rData === null ? vendorName : rData?.name }
                          onChange={(e) => setVendorName(e.target.value)}
                          disabled={(rData === null && data?.recommend_trending_venue === "recommended") ? true : false}
                        />
                        <Input
                          isRequired
                          error={addressError}
                          label={t("vendor.address")}
                          placeholder="Address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </div>

                      <div className="mb-5 mt-5 rtl:text-right ltr:text-left ">
                        <h2 className="label mb-2 text-secondary">{t("vendor.1stContactPerson")}</h2>
                      </div>

                      <div className="grid grid-cols-4 gap-7">
                        <Input
                          isRequired
                          error={firstNameError}
                          label={t("vendor.name")}
                          placeholder="Name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                        <Input
                          isRequired
                          error={firstDesignationError}
                          label={t("vendor.designation")}
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
                          title={t("vendor.countryCode")}
                          // withError={contactNumberError}
                        />
                        <Input
                          isRequired
                          error={firstContactNumberError}
                          label={t("vendor.contactNumber")}
                          placeholder="Contact Number"
                          value={firstContactNumber.phone}
                          onChange={(e) => setFirstContactNumber({ ...firstContactNumber, phone: e.target.value })}
                        />
                      </div>

                      <div className="mb-5 mt-5 rtl:text-right ltr:text-left ">
                        <h2 className="label mb-2 text-secondary">{t("vendor.2ndContactPerson")}</h2>
                      </div>
                      <div className="grid grid-cols-4 gap-7">
                        <Input
                          // isRequired
                          error={secondNameError}
                          label={t("vendor.name")}
                          placeholder="Name"
                          value={secondName}
                          onChange={(e) => setSecondName(e.target.value)}
                        />
                        <Input
                          // isRequired
                          error={secondDesignationError}
                          label={t("vendor.designation")}
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
                          title={t("vendor.countryCode")}
                          // withError={contactNumberError}
                        />
                        <Input
                          // isRequired
                          error={secondContactNumberError}
                          label={t("vendor.contactNumber")}
                          placeholder="Contact Number"
                          value={secondContactNumber.phone}
                          onChange={(e) => setSecondContactNumber({ ...secondContactNumber, phone: e.target.value })}
                        />
                      </div>

                      <div className="mb-5 mt-5 rtl:text-right ltr:text-left ">
                        <h2 className="label mb-2 text-secondary">{t("headings.otherInfo")}</h2>
                      </div>
                      <div className="mt-5">
                        <InputTags
                          label={t("vendor.tags")}
                          selected={selectedValue}
                          setSelected={setSelectedValue}
                          name="tags"
                          // isRequired
                          error={selectedValueError}
                        />
                      </div>
                      <div className="mt-5">
                        <Input
                          // isRequired
                          error={vendorNoteError}
                          label={t("vendor.vendorNote")}
                          placeholder="Vendor Note"
                          textarea
                          value={vendorNote}
                          onChange={(e) => setVendorNote(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Error Message */}
                    <div className="justify-centere flex">
                      <p className="text-sm text-red-500">{errorMessage}</p>
                    </div>

                    <div className="mx-auto mt-10 grid w-8/12 grid-cols-2 gap-7">
                      <Button icon={<CheckIcon />} title={data === null ? t("vendor.addVendor") : t("vendor.updateVendor") } type="submit" loading={btnLoading} />
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

export default AddVendorModal;
