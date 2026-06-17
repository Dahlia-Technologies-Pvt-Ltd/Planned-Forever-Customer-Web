import React, { Fragment, useState, useEffect, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, CheckIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import { MinusIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useDropzone } from "react-dropzone";
import countriesCodeData from "../../utilities/countryCode.json";
import ApiServices from "../../api/services";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useThemeContext } from "../../context/GlobalContext";
import { registerSubscriber, assignBulkQrCodes } from "../../api/services/qr_codes";
import Dropdown from "../../components/common/Dropdown";

const QuickImportDisplayText = ({ isOpen, setOpenQuickImportDisplayText, refreshData, contacts, setContacts, setIsOpen}) => {
    const [submittedContacts, setSubmittedContacts] = useState([]);
  const { t } = useTranslation("common");
  //console.log("contacts---------------", contacts);
  const {
    eventSelect,
    btnLoading,
    setBtnLoading,
    openSuccessModal,
    closeSuccessModel,
    //getGroupNames,
    //getFamilyNames,
  } = useThemeContext();
const [spouse, setSpouse] = useState({
    countryCode: ""
});

  const [errorMessage, setErrorMessage] = useState("");
  const [groupOptions, setGroupOptions] = useState([]);
  const [groups, setGroups] = useState("");
  const [openDeleteModal, setOpenDeleteModal] = useState({ open: false, data: null });
  const [openDeleteModalFamily, setOpenDeleteModalFamily] = useState({ open: false, data: null });
  const [options, setOptions] = useState([]);
  const [family, setFamily] = useState("");

  const handleFamilyChange = (selectedOption) => {
    if (selectedOption.value === "add_family") {
      setOpenFamilyModal(true);
    } else {
      setFamily(selectedOption);
    }
  };

  const getFamilyNames = () => {
    const requestData = {
      event_id: eventSelect,
    };
    ApiServices.contact
      .getFamily(requestData)
      .then((res) => {
        const { data, message } = res;
        if (data.code === 200) {
          const familyNames = data?.data?.data?.map((name) => ({ value: name?.id, label: name?.name }));
          setOptions(familyNames);
        }
      })
      .catch((err) => {});
  };

  const handleGroupChange = (selectedOption) => {
    if (selectedOption.value === "add_group") {
      setOpenGroupModal(true);
    } else {
      setGroups(selectedOption);
    }
  };

  const getGroupNames = () => {
    const requestData = {
      event_id: eventSelect,
    };
    ApiServices.contact
      .getGroup(requestData)
      .then((res) => {
        const { data, message } = res;
        if (data.code === 200) {
          const groupNames = data?.data?.data?.map((name) => ({ value: name.id, label: name.name }));
          setGroupOptions(groupNames);
        }
      })
      .catch((err) => {});
  };

  /* ================= HANDLERS ================= */
//  const handleChange = (index, field, value) => {
//   setContacts(prev => {
//     const updated = [...prev];           // new array
//     updated[index] = {
//       ...updated[index],                 // new object
//       [field]: value
//     };
//     return updated;
//   });
// };

const handleChange = (index, field, value) => {
  setContacts(prev => {
    const updated = [...prev];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    return updated;
  });
};

const handleDeleteRow = (index) => {
  setContacts((prev) => prev.filter((_, contactIndex) => contactIndex !== index));
  setErrors((prev) => {
    const nextErrors = {};

    Object.entries(prev).forEach(([key, value]) => {
      const numericKey = Number(key);

      if (numericKey < index) {
        nextErrors[numericKey] = value;
      } else if (numericKey > index) {
        nextErrors[numericKey - 1] = value;
      }
    });

    return nextErrors;
  });
};

useEffect(() => {
  if (isOpen && contacts?.length) {
    setContacts((prev) =>
      prev.map((c) => ({
        ...c,
        country: normalizeCountry(c.country) || "+91",
      })),
    );
  }
}, [isOpen]);

  const handleClose = () => {
    setErrorMessage("");
    setOpenQuickImportDisplayText(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateContacts(contacts);
    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
    }
    setErrors({});
    try {
      setBtnLoading(true);
      // API call placeholder

      // Save a COPY (do NOT mutate contacts)
        setSubmittedContacts([...contacts]);

        const payload = contacts.map(c => ({
            group: c.groups || contacts?.[0]?.groups || null,
            family: c.family || contacts?.[0]?.family || null,
            country: normalizeCountry(c.country) || "+91",
            salutation: c.salutation,
            first_name: c.first_name,
            middle_name: c.middle_name || null,
            last_name: c.last_name,
            email: c.email,
            number: c.number,
            event_id:eventSelect,
            no_of_members: 1,
        }));

        // console.log("Submitting:", payload);return false;
        const response = await ApiServices.contact.AddBulkContact(payload);
        //console.log("data====", data);
        //console.log('data :',response.code);
        //return false;
        if (response?.code === 200 || response?.status === 200)
        {
            setOpenQuickImportDisplayText(false);
            setIsOpen(false);
            openSuccessModal({
                title: "Success!",
                message: response?.message || "Contact imported successfully",
                onClickDone: () => {
                  closeSuccessModel();
                  if (typeof refreshData === "function") {
                    refreshData();
                  }
                },
            }); 
        } 
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || err?.message || "Something went wrong");
    } finally {
      setBtnLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      getGroupNames();
      getFamilyNames();
    }
  }, [isOpen]);

  const generateEmail = (firstName) => {
    if (!firstName) return "";
    const cleanName = firstName.toLowerCase().replace(/\s+/g, "");
    const random = Math.floor(1000 + Math.random() * 9000); // 4-digit number
    return `${cleanName}${random}@yak.com`;
    };



  const handleAutoGenerateEmail = () => {
        setContacts(prev =>
            prev.map(contact => {
            if (!contact.email || contact.email.trim() === "") {
                return {
                ...contact,
                email: generateEmail(contact.first_name),
                };
            }
            return contact;
            })
        );
    };

    const toTitleCase = (value = "") =>
      String(value)
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, (character) => character.toUpperCase());

    const handleAutoFix = () => {
      setContacts((prev) =>
        prev.map((contact) => ({
          ...contact,
          salutation: toTitleCase(contact.salutation),
          first_name: toTitleCase(contact.first_name),
          middle_name: toTitleCase(contact.middle_name),
          last_name: toTitleCase(contact.last_name),
        })),
      );
    };
    //for validation of all fields
    const [errors, setErrors] = useState({});
    const validateContacts = (contacts) => {
        const errors = {};

        contacts.forEach((c, i) => {
            const rowErrors = {};

            if (!c.country) rowErrors.country = "Country required";
            if (!c.number) rowErrors.number = "Number required";
            if (!c.salutation) rowErrors.salutation = "Salutation required";
            if (!c.first_name) rowErrors.first_name = "First name required";
            if (!c.last_name) rowErrors.last_name = "Last name required";
            if (!c.email) rowErrors.email = "Email required";

            // Middle name is OPTIONAL → no validation

            if (Object.keys(rowErrors).length) {
            errors[i] = rowErrors;
            }
        });

        return errors;
    };

  const normalizeCountry = (country) => {
    if (!country) return "";

    // If dropdown object { label, value }
    if (typeof country === "object") {
      return country.value?.startsWith("+")
        ? country.value
        : `+${country.value}`;
    }

    // If number → convert to string
    const str = String(country);

    return str.startsWith("+") ? str : `+${str}`;
  };

  const hasValidationErrors = Object.keys(errors).length > 0;

