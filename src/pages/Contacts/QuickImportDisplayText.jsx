import React, { Fragment, useState, useEffect, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, CheckIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import { useDropzone } from "react-dropzone";
import countriesCodeData from "../../utilities/countryCode.json";
import ApiServices from "../../api/services";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useThemeContext } from "../../context/GlobalContext";
import { registerSubscriber, assignBulkQrCodes } from "../../api/services/qr_codes";

const QuickImportDisplayText = ({ isOpen, setOpenQuickImportDisplayText, refreshData, contacts, setContacts, setIsOpen}) => {
    const [submittedContacts, setSubmittedContacts] = useState([]);
  const { t } = useTranslation("common");
  console.log("contacts---------------", contacts);
  const {
    eventSelect,
    btnLoading,
    setBtnLoading,
    openSuccessModal,
    closeSuccessModel,
    getGroupNames,
    getFamilyNames,
  } = useThemeContext();
const [spouse, setSpouse] = useState({
    countryCode: ""
});

  const [errorMessage, setErrorMessage] = useState("");

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

useEffect(() => {
  if (contacts?.length) {
    setContacts(prev =>
      prev.map(c => ({
        ...c,
        country: c.country || "+91"
      }))
    );
  }
}, []);

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
            group: c.groups || null,
            family: c.family || null,
            country: c.country,
            salutation: c.salutation,
            first_name: c.first_name,
            middle_name: c.middle_name || null,
            last_name: c.last_name,
            email: c.email,
            number: c.number,
            event_id:eventSelect
        }));

        // console.log("Submitting:", payload);
        const response = await ApiServices.contact.AddBulkContact(payload);
        //console.log("data====", data);
        //console.log('data :',response.code);
        //return false;
        if(response.code === 200)
        {
            setOpenQuickImportDisplayText(false);
            openSuccessModal({
                title: "Success!",
                message: response.message,
                onClickDone: closeSuccessModel,
            }); 
            window.location.reload();
        } 
    } catch (err) {
      setErrorMessage("Something went wrong");
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

//   console.log(contacts[0].groups);
  /* ================= UI ================= */
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <div className="fixed inset-0 bg-black/30" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-xxl bg-white rounded-2xl shadow-xl">

            {/* HEADER */}
            <div className="p-5 border-b flex justify-between items-center">
              <Dialog.Title className="text-lg font-semibold">
                {t("contacts.addContacts")}
              </Dialog.Title>
              <XMarkIcon className="w-6 h-6 cursor-pointer" onClick={handleClose} />
            </div>

            {/* CONTENT */}
            <div className="p-5 max-h-[75vh] overflow-y-auto">

              {/* Back */}
              <div className="flex items-center justify-between text-sm font-semibold mb-4">
  
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

                {/* Right side (Button) */}
                <Button
                    title="Auto Generate Email"
                    buttonColor="bg-blue-500"
                    onClick={handleAutoGenerateEmail}
                />

                </div>


              {/* TABLE */}
              <div className="overflow-x-auto mb-4">
                <div className="min-w-[650px] flex gap-6">
                    
                    <div className="flex-1">
                    <Input
                        type="text"
                        label={t("contacts.groups")}
                        placeholder="Enter group name"
                        className="border rounded px-2 py-1 w-full"
                        value={contacts?.[0]?.groups || ""}
                        onChange={(e) =>
                        handleChange(0, "groups", e.target.value)
                        }
                    />
                    </div>

                    <div className="flex-1">
                    <Input
                        type="text"
                        label={t("contacts.family")}
                        placeholder="Enter family name"
                        className="border rounded px-2 py-1 w-full"
                        value={contacts?.[0]?.family || ""}
                        onChange={(e) =>
                        handleChange(0, "family", e.target.value)
                        }
                    />
                    </div>

                </div>
                </div>
                <div className="overflow-x-auto mb-4">
                    <div className="min-w-[950px]">
                    {/* HEADER */}
                    <div className="grid grid-cols-[40px_120px_140px_120px_1fr_1fr_1fr_1fr] gap-2 text-sm font-semibold mb-2">
                        <div>#</div>
                        <div>{t("contacts.countryCode")}<span className="text-red-500">*</span></div>
                        <div>{t("contacts.contactNumber")}<span className="text-red-500">*</span></div>
                        <div>{t("contacts.salutation")}<span className="text-red-500">*</span></div>
                        <div>{t("contacts.firstName")}<span className="text-red-500">*</span></div>
                        <div>{t("contacts.middleName")}</div>
                        <div>{t("contacts.lastName")}<span className="text-red-500">*</span></div>
                        <div>{t("contacts.email")}<span className="text-red-500">*</span></div>
                    </div>
                    {/* ROWS */}
                        {contacts.map((c, i) => (
                            <div
                            key={i}
                            className="grid grid-cols-[40px_120px_140px_120px_1fr_1fr_1fr_1fr] gap-2 mb-2 items-center"
                            >
                            <div>{i + 1}</div>

                            <select
                                value={c.country}
                                onChange={(e) => handleChange(i, "country", e.target.value)}
                                className={`border rounded px-2 py-1 w-full ${
                                errors?.[i]?.country ? "border-red-500" : ""
                                }`}
                            >
                            <option value="">
                                {errors?.[i]?.country ? errors[i].country : "Select Country Code"}
                            </option>
                                {countriesCodeData?.countries?.map((country, index) => (
                                <option key={index} value={`+${country.callingCodes[0]}`}>
                                    +{country.callingCodes[0]} {country.name}
                                </option>
                                ))}
                            </select>
                            
                            <input
                                value={c.number}
                                onChange={(e) => handleChange(i, "number", e.target.value)}
                                placeholder={errors?.[i]?.number || "Enter number"}
                                className={`border rounded px-2 py-1 w-full ${
                                errors?.[i]?.first_name ? "border-red-500" : ""
                                }`}
                            />
                            
                            <input
                                value={c.salutation}
                                placeholder={errors?.[i]?.salutation || "Enter Salutation"}
                                onChange={(e) => handleChange(i, "salutation", e.target.value)}
                                className={`border rounded px-2 py-1 w-full ${
                                errors?.[i]?.salutation ? "border-red-500" : ""
                                }`}
                            />
                            
                            <input
                                value={c.first_name}
                                placeholder={errors?.[i]?.first_name || "Enter First Name"}
                                onChange={(e) => handleChange(i, "first_name", e.target.value)}
                                className={`border rounded px-2 py-1 w-full ${
                                errors?.[i]?.first_name ? "border-red-500" : ""
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
                                errors?.[i]?.last_name ? "border-red-500" : ""
                                }`}
                            />
                            
                            <input
                                value={c.email}
                                onChange={(e) => handleChange(i, "email", e.target.value)}
                                placeholder={errors?.[i]?.email || "Enter Email"}
                                className={`border rounded px-2 py-1 w-full ${
                                    errors?.[i]?.email ? "border-red-500" : ""
                                    }`}
                            />
                            
                            </div>
                        ))}
                    </div>
              </div>

             

              {/* ERROR */}
              {errorMessage && (
                <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
              )}

              {/* ACTIONS */}
              <div className="grid grid-cols-1 gap-2 mt-5 float-right">
                {/* <Button
                  icon={<XMarkIcon />}
                  title={t("buttons.cancel")}
                  buttonColor="bg-red-500"
                  onClick={handleClose}
                /> */}
                <Button
                  icon={<CheckIcon />}
                  title={t("buttons.startImporting")}
                  buttonColor="bg-green-500 float-right"
                  loading={btnLoading}
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