//console.log(contacts);
//   console.log(contacts[0].groups);
  /* ================= UI ================= */
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <div className="fixed inset-0 bg-black/30" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="relative w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-xl">
            {btnLoading && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/95 backdrop-blur-[1px]">
                <div className="flex flex-col items-center text-center">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-secondary/30 bg-secondary/5">
                    <CheckIcon className="h-7 w-7 text-secondary" />
                    <span className="absolute inset-[-5px] animate-spin rounded-full border-2 border-transparent border-t-secondary" />
                  </div>
                  <p className="mt-4 text-base font-semibold text-black">{t("contacts.importingContacts")}</p>
                  <p className="mt-1 text-sm text-[#667085]">{t("contacts.importingContactsDescription")}</p>
                </div>
              </div>
            )}

            {/* HEADER */}
            <div className="flex items-center justify-between border-b p-5">
              <Dialog.Title className="text-lg font-semibold text-black">
                {t("contacts.addContacts")}
              </Dialog.Title>
              <XMarkIcon className="w-6 h-6 cursor-pointer" onClick={handleClose} />
            </div>

            {/* CONTENT */}
            <div className="p-5 max-h-[75vh] overflow-y-auto">

              {/* Back */}
              <div className="mb-5 flex items-center justify-between gap-4 text-sm font-semibold">
  
                {/* Left side (Back) */}
                <div className="flex items-center gap-2 cursor-pointer">
                    <ArrowLeftIcon
                    className="w-4 h-4"
                    onClick={() => {
                        setIsOpen(true);
                        setOpenQuickImportDisplayText(false);
                    }}
                    />
                    {t("contacts.backArrorw")}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                      title={t("contacts.autoGenerateEmail")}
                    buttonColor="border border-secondary bg-transparent"
                    className="!h-9 !px-4 !text-secondary hover:bg-secondary/5"
                    onClick={handleAutoGenerateEmail}
                  />
                  <Button
                    icon={<SparklesIcon />}
                    title={t("contacts.autoFixCase")}
                    type="button"
                    buttonColor="border border-[#f4a62a] bg-transparent"
                    className="!h-9 !px-4 !text-[#d98200] hover:bg-[#fff8ec] [&_span]:!text-[#d98200]"
                    onClick={handleAutoFix}
                  />
                </div>

                </div>


              {/* TABLE */}
              <div className="mb-4">
                <div className="min-w-[650px] flex gap-6">
                    <div className="flex-1">
                      <Dropdown
                        options={groupOptions}
                        placeholder={t("contacts.selectGroup")}
                        value={
                            groupOptions.find(opt => opt.label === contacts?.[0]?.groups) || null
                          }
                          onChange={(opt) => handleChange(0, "groups", opt.label)}
                        />
                    </div>

                    <div className="flex-1">
                      <Dropdown
                          options={options}
                        placeholder={t("contacts.selectFamily")}
                          value={
                            options.find(opt => opt.label === contacts?.[0]?.family) || null
                          }
                          onChange={(opt) => handleChange(0, "family", opt.label)}
                        />
                    </div>
                </div>
                </div>
                <div className="mb-4 overflow-x-auto">
                    <div className="min-w-[1030px]">
                    {/* HEADER */}
                    <div className="mb-2 grid grid-cols-[110px_140px_90px_150px_125px_150px_190px_44px] gap-2 text-sm font-semibold">
                        <div>{t("contacts.countryCode")}<span className="text-red-500">*</span></div>
                        <div>{t("contacts.contactNumber")}<span className="text-red-500">*</span></div>
                        <div>{t("contacts.salutation")}<span className="text-red-500">*</span></div>
                        <div>{t("contacts.firstName")}<span className="text-red-500">*</span></div>
                        <div>{t("contacts.middleName")}</div>
                        <div>{t("contacts.lastName")}<span className="text-red-500">*</span></div>
                        <div>{t("contacts.email")}<span className="text-red-500">*</span></div>
                        <div>{t("headings.actions")}</div>
                    </div>
                    {/* ROWS */}
                        {contacts.map((c, i) => (
                            <div
                            key={i}
                            className="mb-2 grid grid-cols-[110px_140px_90px_150px_125px_150px_190px_44px] items-center gap-2"
                            >
                            <Dropdown
                              withoutTitle
                              noMargin
                              compact
                              controlMinHeight="36px"
                              withError={errors?.[i]?.country}
                              placeholder={t("contacts.countryCode")}
                              options={countriesCodeData?.countries?.map((country) => ({
                                label: `+${country.callingCodes[0]} ${country.name}`,
                                selectedLabel: `+${country.callingCodes[0]}`,
                                value: `+${country.callingCodes[0]}`,
                              }))}
                              value={
                                countriesCodeData?.countries
                                  ?.map((country) => ({
                                    label: `+${country.callingCodes[0]} ${country.name}`,
                                    selectedLabel: `+${country.callingCodes[0]}`,
                                    value: `+${country.callingCodes[0]}`,
                                  }))
                                  .find((option) => option.value === normalizeCountry(c.country)) || null
                              }
                              onChange={(option) => handleChange(i, "country", option?.value || "")}
                            />
                            
                            <input
                                value={c.number}
                                onChange={(e) => handleChange(i, "number", e.target.value)}
                                placeholder={errors?.[i]?.number || "Enter number"}
                                className={`border rounded px-2 py-1 w-full ${
                                errors?.[i]?.number ? "border-red-500 ring-1 ring-red-500" : ""
                                }`}
                            />
                            
                            <input
                                value={c.salutation}
                                placeholder={errors?.[i]?.salutation || "Enter Salutation"}
                                onChange={(e) => handleChange(i, "salutation", e.target.value)}
                                className={`border rounded px-2 py-1 w-full ${
                                errors?.[i]?.salutation ? "border-red-500 ring-1 ring-red-500" : ""
                                }`}
                            />
                            
                            <input
                                value={c.first_name}
                                placeholder={errors?.[i]?.first_name || "Enter First Name"}
                                onChange={(e) => handleChange(i, "first_name", e.target.value)}
                                className={`border rounded px-2 py-1 w-full ${
                                errors?.[i]?.first_name ? "border-red-500 ring-1 ring-red-500" : ""
                                }`}
                            />
                            
                            <input
                                value={c.middle_name}
                                onChange={(e) => handleChange(i, "middle_name", e.target.value)}
                                className="border rounded px-2 py-1"
                            />

                            <input
                                value={c.last_name}
                                placeholder={errors?.[i]?.last_name || "Enter Last Name"}
                                onChange={(e) => handleChange(i, "last_name", e.target.value)}
                                className={`border rounded px-2 py-1 w-full ${
                                errors?.[i]?.last_name ? "border-red-500 ring-1 ring-red-500" : ""
                                }`}
                            />
                            
                            <input
                                value={c.email}
                                onChange={(e) => handleChange(i, "email", e.target.value)}
                                placeholder={errors?.[i]?.email || "Enter Email"}
                                className={`border rounded px-2 py-1 w-full ${
                                    errors?.[i]?.email ? "border-red-500 ring-1 ring-red-500" : ""
                                    }`}
                            />

                            <button
                                type="button"
                                onClick={() => handleDeleteRow(i)}
                                className="flex h-6 w-6 items-center justify-center rounded-full border border-red-500 bg-transparent text-red-500 transition hover:bg-red-50"
                                aria-label={`Delete row ${i + 1}`}
                            >
                                <MinusIcon className="h-3 w-3" />
                            </button>
                            
                            </div>
                        ))}
                    </div>
              </div>

             

              {/* ERROR */}
              {errorMessage && (
                <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
              )}

              {/* ACTIONS */}
              <div className="mt-5 flex items-center justify-between gap-4">
                {/* <Button
                  icon={<XMarkIcon />}
                  title={t("buttons.cancel")}
                  buttonColor="bg-red-500"
                  onClick={handleClose}
                /> */}
                {hasValidationErrors && (
                  <p className="text-left text-sm font-medium text-red-500">
                    {t("contacts.requiredImportFieldsMessage")}
                  </p>
                )}
                {!hasValidationErrors && <span />}
                <Button
                  icon={<CheckIcon />}
                  title={t("buttons.startImporting")}
                  buttonColor="bg-secondary"
                  onClick={handleSubmit}
                />
              </div>

            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
};

export default QuickImportDisplayText;
